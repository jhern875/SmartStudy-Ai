import '../styles/Upload.css';
import apiService from '../services/api.js';

const Upload = () => {
  let selectedFile = null;
  let isDragOver = false;
  let uploadStatus = 'idle';
  let uploadProgress = 0;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      selectedFile = file;
      uploadStatus = 'idle';
      updateUI();
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    isDragOver = true;
    updateUI();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    isDragOver = false;
    updateUI();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    isDragOver = false;
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      selectedFile = file;
      uploadStatus = 'idle';
      updateUI();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    uploadStatus = 'uploading';
    uploadProgress = 0;
    updateUI();

    try {
      // Real upload to backend
      await apiService.uploadFile(selectedFile);
      
      uploadProgress = 100;
      uploadStatus = 'success';
      updateUI();
      
      // Navigate back to document selection after successful upload
      setTimeout(() => {
        if (window.navigateTo) {
          window.navigateTo('/documents');
        } else {
          window.location.href = '/documents';
        }
      }, 1500);
      
    } catch (error) {
      uploadStatus = 'error';
      updateUI();
      alert(`Upload failed: ${error.message}`);
    }
  };

  const handleBackToDocuments = () => {
    if (window.navigateTo) {
      window.navigateTo('/documents');
    } else {
      window.location.href = '/documents';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const updateUI = () => {
    const dropZone = document.getElementById('drop-zone');
    const uploadButton = document.getElementById('upload-button');
    const progressBar = document.getElementById('progress-bar');
    const progressFill = document.getElementById('progress-fill');
    const statusMessage = document.getElementById('status-message');

    if (dropZone) {
      dropZone.className = `drop-zone ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`;
    }

    if (uploadButton) {
      uploadButton.style.display = selectedFile && uploadStatus === 'idle' ? 'block' : 'none';
    }

    if (progressBar) {
      progressBar.style.display = uploadStatus === 'uploading' ? 'block' : 'none';
    }

    if (progressFill) {
      progressFill.style.width = `${uploadProgress}%`;
    }

    if (statusMessage) {
      if (uploadStatus === 'success') {
        statusMessage.innerHTML = '<span>✅ Upload successful!</span><p>Processing your document...</p>';
        statusMessage.className = 'upload-status success';
        statusMessage.style.display = 'block';
      } else if (uploadStatus === 'error') {
        statusMessage.innerHTML = '<span>❌ Upload failed</span><p>Please try again</p>';
        statusMessage.className = 'upload-status error';
        statusMessage.style.display = 'block';
      } else {
        statusMessage.style.display = 'none';
      }
    }
  };

  const changeFile = () => {
    selectedFile = null;
    uploadStatus = 'idle';
    updateUI();
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        {/* Header */}
        <div className="upload-header">
          <button onClick={handleBackToDocuments} className="back-button">
            ← Back to Documents
          </button>
          <h1 className="upload-title">Upload Your Document</h1>
          <p className="upload-subtitle">
            Upload a PDF, Word document, or text file to get started
          </p>
        </div>

        {/* Upload Area */}
        <div className="upload-area">
          <div
            id="drop-zone"
            className="drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
            />
            
            {!selectedFile ? (
              <div className="upload-placeholder">
                <div className="upload-icon">📁</div>
                <h3>Drop your file here or click to browse</h3>
                <p>Supported formats: PDF, DOC, DOCX, TXT</p>
                <p>Maximum file size: 10MB</p>
              </div>
            ) : (
              <div className="selected-file">
                <div className="file-info">
                  <span className="file-icon">{getFileIcon(selectedFile.name)}</span>
                  <div className="file-details">
                    <h4>{selectedFile.name}</h4>
                    <p>{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button 
                  className="change-file-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    changeFile();
                  }}
                >
                  Change File
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          <div id="progress-bar" className="upload-progress" style={{ display: 'none' }}>
            <div className="progress-bar">
              <div id="progress-fill" className="progress-fill"></div>
            </div>
            <p>Uploading... {uploadProgress}%</p>
          </div>

          {/* Upload Status Messages */}
          <div id="status-message" className="upload-status" style={{ display: 'none' }}></div>

          {/* Upload Button */}
          <button 
            id="upload-button"
            onClick={handleUpload}
            className="upload-button"
            style={{ display: 'none' }}
          >
            Upload Document
          </button>
        </div>

        {/* File Requirements */}
        <div className="file-requirements">
          <h3>File Requirements</h3>
          <ul>
            <li>✅ Supported formats: PDF, DOC, DOCX, TXT</li>
            <li>✅ Maximum file size: 10MB</li>
            <li>✅ Clear, readable text for best results</li>
            <li>✅ Single file upload at a time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Upload; 