import { uploadMultipleDocumentsExample } from '../lib/qdrant/example-usage';
import { searchExample, searchWithFiltersExample, searchByAuthorExample } from '../lib/qdrant/search-example';
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
 * Main function to run the Qdrant demo
 */
const runQdrantDemo = async () => {
  try {
    console.log('=== QDRANT DEMO ===');
    console.log('\n1. UPLOADING DOCUMENTS');
    console.log('--------------------');
    
    // Upload documents
    await uploadMultipleDocumentsExample();
    
    // Wait a moment for Qdrant to process the uploads
    console.log('\nWaiting for Qdrant to process the uploads...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n2. SEARCHING DOCUMENTS');
    console.log('--------------------');
    
    // Run search examples
    await searchExample();
    await searchWithFiltersExample();
    await searchByAuthorExample();
    
    console.log('\n=== DEMO COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Error running Qdrant demo:', error);
    process.exit(1);
  }
};

// Run the demo
runQdrantDemo().catch(console.error); 