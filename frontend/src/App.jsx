import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider } from './context/GameContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LevelView from './pages/LevelView';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Store from './pages/Store';
import Community from './pages/Community';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Splash from './pages/Splash';
import ChatBot from './components/common/ChatBot';


function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <GameProvider>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <Splash key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-gray-800"
          >
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Login />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/level/:id" element={<LevelView />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/store" element={<Store />} />
                <Route path="/community" element={<Community />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />


                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <ChatBot />
            </Router>
          </motion.div>
        )}
      </AnimatePresence>
    </GameProvider>
  );
}


export default App;
