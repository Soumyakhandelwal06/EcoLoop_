import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Calendar, Target, Loader } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import ChallengeCard from './ChallengeCard';

const ChallengesModal = ({ isOpen, onClose }) => {
    const { getChallenges, user } = useGame();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetch = async () => {
                setLoading(true);
                const data = await getChallenges();
                setChallenges(data || []);
                setLoading(false);
            };
            fetch();
        }
    }, [isOpen, user?.coins, user?.streak]);

    // Only show ONE of each
    const dailyChallenge = challenges.find(c => c.type === 'daily');
    const weeklyChallenge = challenges.find(c => c.type === 'weekly');

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-[#f8f9fa] rounded-[3rem] w-full max-w-2xl shadow-2xl border border-white/20 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
                                    <Target className="text-white w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Eco Challenges</h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching Challenges...</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Daily Section */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4 px-2">
                                            <Zap className="text-amber-500 fill-amber-400 w-4 h-4" />
                                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Daily Task</h3>
                                        </div>
                                        {dailyChallenge ? (
                                            <ChallengeCard challenge={dailyChallenge} />
                                        ) : (
                                            <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-gray-200">
                                                <p className="text-gray-400 font-medium">No daily challenges today!</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* Weekly Section */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4 px-2">
                                            <Calendar className="text-purple-500 w-4 h-4" />
                                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Weekly Goal</h3>
                                        </div>
                                        {weeklyChallenge ? (
                                            <ChallengeCard challenge={weeklyChallenge} />
                                        ) : (
                                            <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-gray-200">
                                                <p className="text-gray-400 font-medium">No weekly goals active!</p>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            )}
                        </div>
                        
                        {/* Footer Tips */}
                        <div className="bg-emerald-50 p-6 flex items-center gap-4 border-t border-emerald-100">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                               🌱
                           </div>
                           <p className="text-xs font-bold text-emerald-700 leading-relaxed">
                               Completing daily tasks keeps your streak alive! Weekly goals give extra EcoCoins for the shop.
                           </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ChallengesModal;