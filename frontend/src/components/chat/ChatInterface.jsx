import React, { useState, useEffect } from 'react';
import { useInterview } from '../../context/InterviewContext';
import MessageList from './MessageList';
import InputBox from './InputBox';
import QuestionFlow from '../interview/QuestionFlow';
import FeedbackPanel from '../interview/FeedbackPanel';

const ChatInterface = () => {
  const { messages, selectedRole, isVoiceMode } = useInterview();
  const [showFeedback, setShowFeedback] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const currentQuestion = messages
    .filter(m => m.role === 'interviewer')
    .slice(-1)[0]?.content;

  const handleEndInterview = async () => {
    // Request final evaluation
    setShowFeedback(true);
  };

  return (
    <div className="chat-interface">
      <div className="interview-header">
        <h2>{selectedRole?.title} Interview</h2>
        <button onClick={handleEndInterview}>End Interview</button>
      </div>

      <QuestionFlow messages={messages} currentQuestion={currentQuestion} />

      <div className="chat-container">
        <MessageList messages={messages} />
        <InputBox voiceEnabled={isVoiceMode} />
      </div>

      {showFeedback && (
        <div className="feedback-overlay">
          <FeedbackPanel evaluation={evaluation} />
          <button onClick={() => setShowFeedback(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
