import React, { useState } from 'react';
import Search from '../components/Search';
import DocumentUpload from '../components/DocumentUpload';
import { SearchResult } from '../lib/qdrant/search';

// Default collection name for Qdrant
const DEFAULT_COLLECTION = 'second-brain';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'upload'>('search');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const handleResultsFound = (results: SearchResult[]) => {
    setSearchResults(results);
  };

  const handleDocumentUploaded = (documentId: string) => {
    console.log('Document uploaded with ID:', documentId);
    setUploadSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setUploadSuccess(false);
    }, 3000);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Second-Brain Explorer</h1>
        <p>Search and manage your knowledge base using vector embeddings</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
        <button
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload
        </button>
      </div>

      <main className="main-content">
        {activeTab === 'search' ? (
          <div className="search-tab">
            <Search 
              collectionName={DEFAULT_COLLECTION} 
              onResultsFound={handleResultsFound} 
            />
          </div>
        ) : (
          <div className="upload-tab">
            <DocumentUpload 
              collectionName={DEFAULT_COLLECTION} 
              onDocumentUploaded={handleDocumentUploaded} 
            />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Powered by Qdrant Vector Database and OpenAI Embeddings</p>
      </footer>
    </div>
  );
};

export default HomePage; 