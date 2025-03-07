import { searchDocuments, searchDocumentsWithFilter, createTagsFilter, createAuthorFilter } from './search';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example function to search for documents in Qdrant
 */
export const searchExample = async () => {
  // Define the collection name
  const collectionName = 'documents';
  
  // Define the search query
  const query = 'artificial intelligence';
  
  try {
    // Search for documents
    console.log(`Searching for "${query}" in collection "${collectionName}"...`);
    const results = await searchDocuments(collectionName, query);
    
    // Display the results
    console.log(`Found ${results.length} results:`);
    results.forEach((result, index) => {
      console.log(`\nResult ${index + 1} (Score: ${result.score.toFixed(4)}):`);
      console.log(`ID: ${result.id}`);
      console.log(`Content: ${result.content}`);
      console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
    });
    
    return results;
  } catch (error) {
    console.error('Failed to search documents:', error);
    throw error;
  }
};

/**
 * Example function to search for documents with filters in Qdrant
 */
export const searchWithFiltersExample = async () => {
  // Define the collection name
  const collectionName = 'documents';
  
  // Define the search query
  const query = 'programming';
  
  // Define tags to filter by
  const tags = ['JavaScript', 'TypeScript'];
  
  try {
    // Create a filter for the tags
    const filter = createTagsFilter(tags);
    
    // Search for documents with the filter
    console.log(`\nSearching for "${query}" with tags ${tags.join(', ')} in collection "${collectionName}"...`);
    const results = await searchDocumentsWithFilter(collectionName, query, filter);
    
    // Display the results
    console.log(`Found ${results.length} results:`);
    results.forEach((result, index) => {
      console.log(`\nResult ${index + 1} (Score: ${result.score.toFixed(4)}):`);
      console.log(`ID: ${result.id}`);
      console.log(`Content: ${result.content}`);
      console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
    });
    
    return results;
  } catch (error) {
    console.error('Failed to search documents with filters:', error);
    throw error;
  }
};

/**
 * Example function to search for documents by author in Qdrant
 */
export const searchByAuthorExample = async () => {
  // Define the collection name
  const collectionName = 'documents';
  
  // Define the search query
  const query = 'framework';
  
  // Define the author to filter by
  const author = 'Alice Brown';
  
  try {
    // Create a filter for the author
    const filter = createAuthorFilter(author);
    
    // Search for documents with the filter
    console.log(`\nSearching for "${query}" by author "${author}" in collection "${collectionName}"...`);
    const results = await searchDocumentsWithFilter(collectionName, query, filter);
    
    // Display the results
    console.log(`Found ${results.length} results:`);
    results.forEach((result, index) => {
      console.log(`\nResult ${index + 1} (Score: ${result.score.toFixed(4)}):`);
      console.log(`ID: ${result.id}`);
      console.log(`Content: ${result.content}`);
      console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
    });
    
    return results;
  } catch (error) {
    console.error('Failed to search documents by author:', error);
    throw error;
  }
};

/**
 * Main function to run the search examples
 */
const runSearchExamples = async () => {
  try {
    console.log('--- Basic Search Example ---');
    await searchExample();
    
    console.log('\n--- Search with Tags Filter Example ---');
    await searchWithFiltersExample();
    
    console.log('\n--- Search by Author Example ---');
    await searchByAuthorExample();
  } catch (error) {
    console.error('Error running search examples:', error);
  }
};

// Uncomment the following line to run the examples
// runSearchExamples().catch(console.error);

export default runSearchExamples; 