// backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../services/aiService');

/**
 * POST /api/ai/chat
 * Body: { messages: [{role: 'user'|'assistant', content: string}] }
 * Returns: { reply: string }
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request: messages array is required' 
      });
    }

    // Sanitize messages — only allow 'user' and 'assistant' roles, limit to last 20 turns
    const sanitizedMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .filter(m => typeof m.content === 'string' && m.content.trim().length > 0)
      .slice(-20) // Keep last 20 messages for context window management
      .map(m => ({ role: m.role, content: m.content.trim() }));

    if (sanitizedMessages.length === 0) {
      return res.status(400).json({ 
        error: 'No valid messages found' 
      });
    }

    const reply = await getChatResponse(sanitizedMessages);

    res.json({ reply });
  } catch (error) {
    console.error('AI Chat Route Error:', error);
    res.status(500).json({ 
      error: 'AI service error. Please try again.',
      details: error.message || error.toString()
    });
  }
});

module.exports = router;
