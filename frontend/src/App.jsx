import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LevelView from './pages/LevelView';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="text-gray-800">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} /> {/* Reuse Login for prototype */}
            
            {/* Protected Routes (Mocked) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/level/:id" element={<LevelView />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;
