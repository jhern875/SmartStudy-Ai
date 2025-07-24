const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// AI endpoints using the AI service
router.post('/summarize', async (req, res) => {
  try {
    const { documentId } = req.body;
    
    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const result = await aiService.summarizeDocument(documentId);
    res.json(result);
  } catch (error) {
    console.error('Error in summarize endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      details: error.message 
    });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const { documentId } = req.body;
    
    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const result = await aiService.generateQuestions(documentId);
    res.json(result);
  } catch (error) {
    console.error('Error in questions endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      details: error.message 
    });
  }
});

router.post('/terms', async (req, res) => {
  try {
    const { documentId } = req.body;
    
    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const result = await aiService.extractImportantTerms(documentId);
    res.json(result);
  } catch (error) {
    console.error('Error in terms endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to extract terms',
      details: error.message 
    });
  }
});

module.exports = router; 