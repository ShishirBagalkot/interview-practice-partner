module.exports = {
  url: process.env.OLLAMA_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'mistral',
  options: {
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1000
  }
};
