import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowRight, Zap, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

const CompletionAnimation = ({ show, challenge, onClose }) => {
    useEffect(() => {
        if (show) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [show]);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        className="relative bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl text-center overflow-hidden border border-gray-100"
                    >
                        {/* Background Orbs */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

                        <div className="relative z-10">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                                className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-yellow-500/30"
                            >
                                <Trophy className="w-12 h-12 text-white" />
                            </motion.div>

                            <h2 className="text-4xl font-black text-gray-900 mb-2">Well Done!</h2>
                            <p className="text-gray-500 font-bold mb-8">You completed your {challenge?.type} task!</p>

                            <div className="bg-gray-50 rounded-[2rem] p-6 mb-8 text-left border border-gray-100 italic font-medium text-gray-600">
                                "{challenge?.title}"
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-emerald-50 rounded-3xl p-4 border border-emerald-100">
                                    <div className="flex items-center gap-2 justify-center mb-1">
                                        <Coins className="w-5 h-5 text-emerald-600" />
                                        <span className="text-2xl font-black text-emerald-700">+{challenge?.coin_reward}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">EcoCoins</span>
                                </div>
                                <div className="bg-amber-50 rounded-3xl p-4 border border-amber-100">
                                    <div className="flex items-center gap-2 justify-center mb-1">
                                        <Zap className="w-5 h-5 text-amber-600 fill-amber-400" />
                                        <span className="text-2xl font-black text-amber-700">{challenge?.type === 'daily' ? '+1' : '0'}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Streak Bonus</span>
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 group shadow-xl hover:shadow-emerald-200"
                            >
                                <span>Continue Exploring</span>
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CompletionAnimation;