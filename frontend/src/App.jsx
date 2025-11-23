import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { InterviewProvider } from './context/InterviewContext';
import RoleSelector from './components/interview/RoleSelector';
import ChatInterface from './components/chat/ChatInterface';
import HistoryView from './components/history/HistoryView';
import './App.css';

function App() {
  return (
    <Router>
      <InterviewProvider>
        <div className="app-container">
          <header className="app-header">
            <h1>Interview Practice Partner</h1>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<RoleSelector />} />
              <Route path="/interview" element={<ChatInterface />} />
              <Route path="/history" element={<HistoryView />} />
            </Routes>
          </main>
        </div>
      </InterviewProvider>
    </Router>
  );
}

export default App;
