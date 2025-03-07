import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
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
const MAX_TOKENS_PER_CHUNK = 2000;

// Approximate tokens per character (this is a rough estimate)
const TOKENS_PER_CHAR = 0.25;

// Supported file extensions
const SUPPORTED_EXTENSIONS = ['.docx', '.txt', '.md', '.pdf'];

/**
 * Extract text from a file based on its extension
 * @param filePath - Path to the file
 * @returns Extracted text content
 */
const extractTextFromFile = async (filePath: string): Promise<string> => {
  try {
    const extension = path.extname(filePath).toLowerCase();
    
    if (extension === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (extension === '.txt' || extension === '.md') {
      return fs.readFileSync(filePath, 'utf-8');
    } else if (extension === '.pdf') {
      // For PDF, we'd need a PDF extraction library
      // This is a placeholder - in a real implementation, you'd use a library like pdf-parse
      console.warn(`PDF extraction not fully implemented for ${filePath}`);
      return `Content from PDF file: ${path.basename(filePath)}`;
    } else {
      throw new Error(`Unsupported file extension: ${extension}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    throw error;
  }
};

/**
 * Split text into chunks of approximately equal size
 * @param text - Text to split
 * @param maxChars - Maximum characters per chunk
 * @returns Array of text chunks
 */
const splitTextIntoChunks = (text: string, maxChars: number): string[] => {
  const chunks: string[] = [];
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the max chars, start a new chunk
    if (currentChunk.length + paragraph.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      // Otherwise, add to the current chunk
      if (currentChunk.length > 0) {
        currentChunk += '\n\n';
      }
      currentChunk += paragraph;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

/**
 * Extract metadata from file path and content
 * @param filePath - Path to the file
 * @param content - Text content of the file
 * @returns Metadata object
 */
interface DocumentMetadata {
  title: string;
  fileName: string;
  dirName: string;
  filePath: string;
  source: string;
  topics: string[];
  tags: string[];
  documentId?: string;
  namespace?: string;
}

const extractMetadata = (filePath: string, content: string): DocumentMetadata => {
  const fileName = path.basename(filePath);
  const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  const dirName = path.basename(path.dirname(filePath));
  
  // Extract potential title from the first line
  const firstLine = content.split('\n')[0].trim();
  const title = firstLine.length > 0 ? firstLine : fileNameWithoutExt;
  
  // Extract potential topics from content
  const topics = extractTopics(content);
  
  return {
    title,
    fileName,
    dirName,
    filePath: filePath.replace(/\\/g, '/'), // Normalize path for cross-platform
    source: 'witt-writings',
    topics,
    tags: ['witt-writings', dirName.toLowerCase(), ...topics],
  };
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
      
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)...`);
      
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
 * Process a single file
 * @param filePath - Path to the file
 * @param collectionName - Name of the collection
 * @param namespace - Namespace for the document
 * @returns Object with document ID and chunk IDs
 */
const processFile = async (
  filePath: string,
  collectionName: string,
  namespace: string
): Promise<{ documentId: string, chunkIds: string[], title: string }> => {
  try {
    console.log(`\nProcessing file: ${filePath}`);
    
    // Extract text from file
    console.log(`Extracting text from ${filePath}...`);
    const content = await extractTextFromFile(filePath);
    
    // Generate a document ID
    const documentId = uuidv4();
    
    // Extract metadata
    const metadata: DocumentMetadata = {
      ...extractMetadata(filePath, content),
      documentId,
      namespace,
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
    
    return {
      documentId,
      chunkIds,
      title: metadata.title,
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    throw error;
  }
};

/**
 * Recursively process files in a directory
 * @param dirPath - Path to the directory
 * @param collectionName - Name of the collection
 * @param namespace - Namespace for the documents
 * @returns Array of processed file results
 */
const processDirectory = async (
  dirPath: string,
  collectionName: string,
  namespace: string
): Promise<Array<{ filePath: string, documentId: string, chunkIds: string[], title: string }>> => {
  try {
    console.log(`\nProcessing directory: ${dirPath}`);
    
    const results: Array<{ filePath: string, documentId: string, chunkIds: string[], title: string }> = [];
    
    // Read directory contents
    const items = fs.readdirSync(dirPath);
    
    // Process each item
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Recursively process subdirectory
        const subResults = await processDirectory(itemPath, collectionName, namespace);
        results.push(...subResults);
      } else if (stats.isFile()) {
        // Check if file has a supported extension
        const extension = path.extname(itemPath).toLowerCase();
        if (SUPPORTED_EXTENSIONS.includes(extension)) {
          // Process file
          const result = await processFile(itemPath, collectionName, namespace);
          results.push({
            filePath: itemPath,
            documentId: result.documentId,
            chunkIds: result.chunkIds,
            title: result.title,
          });
        } else {
          console.log(`Skipping unsupported file: ${itemPath}`);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
    throw error;
  }
};

/**
 * Main function to run the upload process
 */
const main = async () => {
  // Get directory path from command line arguments or use default
  const dirPath = process.argv[2] || path.join(process.cwd(), '..', 'witt-writings');
  const collectionName = 'second-brain-docs';
  const namespace = 'witt-writings';
  
  console.log('=== UPLOADING WITTGENSTEIN WRITINGS TO QDRANT ===');
  console.log(`Directory path: ${dirPath}`);
  console.log(`Collection name: ${collectionName}`);
  console.log(`Namespace: ${namespace}`);
  
  try {
    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
      console.error(`Error: Directory not found at ${dirPath}`);
      process.exit(1);
    }
    
    // Process directory
    const results = await processDirectory(dirPath, collectionName, namespace);
    
    // Print summary
    console.log('\n=== UPLOAD SUMMARY ===');
    console.log(`Total files processed: ${results.length}`);
    console.log(`Total chunks uploaded: ${results.reduce((sum, result) => sum + result.chunkIds.length, 0)}`);
    
    console.log('\n=== UPLOAD COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
};

// Run the main function
main().catch(console.error); 