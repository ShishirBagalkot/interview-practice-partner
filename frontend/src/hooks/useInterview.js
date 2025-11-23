import { useState, useCallback } from 'react';
import { createSession, sendMessage, sendAudio, getEvaluation } from '../services/api';

export const useInterviewSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startSession = useCallback(async (roleId, voiceEnabled = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createSession(roleId, voiceEnabled);
      setSessionId(data.sessionId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendTextMessage = useCallback(async (message) => {
    if (!sessionId) throw new Error('No active session');
    
    setLoading(true);
    setError(null);
    try {
      const data = await sendMessage(sessionId, message);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const sendVoiceMessage = useCallback(async (audioBlob) => {
    if (!sessionId) throw new Error('No active session');
    
    setLoading(true);
    setError(null);
    try {
      const data = await sendAudio(sessionId, audioBlob);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const requestEvaluation = useCallback(async () => {
    if (!sessionId) throw new Error('No active session');
    
    setLoading(true);
    setError(null);
    try {
      const data = await getEvaluation(sessionId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return {
    sessionId,
    loading,
    error,
    startSession,
    sendTextMessage,
    sendVoiceMessage,
    requestEvaluation
  };
};
