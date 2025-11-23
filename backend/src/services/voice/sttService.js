const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const VOICE_AGENT_URL = process.env.VOICE_AGENT_URL || 'http://localhost:5001';

class STTService {
  static async transcribe(audioFilePath) {
    try {
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(audioFilePath));

      const response = await axios.post(`${VOICE_AGENT_URL}/api/stt/transcribe`, formData, {
        headers: formData.getHeaders()
      });

      return response.data.transcription;
    } catch (error) {
      console.error('STT error:', error.message);
      throw new Error('Failed to transcribe audio');
    }
  }

  static async transcribeBlob(audioBuffer) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBuffer, { filename: 'audio.wav' });

      const response = await axios.post(`${VOICE_AGENT_URL}/api/stt/transcribe`, formData, {
        headers: formData.getHeaders()
      });

      return response.data.transcription;
    } catch (error) {
      console.error('STT error:', error.message);
      throw new Error('Failed to transcribe audio');
    }
  }
}

module.exports = STTService;
