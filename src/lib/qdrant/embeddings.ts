import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Log API key status
console.log('OpenAI API Key status in embeddings.ts:', process.env.OPENAI_API_KEY ? 'Defined' : 'Undefined');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Replace with your actual API key or use environment variable
});

// Default embedding model
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';

/**
 * Generate embeddings for a single text string
 * @param text - The text to generate embeddings for
 * @param model - The embedding model to use (optional)
 * @returns A vector of embeddings
 */
export const generateEmbedding = async (
  text: string,
  model: string = DEFAULT_EMBEDDING_MODEL
): Promise<number[]> => {
  try {
    const response = await openai.embeddings.create({
      model,
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};

/**
 * Generate embeddings for multiple text strings
 * @param texts - Array of text strings to generate embeddings for
 * @param model - The embedding model to use (optional)
 * @returns Array of embedding vectors
 */
export const generateEmbeddings = async (
  texts: string[],
  model: string = DEFAULT_EMBEDDING_MODEL
): Promise<number[][]> => {
  try {
    const response = await openai.embeddings.create({
      model,
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
};

/**
 * Get the dimension of embeddings for a specific model
 * @param model - The embedding model name
 * @returns The dimension of the embedding vectors
 */
export const getEmbeddingDimension = (model: string = DEFAULT_EMBEDDING_MODEL): number => {
  // Dimensions for common models
  const dimensions: Record<string, number> = {
    'text-embedding-3-small': 1536,
    'text-embedding-3-large': 3072,
    'text-embedding-ada-002': 1536,
  };

  return dimensions[model] || 1536; // Default to 1536 if model not found
}; 