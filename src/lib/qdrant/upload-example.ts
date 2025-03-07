import { uploadPoint, uploadPoints, createCollection, getCollections, VectorPoint } from './client';

/**
 * Example function to upload a single item to Qdrant
 */
export const uploadSingleItem = async () => {
  const collectionName = 'my_collection';
  
  // Example vector point with payload
  const point: VectorPoint = {
    id: '1', // Unique identifier for the point
    vector: [0.1, 0.2, 0.3, 0.4, 0.5], // Vector representation (embedding)
    payload: {
      text: 'This is a sample text',
      metadata: {
        source: 'example',
        timestamp: new Date().toISOString(),
      },
      tags: ['sample', 'example', 'test'],
    },
  };

  try {
    // First, check if the collection exists
    const collections = await getCollections();
    const collectionExists = collections.some((c: { name: string }) => c.name === collectionName);
    
    // If collection doesn't exist, create it
    if (!collectionExists) {
      // Create collection with vector size matching our vectors
      await createCollection(collectionName, point.vector.length);
    }
    
    // Upload the point to the collection
    await uploadPoint(collectionName, point);
    console.log('Successfully uploaded single item to Qdrant');
  } catch (error) {
    console.error('Failed to upload item:', error);
  }
};

/**
 * Example function to upload multiple items to Qdrant
 */
export const uploadMultipleItems = async () => {
  const collectionName = 'my_collection';
  
  // Example vector points with payloads
  const points: VectorPoint[] = [
    {
      id: '2',
      vector: [0.2, 0.3, 0.4, 0.5, 0.6],
      payload: {
        text: 'Second sample text',
        metadata: {
          source: 'example',
          timestamp: new Date().toISOString(),
        },
        tags: ['sample', 'batch', 'test'],
      },
    },
    {
      id: '3',
      vector: [0.3, 0.4, 0.5, 0.6, 0.7],
      payload: {
        text: 'Third sample text',
        metadata: {
          source: 'example',
          timestamp: new Date().toISOString(),
        },
        tags: ['sample', 'batch', 'multiple'],
      },
    },
    {
      id: '4',
      vector: [0.4, 0.5, 0.6, 0.7, 0.8],
      payload: {
        text: 'Fourth sample text',
        metadata: {
          source: 'example',
          timestamp: new Date().toISOString(),
        },
        tags: ['sample', 'batch', 'bulk'],
      },
    },
  ];

  try {
    // First, check if the collection exists
    const collections = await getCollections();
    const collectionExists = collections.some((c: { name: string }) => c.name === collectionName);
    
    // If collection doesn't exist, create it
    if (!collectionExists) {
      // Create collection with vector size matching our vectors
      await createCollection(collectionName, points[0].vector.length);
    }
    
    // Upload multiple points to the collection
    await uploadPoints(collectionName, points);
    console.log('Successfully uploaded multiple items to Qdrant');
  } catch (error) {
    console.error('Failed to upload items:', error);
  }
};

// Example usage
// To run these examples, uncomment the following lines:
// 
// async function run() {
//   // Upload a single item
//   await uploadSingleItem();
//   
//   // Upload multiple items
//   await uploadMultipleItems();
// }
// 
// run().catch(console.error); 