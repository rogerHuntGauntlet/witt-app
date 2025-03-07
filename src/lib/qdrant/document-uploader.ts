import { v4 as uuidv4 } from 'uuid';
import { uploadPoint, uploadPoints, createCollection, getCollections, VectorPoint } from './client';
import { generateEmbedding, generateEmbeddings, getEmbeddingDimension } from './embeddings';

// Define document interface
export interface Document {
  id?: string;
  content: string;
  metadata?: Record<string, any>;
}

/**
 * Upload a single document to Qdrant
 * @param collectionName - Name of the collection
 * @param document - Document to upload
 * @param embeddingModel - Embedding model to use (optional)
 * @returns The ID of the uploaded document
 */
export const uploadDocument = async (
  collectionName: string,
  document: Document,
  embeddingModel?: string
): Promise<string> => {
  try {
    // Generate a unique ID if not provided
    const documentId = document.id || uuidv4();
    
    // Generate embedding for the document content
    const embedding = await generateEmbedding(document.content, embeddingModel);
    
    // Create the vector point
    const point: VectorPoint = {
      id: documentId,
      vector: embedding,
      payload: {
        content: document.content,
        metadata: document.metadata || {},
        timestamp: new Date().toISOString(),
      },
    };
    
    // Check if collection exists
    const collections = await getCollections();
    const collectionExists = collections.some((c: { name: string }) => c.name === collectionName);
    
    // Create collection if it doesn't exist
    if (!collectionExists) {
      const dimension = embedding.length;
      await createCollection(collectionName, dimension);
      console.log(`Created new collection '${collectionName}' with vector dimension ${dimension}`);
    }
    
    // Upload the document
    await uploadPoint(collectionName, point);
    console.log(`Successfully uploaded document with ID: ${documentId}`);
    
    return documentId;
  } catch (error) {
    console.error('Failed to upload document:', error);
    throw error;
  }
};

/**
 * Upload multiple documents to Qdrant
 * @param collectionName - Name of the collection
 * @param documents - Array of documents to upload
 * @param embeddingModel - Embedding model to use (optional)
 * @returns Array of uploaded document IDs
 */
export const uploadDocuments = async (
  collectionName: string,
  documents: Document[],
  embeddingModel?: string
): Promise<string[]> => {
  try {
    if (documents.length === 0) {
      return [];
    }
    
    // Generate IDs for documents that don't have them
    const documentsWithIds = documents.map(doc => ({
      ...doc,
      id: doc.id || uuidv4(),
    }));
    
    // Extract content for embedding generation
    const contents = documentsWithIds.map(doc => doc.content);
    
    // Generate embeddings for all documents
    const embeddings = await generateEmbeddings(contents, embeddingModel);
    
    // Create vector points
    const points: VectorPoint[] = documentsWithIds.map((doc, index) => ({
      id: doc.id as string,
      vector: embeddings[index],
      payload: {
        content: doc.content,
        metadata: doc.metadata || {},
        timestamp: new Date().toISOString(),
      },
    }));
    
    // Check if collection exists
    const collections = await getCollections();
    const collectionExists = collections.some((c: { name: string }) => c.name === collectionName);
    
    // Create collection if it doesn't exist
    if (!collectionExists) {
      const dimension = embeddings[0].length;
      await createCollection(collectionName, dimension);
      console.log(`Created new collection '${collectionName}' with vector dimension ${dimension}`);
    }
    
    // Upload all documents
    await uploadPoints(collectionName, points);
    console.log(`Successfully uploaded ${points.length} documents`);
    
    // Return the IDs of the uploaded documents
    return documentsWithIds.map(doc => doc.id as string);
  } catch (error) {
    console.error('Failed to upload documents:', error);
    throw error;
  }
}; 