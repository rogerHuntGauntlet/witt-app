import { qdrantClient } from './client';
import { generateEmbedding } from './embeddings';

/**
 * Interface for search results
 */
export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
}

/**
 * Search for documents in a Qdrant collection
 * @param collectionName - Name of the collection to search in
 * @param query - Search query text
 * @param limit - Maximum number of results to return
 * @param embeddingModel - Embedding model to use (optional)
 * @returns Array of search results
 */
export const searchDocuments = async (
  collectionName: string,
  query: string,
  limit: number = 5,
  embeddingModel?: string
): Promise<SearchResult[]> => {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query, embeddingModel);
    
    // Search for similar vectors in the collection
    const searchResults = await qdrantClient.search(collectionName, {
      vector: queryEmbedding,
      limit,
      with_payload: true,
    });
    
    // Format the results
    return searchResults.map(result => ({
      id: result.id.toString(),
      content: result.payload?.content as string || '',
      metadata: result.payload?.metadata as Record<string, any> || {},
      score: result.score,
    }));
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};

/**
 * Search for documents with filtering in a Qdrant collection
 * @param collectionName - Name of the collection to search in
 * @param query - Search query text
 * @param filter - Filter condition for the search
 * @param limit - Maximum number of results to return
 * @param embeddingModel - Embedding model to use (optional)
 * @returns Array of search results
 */
export const searchDocumentsWithFilter = async (
  collectionName: string,
  query: string,
  filter: Record<string, any>,
  limit: number = 5,
  embeddingModel?: string
): Promise<SearchResult[]> => {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query, embeddingModel);
    
    // Search for similar vectors with filter
    const searchResults = await qdrantClient.search(collectionName, {
      vector: queryEmbedding,
      filter,
      limit,
      with_payload: true,
    });
    
    // Format the results
    return searchResults.map(result => ({
      id: result.id.toString(),
      content: result.payload?.content as string || '',
      metadata: result.payload?.metadata as Record<string, any> || {},
      score: result.score,
    }));
  } catch (error) {
    console.error('Error searching documents with filter:', error);
    throw error;
  }
};

/**
 * Example filter for searching documents with specific tags
 * @param tags - Array of tags to filter by
 * @returns Filter object for Qdrant
 */
export const createTagsFilter = (tags: string[]) => {
  return {
    must: [
      {
        key: 'metadata.tags',
        match: {
          any: tags,
        },
      },
    ],
  };
};

/**
 * Example filter for searching documents by author
 * @param author - Author name to filter by
 * @returns Filter object for Qdrant
 */
export const createAuthorFilter = (author: string) => {
  return {
    must: [
      {
        key: 'metadata.author',
        match: {
          value: author,
        },
      },
    ],
  };
}; 