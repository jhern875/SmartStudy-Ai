const express = require('express');
const router = express.Router();

// Placeholder AI endpoints - will be implemented with AI wrapper
router.post('/summarize', (req, res) => {
  // TODO: Implement with AI wrapper
  res.json({
    summary: "This is a placeholder summary. AI integration coming soon!",
    status: "placeholder"
  });
});

router.post('/questions', (req, res) => {
  // TODO: Implement with AI wrapper
  res.json({
    questions: [
      "What is the main topic of this document?",
      "What are the key points discussed?",
      "How does this relate to the subject matter?"
    ],
    status: "placeholder"
  });
});

router.post('/terms', (req, res) => {
  // TODO: Implement with AI wrapper
  res.json({
    terms: [
      "Artificial Intelligence",
      "Machine Learning", 
      "Data Processing",
      "Algorithm",
      "Neural Network"
    ],
    status: "placeholder"
  });
});

module.exports = router; 