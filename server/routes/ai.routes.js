const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const AiLog = require('../models/AiLog');

router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    // Call the AI Service
    const responseText = await aiService.processQuery(query);

    // Log the interaction
    const log = new AiLog({ query, response: responseText });
    await log.save();

    res.json({ response: responseText });
  } catch (error) {
    console.error('AI Route Error:', error);
    res.status(500).json({ message: 'AI processing failed' });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const logs = await AiLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
