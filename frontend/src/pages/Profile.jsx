import React, { useMemo } from 'react';
import Header from '../components/common/Header';
import {
    Award, Droplets, Recycle, Leaf, TrendingUp, Calendar,
    CheckCircle, XCircle, Clock, ArrowRight, Star, Wallet, Lock, Unlock
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, levels } = useGame(); // using levels from context
    const navigate = useNavigate();

    // -- DASHBOARD LOGIC MOVED INSIDE COMPONENT FOR SAFETY --
    const dashboardData = useMemo(() => {
        if (!user) return null;

        // 1. Level Progress
        // Use context levels if available, or fallback to 5
        const totalLevels = levels.length || 5;
        const progressMap = {};
        user.progress?.forEach(p => {
            // Normalized status
            progressMap[p.level_id] = p.status === 'completed' || p.status === 'COMPLETED' ? 'completed' : 'unlocked';
        });

        // Ensure Level 1 is always unlocked if not present
        if (!progressMap[1]) progressMap[1] = 'unlocked';

        const completedCount = Object.values(progressMap).filter(s => s === 'completed').length;
        const completionPercentage = Math.round((completedCount / totalLevels) * 100);

        // 2. Streaks Mock
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        // Generate a fake history based on streak count. 
        // If streak is 3, last 3 days of "week" are checked. 
        // This is purely visual for now.
        const streakHistory = days.map((day, index) => {
            // Simple logic: if index is >= (7 - streak), it's a check
            // We'll just make the last 'user.streak' days checked for visual flair
            // Clamped to 7
            const effectiveStreak = Math.min(user.streak || 0, 7);
            const isChecked = index >= (7 - effectiveStreak);
            return { day, status: isChecked ? 'check' : 'miss' };
        });

        // 3. Activity Feed (Derived)
        const recentActivity = [];
        // Add badges to activity
        const badgesEarned = []; // we will calc badges below
        // Add level completions
        user.progress?.filter(p => p.status === 'completed' || p.status === 'COMPLETED').forEach(p => {
            recentActivity.push({
                type: 'level',
                text: `Completed Level ${p.level_id}`,
                time: 'Recently',
                icon: <CheckCircle size={16} className="text-green-500" />
            });
        });
        // Add streak milestone
        if (user.streak > 0) {
            recentActivity.push({
                type: 'streak',
                text: `Reached ${user.streak} Day Streak!`,
                time: 'Today',
                icon: <TrendingUp size={16} className="text-orange-500" />
            });
        }
        // Limit to 4
        const feed = recentActivity.slice(0, 4);
        if (feed.length === 0) {
            feed.push({ type: 'info', text: "Started Eco Journey!", time: "Just now", icon: <Star size={16} className="text-yellow-500" /> });
        }

        // 4. Badges (Same logic as before)
        const badges = [];
        // Badge 1: Waste Hero
        if (user.coins >= 100) badges.push({ id: 1, name: "Waste Hero", image: "/badges/waste-hero.png", fallbackIcon: <Recycle className="w-8 h-8 text-white" />, color: "bg-green-500", date: "Just now" });
        // Badge 2: Water Saver
        if (completedCount >= 2) badges.push({ id: 2, name: "Water Saver", image: "/badges/water-saver.png", fallbackIcon: <Droplets className="w-8 h-8 text-white" />, color: "bg-blue-500", date: "Recently" });
        // Badge 0: Newbie (Always)
        badges.push({ id: 0, name: "Newbie", image: "/badges/newbie.png", fallbackIcon: <Leaf className="w-8 h-8 text-white" />, color: "bg-gray-400", date: "Today" });

        badges.sort((a, b) => a.id - b.id);

        // 5. Next Mission
        // Find first unlocked or locked level
        let nextLevelId = 1;
        for (let i = 1; i <= totalLevels; i++) {
            if (progressMap[i] !== 'completed') {
                nextLevelId = i;
                break;
            }
        }
        // Get Level Details
        const nextLevel = levels.find(l => l.id === nextLevelId) || { title: `Level ${nextLevelId}`, description: "Continue your journey!" };

        // 6. Coin Stats
        const earned = user.coins + 80; // Fake "spent" amount to make it look active
        const spent = 80;

        return {
            completedCount,
            totalLevels,
            completionPercentage,
            quizzesAttempted: completedCount * 5 + 2, // Fake stats for "Quizzes Attempted" based on progress
            tasksCompleted: completedCount,
            streakHistory,
            feed,
            badges,
            nextLevelId,
            nextLevel,
            earned,
            spent,
            progressMap
        };

    }, [user, levels]);

    if (!user || !dashboardData) return <div className="text-center mt-20 text-green-600 font-bold animate-pulse">Loading Profile...</div>;

    const {
        completedCount, totalLevels, completionPercentage, quizzesAttempted, tasksCompleted,
        streakHistory, feed, badges, nextLevelId, nextLevel, earned, spent, progressMap
    } = dashboardData;

    return (
        <div className="min-h-screen bg-green-50 pb-20 font-sans">
            <Header />

            <main className="max-w-6xl mx-auto px-4 pt-6 space-y-8">

                {/* 1. TOP SECTION: Profile Card + Progress + Streak (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* A. Profile & Main Stats (Left - Span 8) */}
                    <div className="md:col-span-8 space-y-6">
                        {/* Profile Identity Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-green-100 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="w-28 h-28 bg-green-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-5xl relative z-10 shrink-0">
                                {user.profile_image ? (
                                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span>👩‍🎓</span>
                                )}
                                <div className="absolute bottom-0 right-0 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm">
                                    Lvl {dashboardData.nextLevelId}
                                </div>
                            </div>

                            <div className="text-center sm:text-left flex-1 z-10">
                                <h1 className="text-3xl font-black text-gray-800 tracking-tight">{user.username}</h1>
                                <p className="text-green-600 font-bold uppercase tracking-wider text-sm mb-4">{user.coins > 500 ? "Eco Warrior" : "Eco Scout"}</p>

                                {/* Progress Bar Container */}
                                <div className="bg-gray-100 rounded-2xl p-4 w-full max-w-md">
                                    <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                                        <span>Your Eco Journey 🌍</span>
                                        <span>{completionPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${completionPercentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-3 text-xs text-gray-500 font-medium">
                                        <div className="flex items-center gap-1"><CheckCircle size={14} className="text-green-600" /> {completedCount}/{totalLevels} Levels</div>
                                        <div className="flex items-center gap-1"><CheckCircle size={14} className="text-blue-600" /> {quizzesAttempted} Quizzes</div>
                                        <div className="flex items-center gap-1"><CheckCircle size={14} className="text-orange-600" /> {tasksCompleted} Tasks</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next Mission CTA */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1" onClick={() => navigate(`/level/${nextLevelId}`)}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/20 transition"></div>

                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-widest">Next Mission</span>
                                        <span className="animate-pulse text-yellow-300">🔥 Hot</span>
                                    </div>
                                    <h2 className="text-2xl font-black mb-2">Complete Level {nextLevelId}: {nextLevel.title || "Next Level"}</h2>
                                    <ul className="text-blue-100 text-sm space-y-1">
                                        <li className="flex items-center gap-2">🎥 Watch Video (5 min)</li>
                                        <li className="flex items-center gap-2">📝 Answer 5 Quiz Questions</li>
                                    </ul>
                                </div>
                                <button className="bg-white text-blue-800 px-6 py-3 rounded-xl font-black text-lg shadow-lg flex items-center gap-2 hover:bg-blue-50 transition">
                                    Start Now <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* B. Streak & Coins (Right - Span 4) */}
                    <div className="md:col-span-4 space-y-6">

                        {/* Streak Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-orange-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><TrendingUp className="text-orange-500" /> Learning Streak</h3>
                                    <p className="text-3xl font-black text-gray-800 mt-1">{user.streak} <span className="text-sm font-normal text-gray-500">Days</span></p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                                    <Calendar size={24} />
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-center">
                                {streakHistory.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1">
                                        <span className="text-xs text-gray-400 font-bold uppercase">{d.day[0]}</span>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${d.status === 'check' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-300'}`}>
                                            {d.status === 'check' ? '✔' : '·'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* EcoCoins Summary */}
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-yellow-100">
                            <div className="flex items-center gap-2 mb-4">
                                <Wallet className="text-yellow-500" />
                                <h3 className="font-bold text-gray-800">EcoCoins Summary</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Total Earned</span>
                                    <span className="font-bold text-gray-800 flex items-center gap-1">+{earned} <span className="text-yellow-500">🪙</span></span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Spent in Store</span>
                                    <span className="font-bold text-gray-800 flex items-center gap-1">-{spent} <span className="text-yellow-600">🪙</span></span>
                                </div>
                                <div className="h-px bg-gray-100 my-2"></div>
                                <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                                    <span className="text-yellow-800 font-bold">Available</span>
                                    <span className="font-black text-2xl text-yellow-600">{user.coins}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 2. MIDDLE SECTION: Level Timeline & Activity Feed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Level Tracker */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            🗺 Level Tracker
                        </h2>
                        <div className="space-y-2">
                            {levels && levels.length > 0 ? levels.map((l) => (
                                <div
                                    key={l.id}
                                    onClick={() => navigate(`/level/${l.id}`)}
                                    className={`relative flex items-center gap-4 p-4 rounded-2xl border transition cursor-pointer hover:shadow-md ${progressMap[l.id] === 'completed' ? 'bg-green-50 border-green-200' : progressMap[l.id] === 'unlocked' ? 'bg-white border-green-500 border-2' : 'bg-gray-50 border-gray-200 opacity-70'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${progressMap[l.id] === 'completed' ? 'bg-green-500' : progressMap[l.id] === 'unlocked' ? 'bg-white border-2 border-green-500 text-green-500' : 'bg-gray-300'}`}>
                                        {progressMap[l.id] === 'completed' ? '✔' : progressMap[l.id] === 'unlocked' ? '🔓' : '🔒'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-bold ${progressMap[l.id] === 'completed' ? 'text-green-800' : 'text-gray-800'}`}>Level {l.id}: {l.title}</h4>
                                        <p className="text-xs text-gray-500">{progressMap[l.id] === 'completed' ? 'Completed' : progressMap[l.id] === 'unlocked' ? 'In Progress' : 'Locked'}</p>
                                    </div>
                                    {progressMap[l.id] === 'unlocked' && (
                                        <div className="absolute right-4 animate-pulse">
                                            <ArrowRight className="text-green-500" size={20} />
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <p>Loading Levels...</p>
                            )}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            🕒 Recent Activity
                        </h2>
                        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 h-full">
                            <div className="space-y-6">
                                {feed.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="mt-1 bg-gray-50 p-2 rounded-full border border-gray-100">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{item.text}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* 3. BOTTOM SECTION: Badges (Improved) */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Award className="text-yellow-500" /> Collection
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {badges.map((badge) => (
                            <div key={badge.id} className="bg-white p-6 rounded-3xl shadow hover:shadow-xl transition transform hover:-translate-y-2 flex flex-col items-center text-center group relative">
                                <div className={`absolute top-2 right-2 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badge.id === 0 ? 'hidden' : ''}`}>Rare</div>

                                <div className={`rounded-full mb-4 shadow-lg group-hover:scale-110 transition flex items-center justify-center w-20 h-20 overflow-hidden relative border-4 border-white ${badge.color}`}>
                                    <img
                                        src={badge.image}
                                        alt={badge.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                                        {badge.fallbackIcon}
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-800 text-sm">{badge.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">Unlocked {badge.date}</p>
                            </div>
                        ))}

                        {/* Locked Badge (Visual only) */}
                        <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center opacity-70 group grayscale hover:grayscale-0 transition">
                            <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                                <Lock className="text-gray-400" />
                            </div>
                            <h3 className="font-bold text-gray-500 text-sm">Mystery Badge</h3>
                            <p className="text-xs text-gray-400 mt-1">Complete Level 5</p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Profile;