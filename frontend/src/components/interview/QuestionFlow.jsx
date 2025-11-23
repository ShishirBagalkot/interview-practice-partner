import React from 'react';

const QuestionFlow = ({ messages, currentQuestion }) => {
  const questionMessages = messages.filter(m => m.role === 'interviewer');
  const currentIndex = questionMessages.length;

  return (
    <div className="question-flow">
      <div className="progress-bar">
        <div className="progress-steps">
          {questionMessages.map((_, index) => (
            <div
              key={index}
              className={`step ${index < currentIndex ? 'completed' : ''} ${
                index === currentIndex - 1 ? 'current' : ''
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
      {currentQuestion && (
        <div className="current-question">
          <h3>Current Question</h3>
          <p>{currentQuestion}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionFlow;
