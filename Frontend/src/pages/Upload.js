import React, { useState, useRef } from 'react';
import '../styles/Upload.css';
import apiService from '../services/api';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && (file.type === 'application/pdf' || 
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                  file.type === 'application/msword' ||
                  file.type === 'text/plain')) {
      setSelectedFile(file);
      setUploadStatus('');
    } else {
      setUploadStatus('❌ Please select a valid file (PDF, DOC, DOCX, or TXT)');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('❌ Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('📤 Uploading file...');

    try {
      const result = await apiService.uploadFile(selectedFile);
      console.log('Upload successful:', result);
      setUploadStatus('✅ Upload successful! Redirecting...');
      
      // Store file info in session storage for the results page
      sessionStorage.setItem('selectedDocument', JSON.stringify({
        id: result.filename,
        name: selectedFile.name,
        content: result.content || 'Content will be processed...'
      }));
      
      // Redirect to document selection page
      setTimeout(() => {
        window.location.href = '/documents';
      }, 1000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus(`❌ Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="upload-container">
      <div className="upload-content">
        <button onClick={handleBackToHome} className="back-button">
          ← Back to Home
        </button>
        
        <h1>📤 Upload Your Document</h1>
        <p className="upload-subtitle">
          Upload a PDF, DOC, DOCX, or TXT file to get started with SmartStudy AI
        </p>

        <div 
          className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">📄</div>
          <h3>Drop your file here or click to browse</h3>
          <p>Supports: PDF, DOC, DOCX, TXT</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {selectedFile && (
          <div className="file-info">
            <h4>📎 Selected File:</h4>
            <p><strong>Name:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
          </div>
        )}

        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading}
          className={`upload-button ${!selectedFile || isUploading ? 'disabled' : ''}`}
        >
          {isUploading ? '📤 Uploading...' : '🚀 Process with AI'}
        </button>

        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.includes('❌') ? 'error' : 'success'}`}>
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload; 