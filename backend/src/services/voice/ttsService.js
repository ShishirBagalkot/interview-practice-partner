const axios = require('axios');
const fs = require('fs');
const path = require('path');

const VOICE_AGENT_URL = process.env.VOICE_AGENT_URL || 'http://localhost:5001';
const AUDIO_STORAGE_PATH = process.env.AUDIO_STORAGE_PATH || path.join(__dirname, '../../../data/audio/generated');

class TTSService {
  static async synthesize(text, outputFileName) {
    try {
      const response = await axios.post(`${VOICE_AGENT_URL}/api/tts/synthesize`, 
        { text },
        { responseType: 'arraybuffer' }
      );

      // Ensure output directory exists
      if (!fs.existsSync(AUDIO_STORAGE_PATH)) {
        fs.mkdirSync(AUDIO_STORAGE_PATH, { recursive: true });
      }

      // Save audio file
      const outputPath = path.join(AUDIO_STORAGE_PATH, outputFileName);
      fs.writeFileSync(outputPath, response.data);

      return `/audio/generated/${outputFileName}`;
    } catch (error) {
      console.error('TTS error:', error.message);
      throw new Error('Failed to synthesize speech');
    }
  }

  static async synthesizeToBuffer(text) {
    try {
      const response = await axios.post(`${VOICE_AGENT_URL}/api/tts/synthesize`, 
        { text },
        { responseType: 'arraybuffer' }
      );

      return response.data;
    } catch (error) {
      console.error('TTS error:', error.message);
      throw new Error('Failed to synthesize speech');
    }
  }
}

module.exports = TTSService;
