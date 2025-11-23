import React, { createContext, useContext, useState } from 'react';

const InterviewContext = createContext();

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within InterviewProvider');
  }
  return context;
};

export const InterviewProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState([]);

  const startSession = (role, voiceEnabled = false) => {
    setSelectedRole(role);
    setIsVoiceMode(voiceEnabled);
    setMessages([]);
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const endSession = () => {
    setSessionId(null);
    setSelectedRole(null);
    setMessages([]);
  };

  const value = {
    sessionId,
    setSessionId,
    selectedRole,
    setSelectedRole,
    isVoiceMode,
    setIsVoiceMode,
    messages,
    setMessages,
    startSession,
    addMessage,
    endSession
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
