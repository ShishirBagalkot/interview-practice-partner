module.exports = {
  voiceAgentUrl: process.env.VOICE_AGENT_URL || 'http://localhost:5001',
  stt: {
    model: 'faster-whisper',
    language: 'en'
  },
  tts: {
    model: 'piper',
    voice: 'en_US-lessac-medium'
  }
};
