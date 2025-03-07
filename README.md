# Witt App - Qdrant Vector Database Integration

This project demonstrates how to integrate Qdrant vector database with a Next.js application for semantic search and vector storage capabilities.

## Features

- Connect to Qdrant cloud instance
- Generate embeddings using OpenAI's embedding models
- Upload documents with metadata to Qdrant collections
- Manage collections and vector points
- Search documents using semantic similarity
- Filter search results by metadata

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Qdrant account (cloud or self-hosted)
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/witt-app.git
   cd witt-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Qdrant API key and OpenAI API key:
     ```
     QDRANT_API_KEY=your_actual_qdrant_api_key
     OPENAI_API_KEY=your_actual_openai_api_key
     ```

### Configuration

The Qdrant client is configured in `src/lib/qdrant/client.ts`. You can modify the following settings:

- `QDRANT_URL`: Your Qdrant instance URL
- `QDRANT_API_KEY`: Your Qdrant API key (stored in .env)

## Running the Application

### Development Mode

To run the application in development mode:

```bash
npm run dev
```

This will start the Next.js development server at http://localhost:3000.

### Testing the Qdrant Integration

To test the Qdrant integration without running the full application:

```bash
npm run qdrant-demo
```

This will run a demo script that:
1. Uploads sample documents to Qdrant
2. Performs various search operations
3. Demonstrates filtering capabilities

### Building for Production

```bash
npm run build
npm start
```

## UI Components

The application includes the following UI components:

### Search Component

The Search component allows users to search for documents using semantic similarity:

```tsx
import Search from '../components/Search';

// Usage
<Search collectionName="my_collection" onResultsFound={handleResults} />
```

### Document Upload Component

The DocumentUpload component allows users to add new documents to the vector database:

```tsx
import DocumentUpload from '../components/DocumentUpload';

// Usage
<DocumentUpload collectionName="my_collection" onDocumentUploaded={handleUpload} />
```

## API Reference

### Document Uploader

- `uploadDocument(collectionName, document, embeddingModel?)`: Upload a single document
- `uploadDocuments(collectionName, documents, embeddingModel?)`: Upload multiple documents

### Search

- `searchDocuments(collectionName, query, limit?, embeddingModel?)`: Search for documents
- `searchDocumentsWithFilter(collectionName, query, filter, limit?, embeddingModel?)`: Search with filters
- `createTagsFilter(tags)`: Create a filter for tags
- `createAuthorFilter(author)`: Create a filter for author

### Qdrant Client

- `createCollection(collectionName, vectorSize)`: Create a new collection
- `uploadPoint(collectionName, point)`: Upload a single vector point
- `uploadPoints(collectionName, points)`: Upload multiple vector points
- `getCollections()`: Get all collections

### Embeddings

- `generateEmbedding(text, model?)`: Generate embedding for a single text
- `generateEmbeddings(texts, model?)`: Generate embeddings for multiple texts

## Next Steps

- Add authentication for secure access
- Implement document deletion and updating
- Add more advanced filtering options
- Create visualization for vector embeddings
- Implement batch upload from files

## License

MIT 