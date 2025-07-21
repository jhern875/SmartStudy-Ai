import '../styles/DocumentSelection.css';
import apiService from '../services/api.js';

const DocumentSelection = () => {
  let documents = [];
  let isLoading = false;

  const handleBackToHome = () => {
    if (window.navigateTo) {
      window.navigateTo('/');
    } else {
      window.location.href = '/';
    }
  };

  const handleUploadNew = () => {
    if (window.navigateTo) {
      window.navigateTo('/upload');
    } else {
      window.location.href = '/upload';
    }
  };

  const handleDocumentSelect = async (documentId) => {
    try {
      // Get the full document content
      const fileContent = await apiService.getFileContent(documentId);
      
      // Store the document content for the results page
      sessionStorage.setItem('selectedDocument', JSON.stringify({
        id: documentId,
        content: fileContent.extractedText,
        name: documentId
      }));

      // Navigate to results page
      if (window.navigateTo) {
        window.navigateTo('/results');
      } else {
        window.location.href = '/results';
      }
    } catch (error) {
      console.error('Failed to get document content:', error);
      alert('Failed to load document. Please try again.');
    }
  };

  const loadDocuments = async () => {
    isLoading = true;
    updateUI();

    try {
      documents = await apiService.getDocuments();
      updateUI();
    } catch (error) {
      console.error('Failed to load documents:', error);
      documents = [];
      updateUI();
    }
  };

  const updateUI = () => {
    const documentsGrid = document.querySelector('.documents-grid');

    if (documentsGrid) {
      if (isLoading) {
        documentsGrid.innerHTML = '<div class="loading">Loading documents...</div>';
      } else if (documents.length === 0) {
        documentsGrid.innerHTML = '<div class="no-documents">No documents uploaded yet. Upload your first document to get started!</div>';
      } else {
        documentsGrid.innerHTML = documents.map(doc => `
          <div class="document-card" onclick="window.handleDocumentSelect('${doc.id}')">
            <div class="document-icon">
              ${getFileIcon(doc.name)}
            </div>
            <div class="document-info">
              <h3 class="document-name">${doc.name}</h3>
              <p class="document-meta">
                ${doc.type} • ${formatFileSize(doc.size)} • ${formatDate(doc.uploadedAt)}
              </p>
            </div>
            <div class="document-actions">
              <button class="select-button">Select</button>
            </div>
          </div>
        `).join('');
      }
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📄';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Make handleDocumentSelect available globally for onclick handlers
  window.handleDocumentSelect = handleDocumentSelect;

  // Load documents when component mounts
  loadDocuments();

  return (
    <div className="document-selection-container">
      <div className="document-selection-content">
        <button onClick={handleBackToHome} className="back-button">
          ← Back to Home
        </button>
        
        <div className="header-section">
          <h1 className="main-title">Your Documents</h1>
          <p className="subtitle">Select a document to analyze or upload a new one</p>
        </div>

        <div className="documents-grid">
          {/* Documents will be loaded here dynamically */}
        </div>

        <div className="upload-new-section">
          <div className="upload-new-card" onClick={handleUploadNew}>
            <div className="upload-icon">📁</div>
            <h3>Upload New Document</h3>
            <p>Add another document to your collection</p>
            <button className="upload-new-button">Upload Document</button>
          </div>
        </div>

        <div className="info-section">
          <h3>Supported Formats</h3>
          <div className="supported-formats">
            <span className="format-tag">PDF</span>
            <span className="format-tag">DOC</span>
            <span className="format-tag">DOCX</span>
            <span className="format-tag">TXT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSelection; 