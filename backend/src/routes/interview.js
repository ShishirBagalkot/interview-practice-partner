const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const Transcript = require('../models/Transcript');
const RoleTemplate = require('../models/RoleTemplate');
const OllamaService = require('../services/llm/ollamaService');
const PromptTemplates = require('../services/llm/promptTemplates');
const EvaluationService = require('../services/llm/evaluationService');
const STTService = require('../services/voice/sttService');
const TTSService = require('../services/voice/ttsService');

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../data/audio/recordings'));
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}.wav`);
  }
});

const upload = multer({ storage });

// Get role templates
router.get('/roles', async (req, res, next) => {
  try {
    const roles = await RoleTemplate.getAll();
    res.json({ roles });
  } catch (error) {
    next(error);
  }
});

// Send text message
router.post('/message', async (req, res, next) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }

    // Save user message
    await Transcript.add(sessionId, 'user', message);

    // Get conversation history
    const history = await Transcript.getLatest(sessionId, 10);
    
    // Build context for LLM
    const messages = PromptTemplates.contextBuilder(history);
    
    // Generate response
    const response = await OllamaService.chat(messages);

    // Save interviewer response
    await Transcript.add(sessionId, 'interviewer', response);

    res.json({ message: response });
  } catch (error) {
    next(error);
  }
});

// Send audio message
router.post('/audio', upload.single('audio'), async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const audioFile = req.file;

    if (!sessionId || !audioFile) {
      return res.status(400).json({ error: 'Session ID and audio file are required' });
    }

    // Transcribe audio
    const transcription = await STTService.transcribe(audioFile.path);

    // Save user message
    await Transcript.add(sessionId, 'user', transcription);

    // Get conversation history
    const history = await Transcript.getLatest(sessionId, 10);
    
    // Build context for LLM
    const messages = PromptTemplates.contextBuilder(history);
    
    // Generate response
    const responseText = await OllamaService.chat(messages);

    // Generate audio response
    const audioFileName = `${uuidv4()}.wav`;
    const audioUrl = await TTSService.synthesize(responseText, audioFileName);

    // Save interviewer response
    await Transcript.add(sessionId, 'interviewer', responseText, audioUrl);

    res.json({
      transcription,
      message: responseText,
      audioUrl
    });
  } catch (error) {
    next(error);
  }
});

// Get evaluation
router.get('/evaluation/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Check if evaluation already exists
    let evaluation = await EvaluationService.getEvaluation(sessionId);

    if (!evaluation) {
      // Generate new evaluation
      const transcripts = await Transcript.getBySessionId(sessionId);
      evaluation = await EvaluationService.evaluateInterview(transcripts);
      await EvaluationService.saveEvaluation(sessionId, evaluation);
    }

    res.json(evaluation);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
