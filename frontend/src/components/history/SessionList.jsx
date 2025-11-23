import React from 'react';

const SessionList = ({ sessions, onSelectSession, selectedId }) => {
  return (
    <div className="session-list">
      <h3>Past Sessions</h3>
      {sessions.length === 0 ? (
        <p>No previous sessions found.</p>
      ) : (
        <ul>
          {sessions.map(session => (
            <li
              key={session.id}
              className={selectedId === session.id ? 'selected' : ''}
              onClick={() => onSelectSession(session)}
            >
              <div className="session-info">
                <h4>{session.roleTitle}</h4>
                <p className="session-date">
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
                {session.score && (
                  <span className="session-score">Score: {session.score}/100</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SessionList;
