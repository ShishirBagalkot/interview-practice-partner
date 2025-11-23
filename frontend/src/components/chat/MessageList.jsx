import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message ${message.role === 'user' ? 'user-message' : 'interviewer-message'}`}
        >
          <div className="message-header">
            <span className="message-role">
              {message.role === 'user' ? 'You' : 'Interviewer'}
            </span>
            <span className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="message-content">{message.content}</div>
          {message.audioUrl && (
            <audio controls src={message.audioUrl} className="message-audio" />
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
