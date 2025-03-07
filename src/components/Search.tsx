import React, { useState } from 'react';
import { searchDocuments, SearchResult } from '../lib/qdrant/search';

interface SearchProps {
  collectionName: string;
  onResultsFound?: (results: SearchResult[]) => void;
}

export const Search: React.FC<SearchProps> = ({ 
  collectionName,
  onResultsFound 
}) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const searchResults = await searchDocuments(collectionName, query);
      setResults(searchResults);
      
      if (onResultsFound) {
        onResultsFound(searchResults);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your documents..."
          className="search-input"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="search-button"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {error && <div className="search-error">{error}</div>}
      
      <div className="search-results">
        {results.length > 0 ? (
          <div>
            <h3>Search Results</h3>
            <ul className="results-list">
              {results.map((result) => (
                <li key={result.id} className="result-item">
                  <div className="result-content">{result.content}</div>
                  <div className="result-metadata">
                    {result.metadata.author && (
                      <span className="metadata-author">
                        Author: {result.metadata.author}
                      </span>
                    )}
                    {result.metadata.tags && (
                      <span className="metadata-tags">
                        Tags: {Array.isArray(result.metadata.tags) 
                          ? result.metadata.tags.join(', ') 
                          : result.metadata.tags}
                      </span>
                    )}
                    <span className="metadata-score">
                      Relevance: {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          query.trim() && !isSearching && (
            <div className="no-results">No results found for "{query}"</div>
          )
        )}
      </div>
    </div>
  );
};

export default Search; 