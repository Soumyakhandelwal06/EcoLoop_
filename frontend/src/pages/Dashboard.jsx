import React from 'react';
import Header from '../components/common/Header';
import GameMap from '../components/map/GameMap';
import { motion } from 'framer-motion';
import { Compass, Home } from 'lucide-react';
import { Link } from 'react-router-dom';



const Dashboard = () => {
    return (
        <div className="min-h-screen bg-[#064e3b] pb-20 overflow-x-hidden selection:bg-green-200 flex flex-col">
            <Header />

            <main className="w-full relative flex-1">
                {/* Float Controls */}
                <div className="absolute top-4 left-6 z-50 flex flex-col gap-3">
                    <Link to="/" className="flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white px-5 py-2.5 rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-95 group font-black shadow-2xl">
                        <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span>Home</span>
                    </Link>
                </div>

                {/* Hero / Title Section */}
                <div className="absolute top-0 left-0 w-full z-10 pointer-events-none pt-4 flex flex-col items-center px-4">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-center mb-10"
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3">
                            <Compass className="text-yellow-400 animate-spin-slow bg-black/20 p-1.5 rounded-full backdrop-blur-md border border-white/10" size={32} />
                            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">World Explorer</h1>
                        </div>
                        <p className="text-white font-extrabold text-sm sm:text-lg bg-green-600/80 px-6 sm:px-8 py-2 sm:py-2.5 rounded-full inline-block backdrop-blur-xl border-2 border-white/30 shadow-2xl">
                            Complete challenges to heal the environment! 🌱
                        </p>
                    </motion.div>
                </div>

                {/* --- Challenges Section --- */}
                <div className="w-full">
                    <GameMap />
                </div>

            </main>

        </div>
    );
};


export default Dashboard;
