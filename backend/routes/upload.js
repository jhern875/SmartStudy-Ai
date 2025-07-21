const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    fs.ensureDirSync(uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename but add timestamp to avoid conflicts
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  }
});

// Upload file endpoint
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const filePath = file.path;
    const fileExt = path.extname(file.originalname).toLowerCase();

    // Extract text based on file type
    let extractedText = '';
    
    try {
      if (fileExt === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      } else if (fileExt === '.docx' || fileExt === '.doc') {
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value;
      } else if (fileExt === '.txt') {
        extractedText = fs.readFileSync(filePath, 'utf8');
      }

      // Store extracted text alongside the file
      const textFilePath = filePath + '.txt';
      fs.writeFileSync(textFilePath, extractedText);

      res.json({
        success: true,
        message: 'File uploaded and processed successfully',
        file: {
          id: file.filename,
          name: file.originalname,
          size: file.size,
          type: fileExt.substring(1).toUpperCase(),
          extractedText: extractedText.substring(0, 500) + '...' // Preview
        }
      });

    } catch (extractError) {
      console.error('Text extraction error:', extractError);
      res.status(500).json({ 
        error: 'Failed to extract text from file',
        details: extractError.message 
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message 
    });
  }
});

// Get file content endpoint
router.get('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    const textFilePath = filePath + '.txt';

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    let extractedText = '';
    if (fs.existsSync(textFilePath)) {
      extractedText = fs.readFileSync(textFilePath, 'utf8');
    }

    res.json({
      filename: filename,
      extractedText: extractedText
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get file content' });
  }
});

module.exports = router; 