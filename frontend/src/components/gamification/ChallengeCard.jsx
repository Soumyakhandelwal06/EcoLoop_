import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar, CheckCircle2, Coins, ArrowRight, Loader, Upload, AlertCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import CompleteAnimation from "./CompleteAnimation";

const ChallengeCard = ({ challenge }) => {
    const { completeChallenge } = useGame();
    const [loading, setLoading] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        const res = await completeChallenge(challenge.id, file);
        setLoading(false);

        if (res.success) {
            setShowAnimation(true);
        } else {
            setError(res.message);
        }
    };

    const isDaily = challenge.type === 'daily';

    return (
        <>
            <motion.div
                whileHover={{ y: -8 }}
                className={`relative group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] ${challenge.is_completed ? 'opacity-80' : ''}`}
            >
                {/* Type Badge */}
                <div className="flex items-center justify-between mb-8">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDaily ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                        {isDaily ? <Zap size={12} className="fill-amber-400" /> : <Calendar size={12} />}
                        {challenge.type} Challenge
                    </div>
                    {challenge.is_completed && (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    )}
                </div>

                <div className="mb-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-emerald-700 transition-colors">
                        {challenge.title}
                    </h3>
                    <p className="text-gray-400 font-medium leading-relaxed text-sm">
                        {challenge.description}
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3 text-red-600 text-xs font-bold"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}

                <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <Coins className="w-4 h-4 text-emerald-600" />
                        <span className="font-black text-emerald-700">{challenge.coin_reward}</span>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={loading || challenge.is_completed}
                        className={`px-8 py-3 rounded-2xl font-black text-sm transition-all duration-300 flex items-center gap-2 active:scale-95 ${challenge.is_completed
                            ? 'bg-emerald-100 text-emerald-600 cursor-default'
                            : 'bg-gray-900 text-white hover:bg-emerald-600 shadow-lg hover:shadow-emerald-200'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>Verifying...</span>
                            </>
                        ) : challenge.is_completed ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Completed</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                <span>Verify & Complete</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Aesthetic Background Accents */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${isDaily ? 'bg-amber-400' : 'bg-purple-400'
                    }`}></div>
            </motion.div>

            <CompleteAnimation
                show={showAnimation}
                challenge={challenge}
                onClose={() => setShowAnimation(false)}
            />
        </>
    );
};

export default ChallengeCard;