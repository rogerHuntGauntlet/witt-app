import { searchDocumentsWithFilter, SearchResult } from '../lib/qdrant/search';
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

/**
 * Search for documents in Qdrant with namespace filter
 * @param collectionName - Name of the collection to search in
 * @param query - Search query
 * @param namespace - Namespace to filter by
 * @param limit - Maximum number of results to return
 */
const searchThesis = async (
  collectionName: string,
  query: string,
  namespace: string,
  limit: number = 5
) => {
  try {
    console.log(`Searching for "${query}" in collection '${collectionName}' with namespace '${namespace}'...`);
    
    // Create filter for the namespace
    const filter = {
      must: [
        {
          key: 'metadata.namespace',
          match: {
            value: namespace,
          },
        },
      ],
    };
    
    // Search with the namespace filter
    const results = await searchDocumentsWithFilter(collectionName, query, filter, limit);
    
    console.log(`Found ${results.length} results:`);
    
    // Display results
    results.forEach((result: SearchResult, index: number) => {
      console.log(`\n--- Result ${index + 1} (Score: ${result.score.toFixed(4)}) ---`);
      console.log(`Document ID: ${result.metadata?.parentDocumentId || 'Unknown'}`);
      console.log(`Chunk: ${result.metadata?.chunkIndex + 1}/${result.metadata?.totalChunks}`);
      console.log(`Namespace: ${result.metadata?.namespace || 'Unknown'}`);
      
      // Display tags if available
      if (result.metadata?.tags) {
        console.log(`Tags: ${result.metadata.tags.join(', ')}`);
      }
      
      // Display a snippet of the content
      const contentPreview = result.content.substring(0, 300) + '...';
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
  const namespace = 'transactional';
  
  // Get search query from command line arguments
  const query = process.argv[2] || 'Wittgenstein';
  const limit = parseInt(process.argv[3] || '5', 10);
  
  console.log('=== SEARCHING THESIS DOCUMENT IN QDRANT ===');
  console.log(`Collection name: ${collectionName}`);
  console.log(`Namespace: ${namespace}`);
  console.log(`Query: "${query}"`);
  console.log(`Limit: ${limit} results`);
  
  try {
    await searchThesis(collectionName, query, namespace, limit);
    console.log('\n=== SEARCH COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
};

// Run the main function
main().catch(console.error); 