import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../../context/InterviewContext';
import { getRoleTemplates } from '../../services/api';

const RoleSelector = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const navigate = useNavigate();
  const { startSession } = useInterview();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await getRoleTemplates();
      setRoles(data.roles);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleStart = () => {
    if (selectedRole) {
      startSession(selectedRole, voiceEnabled);
      navigate('/interview');
    }
  };

  return (
    <div className="role-selector">
      <h2>Select Interview Role</h2>
      <div className="roles-grid">
        {roles.map(role => (
          <div
            key={role.id}
            className={`role-card ${selectedRole?.id === role.id ? 'selected' : ''}`}
            onClick={() => setSelectedRole(role)}
          >
            <h3>{role.title}</h3>
            <p>{role.description}</p>
          </div>
        ))}
      </div>
      <div className="options">
        <label>
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={(e) => setVoiceEnabled(e.target.checked)}
          />
          Enable Voice Mode
        </label>
      </div>
      <button onClick={handleStart} disabled={!selectedRole}>
        Start Interview
      </button>
    </div>
  );
};

export default RoleSelector;
