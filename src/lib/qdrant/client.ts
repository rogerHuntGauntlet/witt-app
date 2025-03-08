import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Log API key status
console.log('Qdrant API Key status in client.ts:', process.env.QDRANT_API_KEY ? 'Defined (first 10 chars: ' + process.env.QDRANT_API_KEY.substring(0, 10) + '...)' : 'Undefined');

// Define the Qdrant client configuration
const QDRANT_URL = 'https://1ab8e412-8310-4e7d-ad9f-e285b0f92609.us-east-1-0.aws.cloud.qdrant.io:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || ''; // Replace with your actual API key or use environment variable

// Initialize the Qdrant client
export const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

// Interface for vector data
export interface VectorPoint {
  id: string | number;
  vector: number[];
  payload?: Record<string, any>;
}

/**
 * Get all collections from Qdrant
 * @returns List of collections
 */
export const getCollections = async () => {
  try {
    const result = await qdrantClient.getCollections();
    return result.collections;
  } catch (error) {
    console.error('Failed to get collections:', error);
    throw error;
  }
};

/**
 * Upload a single point to a Qdrant collection
 * @param collectionName - Name of the collection
 * @param point - Vector point to upload
 */
export const uploadPoint = async (
  collectionName: string,
  point: VectorPoint
) => {
  try {
    await qdrantClient.upsert(collectionName, {
      points: [
        {
          id: point.id,
          vector: point.vector,
          payload: point.payload || {},
        },
      ],
    });
    console.log(`Successfully uploaded point with ID: ${point.id}`);
    return true;
  } catch (error) {
    console.error(`Failed to upload point to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Upload multiple points to a Qdrant collection
 * @param collectionName - Name of the collection
 * @param points - Array of vector points to upload
 */
export const uploadPoints = async (
  collectionName: string,
  points: VectorPoint[]
) => {
  try {
    await qdrantClient.upsert(collectionName, {
      points: points.map((point) => ({
        id: point.id,
        vector: point.vector,
        payload: point.payload || {},
      })),
    });
    console.log(`Successfully uploaded ${points.length} points to ${collectionName}`);
    return true;
  } catch (error) {
    console.error(`Failed to upload points to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Create a new collection in Qdrant
 * @param collectionName - Name of the collection to create
 * @param vectorSize - Size of vectors to be stored in the collection
 */
export const createCollection = async (
  collectionName: string,
  vectorSize: number
) => {
  try {
    await qdrantClient.createCollection(collectionName, {
      vectors: {
        size: vectorSize,
        distance: 'Cosine',
      },
    });
    console.log(`Successfully created collection: ${collectionName}`);
    return true;
  } catch (error) {
    console.error(`Failed to create collection ${collectionName}:`, error);
    throw error;
  }
}; 