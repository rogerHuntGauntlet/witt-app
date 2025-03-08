import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { Document, uploadDocument } from '../lib/qdrant/document-uploader';
import { generateEmbedding } from '../lib/qdrant/embeddings';
import { uploadPoint, createCollection, getCollections } from '../lib/qdrant/client';
import { v4 as uuidv4 } from 'uuid';
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
const MAX_TOKENS_PER_CHUNK = 4000;

// Approximate tokens per character (this is a rough estimate)
const TOKENS_PER_CHAR = 0.25;

/**
 * Extract text from a DOCX file
 * @param filePath - Path to the DOCX file
 * @returns Extracted text content
 */
const extractTextFromDocx = async (filePath: string): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
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
 * Upload document chunks to Qdrant
 * @param chunks - Array of text chunks
 * @param metadata - Metadata for the document
 * @param collectionName - Name of the collection
 * @returns Array of uploaded chunk IDs
 */
const uploadDocumentChunks = async (
  chunks: string[],
  metadata: Record<string, any>,
  collectionName: string
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
 * Upload a DOCX file to Qdrant with a specific namespace
 * @param filePath - Path to the DOCX file
 * @param collectionName - Name of the collection to upload to
 * @param namespace - Namespace for the document
 */
const uploadDocxFile = async (
  filePath: string,
  collectionName: string,
  namespace: string
) => {
  try {
    console.log(`Extracting text from ${filePath}...`);
    const content = await extractTextFromDocx(filePath);
    
    const fileName = path.basename(filePath);
    const title = fileName.replace('.docx', '');
    const documentId = uuidv4();
    
    console.log(`Document size: ${content.length} characters (approximately ${Math.round(content.length * TOKENS_PER_CHAR)} tokens)`);
    
    // Calculate max chars per chunk based on token estimate
    const maxCharsPerChunk = Math.floor(MAX_TOKENS_PER_CHUNK / TOKENS_PER_CHAR);
    
    console.log(`Splitting document into chunks (max ${maxCharsPerChunk} chars per chunk)...`);
    const chunks = splitTextIntoChunks(content, maxCharsPerChunk);
    console.log(`Document split into ${chunks.length} chunks`);
    
    // Create metadata
    const metadata = {
      title,
      fileName,
      source: 'thesis',
      filePath: filePath.replace(/\\/g, '/'), // Normalize path for cross-platform
      namespace,
      documentId,
      tags: ['thesis', namespace, title.toLowerCase()],
    };
    
    console.log(`Uploading chunks with namespace: ${namespace}`);
    const chunkIds = await uploadDocumentChunks(chunks, metadata, collectionName);
    
    console.log(`Successfully uploaded ${chunkIds.length} chunks for document: ${title}`);
    return {
      documentId,
      chunkIds,
    };
  } catch (error) {
    console.error('Error uploading DOCX file:', error);
    throw error;
  }
};

/**
 * Main function to run the upload process
 */
const main = async () => {
  const filePath = 'C:\\Users\\roger\\PhdResearch\\0_clone\\Second-Brain\\Final Drafts\\wittgenstein_thesis.docx';
  const collectionName = 'second-brain-docs';
  const namespace = 'transactional';
  
  console.log('=== UPLOADING THESIS DOCUMENT TO QDRANT ===');
  console.log(`File path: ${filePath}`);
  console.log(`Collection name: ${collectionName}`);
  console.log(`Namespace: ${namespace}`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }
    
    const result = await uploadDocxFile(filePath, collectionName, namespace);
    console.log(`\nDocument uploaded with ID: ${result.documentId}`);
    console.log(`Total chunks: ${result.chunkIds.length}`);
    console.log('\n=== UPLOAD COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
};

// Run the main function
main().catch(console.error); 