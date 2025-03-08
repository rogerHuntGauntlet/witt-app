import { uploadDocument, uploadDocuments, Document } from './document-uploader';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example function to upload a single document to Qdrant
 */
export const uploadSingleDocumentExample = async () => {
  // Define the collection name
  const collectionName = 'documents';
  
  // Create a sample document
  const document: Document = {
    content: 'This is a sample document about artificial intelligence and machine learning.',
    metadata: {
      title: 'Introduction to AI',
      author: 'John Doe',
      tags: ['AI', 'ML', 'technology'],
      source: 'example',
    },
  };

  try {
    // Upload the document and get its ID
    const documentId = await uploadDocument(collectionName, document);
    console.log(`Document uploaded successfully with ID: ${documentId}`);
    return documentId;
  } catch (error) {
    console.error('Failed to upload document:', error);
    throw error;
  }
};

/**
 * Example function to upload multiple documents to Qdrant
 */
export const uploadMultipleDocumentsExample = async () => {
  // Define the collection name
  const collectionName = 'documents';
  
  // Create sample documents
  const documents: Document[] = [
    {
      content: 'TypeScript is a strongly typed programming language that builds on JavaScript.',
      metadata: {
        title: 'TypeScript Introduction',
        author: 'Jane Smith',
        tags: ['TypeScript', 'JavaScript', 'programming'],
        source: 'example',
      },
    },
    {
      content: 'React is a JavaScript library for building user interfaces, particularly single-page applications.',
      metadata: {
        title: 'React Overview',
        author: 'Bob Johnson',
        tags: ['React', 'JavaScript', 'frontend'],
        source: 'example',
      },
    },
    {
      content: 'Next.js is a React framework that enables server-side rendering and generating static websites.',
      metadata: {
        title: 'Next.js Framework',
        author: 'Alice Brown',
        tags: ['Next.js', 'React', 'SSR'],
        source: 'example',
      },
    },
  ];

  try {
    // Upload the documents and get their IDs
    const documentIds = await uploadDocuments(collectionName, documents);
    console.log(`${documentIds.length} documents uploaded successfully`);
    console.log('Document IDs:', documentIds);
    return documentIds;
  } catch (error) {
    console.error('Failed to upload documents:', error);
    throw error;
  }
};

/**
 * Main function to run the examples
 */
const runExamples = async () => {
  try {
    console.log('--- Uploading a single document ---');
    await uploadSingleDocumentExample();
    
    console.log('\n--- Uploading multiple documents ---');
    await uploadMultipleDocumentsExample();
  } catch (error) {
    console.error('Error running examples:', error);
  }
};

// Uncomment the following line to run the examples
// runExamples().catch(console.error);

export default runExamples; 