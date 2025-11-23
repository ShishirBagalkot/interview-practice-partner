import React from 'react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

const VoiceRecorder = ({ onSend, disabled }) => {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  const handleToggleRecording = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob && onSend) {
        onSend(audioBlob);
      }
    } else {
      await startRecording();
    }
  };

  return (
    <div className="voice-recorder">
      <button
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={handleToggleRecording}
        disabled={disabled}
      >
        {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
      </button>
      {isRecording && <span className="recording-indicator">Recording...</span>}
    </div>
  );
};

export default VoiceRecorder;
