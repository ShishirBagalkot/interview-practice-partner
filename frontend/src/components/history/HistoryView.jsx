import React, { useState, useEffect } from 'react';
import { getHistory } from '../../services/api';
import SessionList from './SessionList';
import ReplayViewer from './ReplayViewer';

const HistoryView = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="history-view">
      <h2>Interview History</h2>
      <div className="history-container">
        <SessionList
          sessions={sessions}
          onSelectSession={setSelectedSession}
          selectedId={selectedSession?.id}
        />
        {selectedSession && (
          <ReplayViewer session={selectedSession} />
        )}
      </div>
    </div>
  );
};

export default HistoryView;
