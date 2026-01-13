import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Flame, Coins, TrendingUp } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Header from '../components/common/Header';
import { motion } from 'framer-motion';

const Leaderboard = () => {
    const { fetchLeaderboard } = useGame();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRanking = async () => {
            const data = await fetchLeaderboard();
            setPlayers(data);
            setLoading(false);
        };
        loadRanking();
    }, []);

    const getRankIcon = (index) => {
        switch(index) {
            case 0: return <Crown className="w-8 h-8 text-yellow-500" />;
            case 1: return <Medal className="w-7 h-7 text-gray-400" />;
            case 2: return <Medal className="w-6 h-6 text-amber-600" />;
            default: return <span className="font-bold text-gray-500 w-6 h-6 flex items-center justify-center">{index + 1}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-green-50 pb-20">
            <Header />
            
            <main className="max-w-2xl mx-auto px-4 mt-8">
                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-4 bg-yellow-100 rounded-full mb-4 shadow-lg border-2 border-yellow-200"
                    >
                        <Trophy className="w-12 h-12 text-yellow-600" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-green-900 mb-2">Hall of Fame</h1>
                    <p className="text-green-700 font-bold flex items-center justify-center gap-2">
                        <TrendingUp size={20}/> Top Eco Warriors Worldwide
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-green-800 font-bold">Calculating Ranks...</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {players.map((player, index) => (
                                <motion.div 
                                    key={player.username}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center justify-between p-5 hover:bg-green-50/50 transition ${index === 0 ? 'bg-yellow-50/50' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0">
                                            {getRankIcon(index)}
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-gray-900 text-lg">{player.username}</p>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Guardian</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-1.5" title="Streak">
                                            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                                            <span className="font-black text-orange-700">{player.streak}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200" title="Total Coins">
                                            <Coins className="w-5 h-5 text-yellow-600 fill-yellow-400" />
                                            <span className="font-black text-yellow-800">{player.coins}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {players.length === 0 && (
                                <div className="p-10 text-center text-gray-400 italic font-medium">
                                    No ecological data yet. Join the adventure!
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <p className="text-center mt-8 text-green-700/60 font-medium text-sm">
                    Updated every few minutes • Fair Play Enabled
                </p>
            </main>
        </div>
    );
};

export default Leaderboard;
