import React from 'react';
import Header from '../components/common/Header';
import GameMap from '../components/map/GameMap';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-[#064e3b] pb-20 overflow-x-hidden selection:bg-green-200">
            <Header />
            
            <main className="w-full relative">
                <div className="absolute top-0 left-0 w-full z-10 pointer-events-none pt-4 flex flex-col items-center">
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-center mb-10"
                    >
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <Compass className="text-yellow-400 animate-spin-slow bg-black/20 p-1.5 rounded-full backdrop-blur-md border border-white/10" size={40} />
                            <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">World Explorer</h1>
                        </div>
                        <p className="text-white font-extrabold text-lg bg-green-600/80 px-8 py-2.5 rounded-full inline-block backdrop-blur-xl border-2 border-white/30 shadow-2xl">
                            Complete challenges to heal the environment! 🌱
                        </p>
                    </motion.div>
                </div>

                <div className="w-full">
                    <GameMap />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
