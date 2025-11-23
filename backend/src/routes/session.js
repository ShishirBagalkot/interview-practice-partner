const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const RoleTemplate = require('../models/RoleTemplate');

// Create new session
router.post('/create', async (req, res, next) => {
  try {
    const { roleId, voiceEnabled } = req.body;
    
    if (!roleId) {
      return res.status(400).json({ error: 'Role ID is required' });
    }

    const session = await Session.create(roleId, voiceEnabled);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

// Get session details
router.get('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.getById(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// End session
router.post('/end', async (req, res, next) => {
  try {
    const { sessionId, score } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const result = await Session.end(sessionId, score);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
