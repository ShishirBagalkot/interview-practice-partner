import { useState, useCallback } from 'react';
import audioService from '../services/audioService';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const startRecording = useCallback(async () => {
    const started = await audioService.startRecording();
    if (started) {
      setIsRecording(true);
      setAudioBlob(null);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const blob = await audioService.stopRecording();
    setIsRecording(false);
    setAudioBlob(blob);
    return blob;
  }, []);

  const playAudio = useCallback(async (url) => {
    return await audioService.playAudio(url);
  }, []);

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    playAudio
  };
};
