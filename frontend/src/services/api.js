import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Session APIs
export const createSession = async (roleId, voiceEnabled) => {
  const response = await api.post('/session/create', { roleId, voiceEnabled });
  return response.data;
};

export const endSession = async (sessionId) => {
  const response = await api.post('/session/end', { sessionId });
  return response.data;
};

// Interview APIs
export const sendMessage = async (sessionId, message) => {
  const response = await api.post('/interview/message', { sessionId, message });
  return response.data;
};

export const sendAudio = async (sessionId, audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('sessionId', sessionId);
  
  const response = await api.post('/interview/audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getEvaluation = async (sessionId) => {
  const response = await api.get(`/interview/evaluation/${sessionId}`);
  return response.data;
};

// History APIs
export const getHistory = async () => {
  const response = await api.get('/history/sessions');
  return response.data;
};

export const getSessionDetails = async (sessionId) => {
  const response = await api.get(`/history/session/${sessionId}`);
  return response.data;
};

// Role Templates
export const getRoleTemplates = async () => {
  const response = await api.get('/interview/roles');
  return response.data;
};

export default api;
