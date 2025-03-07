import fs from 'fs';
import path from 'path';
import { Document, uploadDocuments } from '../lib/qdrant/document-uploader';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if API keys are set
const qdrantApiKey = process.env.QDRANT_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!qdrantApiKey || qdrantApiKey === 'your_qdrant_api_key_here') {
  console.error('Error: QDRANT_API_KEY is not set in .env file');
  process.exit(1);
}

if (!openaiApiKey || openaiApiKey === 'your_openai_api_key_here') {
  console.error('Error: OPENAI_API_KEY is not set in .env file');
  process.exit(1);
}

/**
 * Read markdown files from a directory
 * @param directoryPath - Path to the directory containing markdown files
 * @returns Array of file paths
 */
const getMarkdownFiles = (directoryPath: string): string[] => {
  try {
    const files = fs.readdirSync(directoryPath);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(directoryPath, file));
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
};

/**
 * Read and parse a markdown file
 * @param filePath - Path to the markdown file
 * @returns Document object
 */
const parseMarkdownFile = (filePath: string): Document => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const title = fileName.replace('.md', '');
    
    // Extract the first line as a potential title
    const lines = content.split('\n');
    const firstLine = lines[0].replace(/^#\s+/, ''); // Remove markdown heading
    
    return {
      content,
      metadata: {
        title: firstLine || title,
        fileName,
        source: 'documentation',
        filePath: filePath.replace(/\\/g, '/'), // Normalize path for cross-platform
        tags: ['documentation', title.toLowerCase()],
      },
    };
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error);
    throw error;
  }
};

/**
 * Upload markdown files to Qdrant
 * @param directoryPath - Path to the directory containing markdown files
 * @param collectionName - Name of the collection to upload to
 */
const uploadMarkdownFiles = async (directoryPath: string, collectionName: string) => {
  try {
    // Get all markdown files
    const filePaths = getMarkdownFiles(directoryPath);
    
    if (filePaths.length === 0) {
      console.log(`No markdown files found in ${directoryPath}`);
      return;
    }
    
    console.log(`Found ${filePaths.length} markdown files in ${directoryPath}`);
    
    // Parse each file into a document
    const documents: Document[] = filePaths.map(parseMarkdownFile);
    
    // Upload documents to Qdrant
    console.log(`Uploading ${documents.length} documents to collection '${collectionName}'...`);
    const documentIds = await uploadDocuments(collectionName, documents);
    
    console.log(`Successfully uploaded ${documentIds.length} documents to Qdrant`);
    console.log('Document IDs:', documentIds);
    
    return documentIds;
  } catch (error) {
    console.error('Error uploading markdown files:', error);
    throw error;
  }
};

/**
 * Main function to run the upload process
 */
const main = async () => {
  const documentationPath = path.join(process.cwd(), 'documentation');
  const collectionName = 'second-brain-docs';
  
  console.log('=== UPLOADING REAL CONTENT TO QDRANT ===');
  console.log(`Documentation path: ${documentationPath}`);
  console.log(`Collection name: ${collectionName}`);
  
  try {
    await uploadMarkdownFiles(documentationPath, collectionName);
    console.log('\n=== UPLOAD COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
};

// Run the main function
main().catch(console.error); 