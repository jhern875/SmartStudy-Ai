require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Import routes
const uploadRoutes = require('./routes/upload');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Simple in-memory database for storing results
const resultsDB = new Map();

// Database endpoints
app.post('/api/results', (req, res) => {
  try {
    const { documentId, results, metadata } = req.body;
    
    if (!documentId || !results) {
      return res.status(400).json({ error: 'Document ID and results are required' });
    }

    const resultEntry = {
      documentId,
      results,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      }
    };

    resultsDB.set(documentId, resultEntry);
    
    console.log('💾 Saved results for document:', documentId);
    res.json({ 
      success: true, 
      message: 'Results saved successfully',
      id: resultEntry.metadata.id
    });
  } catch (error) {
    console.error('Error saving results:', error);
    res.status(500).json({ error: 'Failed to save results' });
  }
});

app.get('/api/results/:documentId', (req, res) => {
  try {
    const { documentId } = req.params;
    const results = resultsDB.get(documentId);
    
    if (!results) {
      return res.status(404).json({ error: 'Results not found' });
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error retrieving results:', error);
    res.status(500).json({ error: 'Failed to retrieve results' });
  }
});

app.get('/api/results', (req, res) => {
  try {
    const allResults = Array.from(resultsDB.values());
    res.json(allResults);
  } catch (error) {
    console.error('Error retrieving all results:', error);
    res.status(500).json({ error: 'Failed to retrieve results' });
  }
});

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SmartStudy AI Backend is running' });
});

// Get uploaded documents list - exclude .txt files created alongside original files
app.get('/api/documents', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    
    // Filter out .txt files that are created alongside original files
    const filteredFiles = files.filter(filename => {
      const extension = path.extname(filename).toLowerCase();
      // Exclude .txt files that have another extension before .txt (e.g., document.docx.txt)
      if (extension === '.txt') {
        const nameWithoutTxt = filename.slice(0, -4); // Remove .txt
        const hasOtherExtension = path.extname(nameWithoutTxt).toLowerCase();
        // If the file without .txt has another extension, exclude it
        return !hasOtherExtension || hasOtherExtension === '.txt';
      }
      return true;
    });
    
    const documents = filteredFiles.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        id: filename,
        name: filename,
        size: stats.size,
        uploadedAt: stats.mtime,
        type: path.extname(filename).substring(1).toUpperCase()
      };
    });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SmartStudy AI Backend running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
}); 