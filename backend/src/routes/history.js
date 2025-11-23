const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Transcript = require('../models/Transcript');
const EvaluationService = require('../services/llm/evaluationService');

// Get all sessions
router.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await Session.getAll();
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

// Get session details with transcripts
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.getById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const transcripts = await Transcript.getBySessionId(sessionId);
    const evaluation = await EvaluationService.getEvaluation(sessionId);

    // Format messages
    const messages = transcripts.map(t => ({
      role: t.role,
      content: t.content,
      audioUrl: t.audio_url,
      timestamp: t.timestamp
    }));

    res.json({
      ...session,
      messages,
      evaluation
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
