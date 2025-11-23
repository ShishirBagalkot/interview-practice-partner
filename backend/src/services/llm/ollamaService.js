const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'mistral';

class OllamaService {
  static async generate(prompt, context = []) {
    try {
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: MODEL,
        prompt: prompt,
        context: context,
        stream: false
      });

      return {
        response: response.data.response,
        context: response.data.context
      };
    } catch (error) {
      console.error('Ollama API error:', error.message);
      throw new Error('Failed to generate response from LLM');
    }
  }

  static async chat(messages) {
    try {
      const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
        model: MODEL,
        messages: messages,
        stream: false
      });

      return response.data.message.content;
    } catch (error) {
      console.error('Ollama chat error:', error.message);
      throw new Error('Failed to chat with LLM');
    }
  }
}

module.exports = OllamaService;
