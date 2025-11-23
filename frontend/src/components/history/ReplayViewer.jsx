import React, { useState, useEffect } from 'react';
import { getSessionDetails } from '../../services/api';
import MessageList from '../chat/MessageList';
import FeedbackPanel from '../interview/FeedbackPanel';

const ReplayViewer = ({ session }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessionDetails();
  }, [session.id]);

  const loadSessionDetails = async () => {
    try {
      const data = await getSessionDetails(session.id);
      setDetails(data);
    } catch (error) {
      console.error('Error loading session details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading session...</div>;
  if (!details) return <div>Session not found</div>;

  return (
    <div className="replay-viewer">
      <h3>Session Replay</h3>
      <div className="session-metadata">
        <p><strong>Role:</strong> {details.roleTitle}</p>
        <p><strong>Date:</strong> {new Date(details.createdAt).toLocaleString()}</p>
        <p><strong>Duration:</strong> {details.duration} minutes</p>
      </div>

      <div className="replay-transcript">
        <h4>Transcript</h4>
        <MessageList messages={details.messages} />
      </div>

      {details.evaluation && (
        <FeedbackPanel evaluation={details.evaluation} />
      )}
    </div>
  );
};

export default ReplayViewer;
