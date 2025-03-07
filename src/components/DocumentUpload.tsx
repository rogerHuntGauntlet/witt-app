import React, { useState } from 'react';
import { uploadDocument, Document } from '../lib/qdrant/document-uploader';

interface DocumentUploadProps {
  collectionName: string;
  onDocumentUploaded?: (documentId: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  collectionName,
  onDocumentUploaded
}) => {
  const [content, setContent] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!content.trim()) {
      setError('Document content is required');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare document with metadata
      const document: Document = {
        content: content.trim(),
        metadata: {
          author: author.trim() || 'Unknown',
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          uploadDate: new Date().toISOString()
        }
      };

      // Upload document to Qdrant
      const documentId = await uploadDocument(collectionName, document);
      
      // Reset form
      setContent('');
      setAuthor('');
      setTags('');
      
      // Show success message
      setSuccess(`Document uploaded successfully with ID: ${documentId}`);
      
      // Call callback if provided
      if (onDocumentUploaded) {
        onDocumentUploaded(documentId);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An error occurred while uploading the document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="document-upload-container">
      <h2>Upload Document</h2>
      
      {error && <div className="upload-error">{error}</div>}
      {success && <div className="upload-success">{success}</div>}
      
      <div className="form-group">
        <label htmlFor="content">Document Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter document content..."
          rows={6}
          className="content-textarea"
          disabled={isUploading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="author">Author (optional):</label>
        <input
          type="text"
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Enter author name..."
          className="author-input"
          disabled={isUploading}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated, optional):</label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="philosophy, wittgenstein, language..."
          className="tags-input"
          disabled={isUploading}
        />
      </div>
      
      <button
        onClick={handleUpload}
        disabled={isUploading || !content.trim()}
        className="upload-button"
      >
        {isUploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  );
};

export default DocumentUpload; 