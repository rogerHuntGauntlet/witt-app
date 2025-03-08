# Witt App - Philosophical Text Analysis Platform

A Next.js application for analyzing, searching, and interpreting philosophical texts with a focus on Wittgenstein's works through different philosophical frameworks. The application leverages vector embeddings with Qdrant and AI-powered interpretations.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Overview

Witt App is designed to help researchers, students, and philosophy enthusiasts explore Wittgenstein's works and related philosophical content through a modern, AI-enhanced interface. The application allows users to:

- Search through Wittgenstein's texts using semantic search
- Analyze passages through multiple philosophical frameworks
- Generate interpretations of concepts and ideas using various philosophical lenses
- Compare different readings and interpretations side by side

## Features

- **Semantic Search**: Find relevant passages using natural language queries
- **Multi-Framework Analysis**: Interpret texts through different philosophical perspectives:
  - Early Wittgenstein
  - Later Wittgenstein
  - Ordinary Language
  - Therapeutic Reading
  - Resolute Reading
  - Metaphysical Reading
  - Pyrrhonian Reading
  - Transcendental Reading
  - Pragmatic Reading
  - Transaction Theory
- **Vector Database Integration**: Store and retrieve embeddings using Qdrant
- **AI-Powered Interpretations**: Generate contextual interpretations using OpenAI and Anthropic's Claude
- **Modern React UI**: Clean, responsive interface built with Next.js and TypeScript

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Qdrant account (cloud or self-hosted)
- OpenAI API key
- Anthropic API key (optional, for Claude-based interpretations)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rogerHuntGauntlet/witt-app.git
   cd witt-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your API keys and configuration:
     ```
     QDRANT_API_KEY=your_actual_qdrant_api_key
     OPENAI_API_KEY=your_actual_openai_api_key
     ANTHROPIC_API_KEY=your_actual_anthropic_api_key (optional)
     ```

### Configuration

The application can be configured through various files:

- **Qdrant Client**: `src/lib/qdrant/client.ts` - Configure your Qdrant instance
- **Embeddings**: `src/lib/embeddings.ts` - Configure embedding models and parameters
- **Interpretation Frameworks**: `src/lib/frameworks.ts` - Adjust available philosophical frameworks

## Running the Application

### Development Mode

To run the application in development mode:

```bash
npm run dev
```

This will start the Next.js development server at http://localhost:3000.

### Building for Production

```bash
npm run build
npm start
```

## Data Management

### Uploading Philosophical Texts

The application includes scripts to upload philosophical texts to the vector database:

```bash
# Upload Wittgenstein's writings
npm run upload-witt-writings

# Upload "On Certainty"
npm run upload-on-certainty

# Upload custom thesis or papers
npm run upload-thesis
```

### Searching and Testing

Scripts for testing search and database functionality:

```bash
# Search Wittgenstein's writings
npm run search-witt-writings

# Test Qdrant connection and features
npm run qdrant-demo

# Test environment variables
npm run test-env
```

## API Reference

### Document Uploader

- `uploadDocument(collectionName, document, embeddingModel?)`: Upload a single document
- `uploadDocuments(collectionName, documents, embeddingModel?)`: Upload multiple documents

### Search

- `searchDocuments(collectionName, query, limit?, embeddingModel?)`: Search for documents
- `searchDocumentsWithFilter(collectionName, query, filter, limit?, embeddingModel?)`: Search with filters

### Interpretations

- `generateInterpretation(passage, framework)`: Generate interpretation of a passage using a specific framework
- `generateAllInterpretations(passage, frameworks)`: Generate interpretations using all specified frameworks

## Project Structure

```
witt-app/
├── documentation/       # Project documentation
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   │   └── ...
│   ├── lib/            # Utility functions and services
│   │   ├── qdrant/     # Qdrant client and vector DB utilities
│   │   └── ...
│   ├── pages/          # Next.js pages and API routes
│   ├── scripts/        # Utility scripts for data management
│   └── styles/         # CSS and styling
└── ...
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Ludwig Wittgenstein for his philosophical contributions
- The philosophical community for various interpretative frameworks
- Next.js and React teams for their excellent web frameworks
- Qdrant for vector database capabilities
- OpenAI and Anthropic for AI interpretation capabilities