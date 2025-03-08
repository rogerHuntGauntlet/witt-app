import { searchDocuments, SearchResult } from '../lib/qdrant/search';
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
 * Search for documents in Qdrant
 * @param collectionName - Name of the collection to search in
 * @param query - Search query
 * @param limit - Maximum number of results to return
 */
const searchContent = async (collectionName: string, query: string, limit: number = 5) => {
  try {
    console.log(`Searching for "${query}" in collection '${collectionName}'...`);
    
    const results = await searchDocuments(collectionName, query, limit);
    
    console.log(`Found ${results.length} results:`);
    
    // Display results
    results.forEach((result: SearchResult, index: number) => {
      console.log(`\n--- Result ${index + 1} (Score: ${result.score.toFixed(4)}) ---`);
      console.log(`Title: ${result.metadata?.title || 'Untitled'}`);
      console.log(`Source: ${result.metadata?.source || 'Unknown'}`);
      
      // Display tags if available
      if (result.metadata?.tags) {
        console.log(`Tags: ${result.metadata.tags.join(', ')}`);
      }
      
      // Display a snippet of the content
      const contentPreview = result.content.substring(0, 200) + '...';
      console.log(`\nPreview: ${contentPreview}`);
    });
    
    return results;
  } catch (error) {
    console.error('Error searching content:', error);
    throw error;
  }
};

/**
 * Main function to run the search process
 */
const main = async () => {
  const collectionName = 'second-brain-docs';
  
  // Get search query from command line arguments
  const query = process.argv[2] || 'Wittgenstein';
  const limit = parseInt(process.argv[3] || '5', 10);
  
  console.log('=== SEARCHING REAL CONTENT IN QDRANT ===');
  console.log(`Collection name: ${collectionName}`);
  console.log(`Query: "${query}"`);
  console.log(`Limit: ${limit} results`);
  
  try {
    await searchContent(collectionName, query, limit);
    console.log('\n=== SEARCH COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
};

// Run the main function
main().catch(console.error); 