import React from 'react';

const FeedbackPanel = ({ evaluation }) => {
  if (!evaluation) return null;

  const { overallScore, strengths, areasForImprovement, detailedFeedback } = evaluation;

  return (
    <div className="feedback-panel">
      <h2>Interview Evaluation</h2>
      
      <div className="score-section">
        <h3>Overall Score</h3>
        <div className="score-display">
          <span className="score-value">{overallScore}</span>
          <span className="score-max">/ 100</span>
        </div>
      </div>

      <div className="strengths-section">
        <h3>Strengths</h3>
        <ul>
          {strengths?.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="improvements-section">
        <h3>Areas for Improvement</h3>
        <ul>
          {areasForImprovement?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      {detailedFeedback && (
        <div className="detailed-feedback">
          <h3>Detailed Feedback</h3>
          <p>{detailedFeedback}</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
