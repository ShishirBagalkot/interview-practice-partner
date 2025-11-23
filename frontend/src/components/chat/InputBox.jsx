import React, { useState } from 'react';
import { useInterview } from '../../context/InterviewContext';
import { useInterviewSession } from '../../hooks/useInterview';
import VoiceRecorder from './VoiceRecorder';

const InputBox = ({ voiceEnabled }) => {
  const [message, setMessage] = useState('');
  const { addMessage } = useInterview();
  const { sendTextMessage, sendVoiceMessage, loading } = useInterviewSession();

  const handleSendText = async () => {
    if (!message.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    addMessage(userMessage);
    setMessage('');

    try {
      const response = await sendTextMessage(message);
      addMessage({
        role: 'interviewer',
        content: response.message,
        timestamp: new Date().toISOString(),
        audioUrl: response.audioUrl
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendVoice = async (audioBlob) => {
    try {
      const response = await sendVoiceMessage(audioBlob);
      
      addMessage({
        role: 'user',
        content: response.transcription,
        timestamp: new Date().toISOString()
      });

      addMessage({
        role: 'interviewer',
        content: response.message,
        timestamp: new Date().toISOString(),
        audioUrl: response.audioUrl
      });
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="input-box">
      {voiceEnabled && <VoiceRecorder onSend={handleSendVoice} disabled={loading} />}
      
      <div className="text-input-container">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your answer..."
          disabled={loading}
          rows={3}
        />
        <button onClick={handleSendText} disabled={loading || !message.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default InputBox;
