import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { generateEmbedding } from '../lib/qdrant/embeddings';
import { uploadPoint, createCollection, getCollections } from '../lib/qdrant/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if API keys are set
const qdrantApiKey = process.env.QDRANT_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!qdrantApiKey) {
  console.error('Error: QDRANT_API_KEY is not set in .env file');
  process.exit(1);
}

if (!openaiApiKey) {
  console.error('Error: OPENAI_API_KEY is not set in .env file');
  process.exit(1);
}

// Maximum tokens per chunk (keeping well below the 8192 limit)
const MAX_TOKENS_PER_CHUNK = 1000; // Even smaller chunks for this large file

// Approximate tokens per character (this is a rough estimate)
const TOKENS_PER_CHAR = 0.25;

/**
 * Split text into smaller chunks
 * @param text - Text to split
 * @param maxChars - Maximum characters per chunk
 * @returns Array of text chunks
 */
const splitTextIntoChunks = (text: string, maxChars: number): string[] => {
  const chunks: string[] = [];
  
  // First split by paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  
  // Process each paragraph
  for (const paragraph of paragraphs) {
    // If paragraph is already small enough, add it as a chunk
    if (paragraph.length <= maxChars) {
      chunks.push(paragraph);
    } else {
      // Split paragraph into sentences
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      
      let currentChunk = '';
      
      // Process each sentence
      for (const sentence of sentences) {
        // If adding this sentence would exceed the max chars, start a new chunk
        if (currentChunk.length + sentence.length > maxChars && currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = sentence;
        } else {
          // Otherwise, add to the current chunk
          if (currentChunk.length > 0) {
            currentChunk += ' ';
          }
          currentChunk += sentence;
        }
      }
      
      // Add the last chunk if it's not empty
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }
    }
  }
  
  return chunks;
};

/**
 * Extract potential topics from content
 * @param content - Text content
 * @returns Array of topics
 */
const extractTopics = (content: string): string[] => {
  // List of potential Wittgenstein-related topics to look for
  const potentialTopics = [
    'language games', 'private language', 'forms of life', 'family resemblance',
    'rule following', 'picture theory', 'tractatus', 'philosophical investigations',
    'meaning', 'use', 'grammar', 'certainty', 'ethics', 'aesthetics', 'religion',
    'mathematics', 'psychology', 'color', 'sensation', 'pain', 'mind', 'solipsism',
    'skepticism', 'knowledge', 'doubt', 'logical form', 'proposition', 'fact',
    'world', 'limit', 'silence', 'showing', 'saying', 'nonsense', 'sense',
    'philosophy', 'therapy', 'clarity', 'confusion', 'understanding', 'seeing as',
    'aspect', 'duck-rabbit', 'beetle', 'box', 'language', 'game', 'rule', 'practice',
    'custom', 'institution', 'technique', 'training', 'learning', 'teaching',
    'following', 'agreement', 'community', 'culture', 'nature', 'human', 'animal',
    'lion', 'fly', 'bottle', 'ladder', 'hinge', 'river', 'bed', 'mythology',
    'ritual', 'ceremony', 'primitive', 'simple', 'complex', 'analysis', 'synthesis',
    'logical', 'grammatical', 'conceptual', 'empirical', 'necessary', 'contingent',
    'possible', 'impossible', 'actual', 'potential', 'real', 'ideal', 'ordinary',
    'everyday', 'common', 'special', 'technical', 'scientific', 'philosophical',
    'metaphysical', 'transcendental', 'immanent', 'transcendent', 'mystical',
    'ethical', 'aesthetic', 'religious', 'spiritual', 'secular', 'mundane',
    'transaction', 'transactional', 'theory'
  ];
  
  // Convert content to lowercase for case-insensitive matching
  const lowerContent = content.toLowerCase();
  
  // Find topics that appear in the content
  const foundTopics = potentialTopics.filter(topic => 
    lowerContent.includes(topic.toLowerCase())
  );
  
  // Limit to top 5 topics to avoid too many tags
  return foundTopics.slice(0, 5);
};

/**
 * Upload document chunks to Qdrant
 * @param chunks - Array of text chunks
 * @param metadata - Metadata for the document
 * @param collectionName - Name of the collection
 * @returns Array of uploaded chunk IDs
 */
const uploadDocumentChunks = async (
  chunks: string[],
  metadata: Record<string, any>,
  collectionName: string,
  namespace: string
): Promise<string[]> => {
  try {
    const chunkIds: string[] = [];
    
    // Check if collection exists
    const collections = await getCollections();
    const collectionExists = collections.some((c: { name: string }) => c.name === collectionName);
    
    // Create collection if it doesn't exist
    if (!collectionExists) {
      // Use the default embedding dimension (1536 for text-embedding-3-small)
      const dimension = 1536;
      await createCollection(collectionName, dimension);
      console.log(`Created new collection '${collectionName}' with vector dimension ${dimension}`);
    }
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = uuidv4();
      
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars, ~${Math.round(chunk.length * TOKENS_PER_CHAR)} tokens)...`);
      
      // Generate embedding for the chunk
      const embedding = await generateEmbedding(chunk);
      
      // Create enhanced metadata for the chunk
      const chunkMetadata = {
        ...metadata,
        namespace,
        chunkIndex: i,
        totalChunks: chunks.length,
        chunkId,
        parentDocumentId: metadata.documentId,
      };
      
      // Upload the chunk
      await uploadPoint(collectionName, {
        id: chunkId,
        vector: embedding,
        payload: {
          content: chunk,
          metadata: chunkMetadata,
          timestamp: new Date().toISOString(),
        },
      });
      
      console.log(`Successfully uploaded chunk ${i + 1}/${chunks.length} with ID: ${chunkId}`);
      chunkIds.push(chunkId);
    }
    
    return chunkIds;
  } catch (error) {
    console.error('Error uploading document chunks:', error);
    throw error;
  }
};

/**
 * Main function to run the upload process
 */
const main = async () => {
  const filePath = 'C:\\Users\\roger\\PhdResearch\\0_clone\\Second-Brain\\Witt-Trans\\sections\\ch8\\sec8\\on_certainty.md';
  const collectionName = 'second-brain-docs';
  const namespace = 'witt-writings';
  
  console.log('=== UPLOADING ON CERTAINTY TO QDRANT ===');
  console.log(`File path: ${filePath}`);
  console.log(`Collection name: ${collectionName}`);
  console.log(`Namespace: ${namespace}`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }
    
    // Read the file
    console.log(`Reading file: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Generate a document ID
    const documentId = uuidv4();
    
    // Extract metadata
    const fileName = path.basename(filePath);
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const dirName = path.basename(path.dirname(filePath));
    
    // Extract potential title from the first line
    const firstLine = content.split('\n')[0].trim();
    const title = firstLine.length > 0 ? firstLine : fileNameWithoutExt;
    
    // Extract potential topics
    const topics = extractTopics(content);
    
    // Create metadata
    const metadata = {
      title,
      fileName,
      dirName,
      filePath: filePath.replace(/\\/g, '/'), // Normalize path for cross-platform
      source: 'witt-writings',
      topics,
      tags: ['witt-writings', dirName.toLowerCase(), ...topics],
      documentId,
    };
    
    console.log(`Document size: ${content.length} characters (approximately ${Math.round(content.length * TOKENS_PER_CHAR)} tokens)`);
    console.log(`Metadata: ${JSON.stringify(metadata, null, 2)}`);
    
    // Calculate max chars per chunk based on token estimate
    const maxCharsPerChunk = Math.floor(MAX_TOKENS_PER_CHUNK / TOKENS_PER_CHAR);
    
    // Split content into chunks
    console.log(`Splitting document into chunks (max ${maxCharsPerChunk} chars per chunk)...`);
    const chunks = splitTextIntoChunks(content, maxCharsPerChunk);
    console.log(`Document split into ${chunks.length} chunks`);
    
    // Upload chunks
    console.log(`Uploading chunks with namespace: ${namespace}`);
    const chunkIds = await uploadDocumentChunks(chunks, metadata, collectionName, namespace);
    
    console.log(`Successfully uploaded ${chunkIds.length} chunks for document: ${metadata.title}`);
    console.log(`Document ID: ${documentId}`);
    
    console.log('\n=== UPLOAD COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
};

// Run the main function
main().catch(console.error); 