import React, { useMemo } from 'react';
import { 
    Award, TrendingUp, Calendar, ArrowLeft, ArrowRight, 
    CheckCircle, Droplets, Recycle, Leaf, Trophy, Star,
    Wallet, Lock
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import Header from '../components/common/Header';

const Profile = () => {
    const { user, levels } = useGame();
    const navigate = useNavigate();
    const cardRef = React.useRef(null);

    const dashboardData = useMemo(() => {
        if (!user || !levels) return null;

        const profileLevelLimit = 5;
        const progressMap = (user.progress || []).reduce((acc, p) => {
            acc[p.level_id] = p.status;
            return acc;
        }, {});

        const completedCount = Object.values(progressMap).filter(s => s === 'completed').length;
        
        const streakHistory = [
            { day: 'Mon', status: user.streak > 0 ? 'check' : 'dot' },
            { day: 'Tue', status: user.streak > 1 ? 'check' : 'dot' },
            { day: 'Wed', status: user.streak > 2 ? 'check' : 'dot' },
            { day: 'Thu', status: user.streak > 3 ? 'check' : 'dot' },
            { day: 'Fri', status: user.streak > 4 ? 'check' : 'dot' },
            { day: 'Sat', status: user.streak > 5 ? 'check' : 'dot' },
            { day: 'Sun', status: user.streak > 6 ? 'check' : 'dot' },
        ];

        const feed = [
            { text: 'Completed "Waste Sorting" Quiz', time: '2 hours ago', icon: '📝' },
            { text: 'Earned "Daily Hero" Badge', time: '5 hours ago', icon: '🏆' },
            { text: 'Reached Level 3!', time: '1 day ago', icon: '⭐' }
        ];

        const badges = [
            { id: 0, name: 'Eco Starter', date: 'Jan 12', image: '', color: 'bg-green-100', fallbackIcon: <Leaf className="text-green-600" /> },
            { id: 1, name: 'Water Saver', date: 'Jan 14', image: '', color: 'bg-blue-100', fallbackIcon: <Droplets className="text-blue-600" /> },
            { id: 2, name: 'Recycle King', date: 'Jan 15', image: '', color: 'bg-lime-100', fallbackIcon: <Recycle className="text-lime-600" /> },
            { id: 3, name: 'Eco Legend', date: 'Jan 16', image: '', color: 'bg-yellow-100', fallbackIcon: <Award className="text-yellow-600" /> },
            { id: 4, name: 'Daily Hero', date: 'Jan 17', image: '', color: 'bg-orange-100', fallbackIcon: <TrendingUp className="text-orange-600" /> }
        ];

        const nextLevelId = completedCount + 1;
        const nextLevel = levels.find(l => l.id === nextLevelId) || levels[levels.length - 1] || {};

        const earned = (user.coins || 0) + 150;
        const spent = 20;

        const identities = [
            "Eco Novice", "Eco Beginner", "Climate Protector", "Nature Champion", "Planet Guardian", "Eco Legend"
        ];
        const identity = identities[Math.min(completedCount, identities.length - 1)];

        return {
            completedCount,
            totalLevels: levels.length,
            completionPercentage: Math.round((Math.min(completedCount, profileLevelLimit) / profileLevelLimit) * 100),
            tasksCompleted: completedCount,
            streakHistory,
            feed,
            badges,
            nextLevelId,
            nextLevel,
            earned,
            spent,
            progressMap,
            identity,
            co2Saved: "0.0",
            waterSaved: "0",
            wasteRecycled: "0.0"
        };

    }, [user, levels]);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        const canvas = await html2canvas(cardRef.current, {
            scale: 2,
            backgroundColor: null,
            logging: false,
            useCORS: true
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `${user.username}_Hero_ID.png`;
        link.click();
    };

    const handleShare = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, { scale: 2 });
            canvas.toBlob(async (blob) => {
                if (navigator.share && navigator.canShare({ files: [new File([blob], 'hero_id.png', { type: 'image/png' })] })) {
                    await navigator.share({
                        title: 'My Eco Hero ID',
                        text: `Check out my progress on EcoLoop! I'm an Official Guardian!`,
                        files: [new File([blob], 'hero_id.png', { type: 'image/png' })]
                    });
                } else {
                    const item = new ClipboardItem({ "image/png": blob });
                    await navigator.clipboard.write([item]);
                    alert("Hero ID Card copied to clipboard!");
                }
            });
        } catch (err) {
            console.error("Share failed", err);
        }
    };

    if (!user || !dashboardData) return <div className="text-center mt-20 text-green-600 font-bold animate-pulse">Loading Profile...</div>;

    const {
        totalLevels, nextLevelId, nextLevel, identity, co2Saved, waterSaved, wasteRecycled, 
        badges, progressMap, streakHistory, earned, spent, feed
    } = dashboardData;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            <main className="max-w-5xl mx-auto px-6 pt-10">
                {/* 1. TOP HEADER & NAVIGATION */}
                <div className="flex justify-between items-center mb-10">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-500 font-bold hover:text-green-600 transition"
                    >
                        <ArrowLeft size={20} /> Back to Dashboard
                    </button>
                </div>

                {/* 2. PROFILE HEADER (Restored Previous Style) */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 mb-8">
                    <div className="relative group">
                        <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-white">
                            {user.profile_image ? (
                                <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span>👩‍🎓</span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-gray-800">{user.username}</h1>
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100 uppercase tracking-wider self-center md:self-auto uppercase">
                                <CheckCircle size={14} className="fill-green-600 text-white" /> Verified Guardian
                            </span>
                        </div>
                        <p className="flex items-center justify-center md:justify-start gap-2 text-green-600 font-bold text-lg">
                            <TrendingUp size={20} /> {identity} • Level {nextLevelId}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">EcoCoins</p>
                           <p className="text-2xl font-black text-yellow-600">{user.coins}</p>
                        </div>
                    </div>
                </div>

                {/* 3. GRID SECTION (8+4) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
                    
                    {/* A. Next Mission (Left - Span 8) */}
                    <div className="md:col-span-8 flex flex-col">
                        <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-blue-100">
                             <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-widest">Next Mission</span>
                                        <span className="animate-pulse text-yellow-300">🔥 Hot</span>
                                    </div>
                                    <h2 className="text-2xl font-black mb-2">Complete Level {nextLevelId}: {nextLevel.title || "Next Level"}</h2>
                                    <ul className="text-blue-100 text-sm space-y-1 mb-8">
                                        <li className="flex items-center gap-2">🎥 Watch Video (5 min)</li>
                                        <li className="flex items-center gap-2">📝 Answer 5 Quiz Questions</li>
                                    </ul>
                                </div>
                                <button 
                                    onClick={() => navigate(`/level/${nextLevelId}`)}
                                    className="bg-white text-blue-800 px-6 py-3 rounded-xl font-black text-lg shadow-lg flex items-center gap-2 hover:bg-blue-50 transition w-fit"
                                >
                                    Start Now <ArrowRight size={20} />
                                </button>
                             </div>
                             {/* Decorative Circles */}
                             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                             <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                        </div>
                    </div>

                    {/* B. Streak & Coins (Right - Span 4) */}
                    <div className="md:col-span-4 space-y-6">
                        {/* Streak Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><TrendingUp className="text-orange-500" size={18} /> Learning Streak</h3>
                                    <p className="text-3xl font-black text-gray-800 mt-1">{user.streak} <span className="text-sm font-normal text-gray-500">Days</span></p>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                                    <Calendar size={24} />
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-center">
                                {streakHistory.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{d.day[0]}</span>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${d.status === 'check' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-300'}`}>
                                            {d.status === 'check' ? '✔' : '·'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* EcoCoins Summary */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-yellow-100">
                            <div className="flex items-center gap-2 mb-4">
                                <Wallet className="text-yellow-500" size={18} />
                                <h3 className="font-bold text-gray-800">EcoCoins Summary</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Total Earned</span>
                                    <span className="font-bold text-gray-800 flex items-center gap-1">+{earned} <span className="text-yellow-500 text-xs">🪙</span></span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Spent in Store</span>
                                    <span className="font-bold text-gray-800 flex items-center gap-1">-{spent} <span className="text-yellow-600 text-xs">🪙</span></span>
                                </div>
                                <div className="h-px bg-gray-50 my-1"></div>
                                <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                    <span className="text-yellow-800 font-bold text-xs uppercase tracking-wider">Available</span>
                                    <span className="font-black text-xl text-yellow-600">{user.coins}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. TRACKERS & ACTIVITY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Level Tracker */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                             🗺 Level Tracker
                        </h2>
                        <div className="space-y-3">
                            {levels && levels.slice(0, 5).map((l) => (
                                <div
                                    key={l.id}
                                    className={`relative flex items-center gap-4 p-4 rounded-2xl border transition ${progressMap[l.id] === 'completed' ? 'bg-green-50/50 border-green-100' : progressMap[l.id] === 'unlocked' ? 'bg-white border-green-500 border-2' : 'bg-gray-50/50 border-gray-100 opacity-70'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${progressMap[l.id] === 'completed' ? 'bg-green-500' : progressMap[l.id] === 'unlocked' ? 'bg-white border-2 border-green-500 text-green-500' : 'bg-gray-200 text-gray-400'}`}>
                                        {progressMap[l.id] === 'completed' ? '✔' : progressMap[l.id] === 'unlocked' ? '🔓' : '🔒'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-bold text-sm ${progressMap[l.id] === 'completed' ? 'text-green-800' : 'text-gray-800'}`}>Level {l.id}: {l.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{progressMap[l.id] === 'completed' ? 'Completed' : progressMap[l.id] === 'unlocked' ? 'In Progress' : 'Locked'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                             🕒 Recent Activity
                        </h2>
                        <div className="space-y-6">
                            {feed.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="mt-1 bg-gray-50 p-2 rounded-full border border-gray-50">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{item.text}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. VIRTUAL HERO ID SECTION (The Requested Add-on) */}
                <div className="mb-16">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
                        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-sm">
                            <Award size={24} className="opacity-80" />
                            </div>
                            Virtual Hero ID
                        </h2>
                        <div className="flex gap-4 w-full sm:w-auto">
                            <button onClick={handleShare} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-slate-600 px-8 py-3 rounded-2xl font-black shadow-sm border border-slate-100 hover:bg-slate-50 transition active:scale-95">
                                <ArrowRight size={20} className="rotate-45" /> Share
                            </button>
                            <button onClick={handleDownload} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-green-200 hover:bg-green-700 transition active:scale-95">
                                <Calendar size={20} /> Download
                            </button>
                        </div>
                    </div>

                    <div className="w-full flex justify-center py-6">
                        <div 
                            ref={cardRef} 
                            className="w-[700px] h-[400px] bg-white rounded-[3rem] shadow-2xl relative overflow-hidden border border-slate-100 flex p-12"
                        >
                            {/* Main Content Area */}
                            <div className="flex-1 z-10 space-y-8">
                                {/* Logo */}
                                <div className="flex items-center gap-3 text-green-600">
                                    <Leaf className="w-10 h-10 fill-green-600" />
                                    <span className="text-3xl font-black tracking-tighter uppercase">EcoLoop</span>
                                </div>

                                <div className="flex gap-10 pt-4">
                                    {/* Left Col: Avatar & Badge */}
                                    <div className="space-y-8">
                                        <div className="w-32 h-32 bg-[#f8faf9] rounded-3xl border-2 border-slate-100 p-2 shadow-inner group relative">
                                            <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-sm">
                                                {user.profile_image ? (
                                                    <img src={user.profile_image} alt="ID" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-5xl">👩‍🎓</div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Mock QR/Barcode */}
                                        <div className="grid grid-cols-2 gap-2 w-24 opacity-20">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className="w-full h-8 border-2 border-slate-800 rounded-sm"></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Col: Details */}
                                    <div className="flex-1 space-y-6 pt-2 text-left">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">GLOBAL GUARDIAN ID</p>
                                                <p className="text-2xl font-black text-slate-800 tracking-tight">EL-00000{user.id || '4'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">FULL NAME</p>
                                                <p className="text-2xl font-black text-slate-800 tracking-tight">{user.username}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 text-left">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">CURRENT STATUS</p>
                                                <p className="text-lg font-black text-green-600">{identity}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">LEVEL</p>
                                                <p className="text-2xl font-black text-slate-800">{nextLevelId}</p>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 flex gap-10">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">CO2 SAVED</p>
                                                <p className="text-sm font-black text-slate-800">{co2Saved}kg</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">WATER SAVED</p>
                                                <p className="text-sm font-black text-slate-800">{waterSaved}L</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Green Accent Section */}
                            <div className="absolute right-0 top-0 h-full w-[240px] z-0 overflow-hidden">
                                <div className="absolute inset-0 bg-green-500 origin-bottom-right rotate-[12deg] translate-x-12 translate-y-12 shadow-2xl"></div>
                                <div className="relative z-10 h-full flex flex-col items-center justify-start p-10 text-white text-left">
                                    <div className="bg-green-700/40 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase border border-white/20 shadow-xl mb-auto">
                                        OFFICIAL GUARDIAN
                                    </div>
                                    
                                    {/* Signature / Stamp */}
                                    <div className="mt-auto mb-10 flex gap-4">
                                        <div className="w-16 h-16 border-2 border-white/20 rounded-2xl flex items-center justify-center bg-white/5 backdrop-blur-md">
                                            <div className="w-10 h-10 border border-white/10 rounded-lg"></div>
                                        </div>
                                        <div className="w-16 h-16 border-2 border-white/20 rounded-2xl flex items-center justify-center bg-white/5 backdrop-blur-md">
                                            <div className="w-10 h-10 border border-white/10 rounded-lg"></div>
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full mb-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. COLLECTION SECTION */}
                <div className="mt-16">
                    <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                        <Trophy className="text-yellow-500" /> Your Collection
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                        {badges.map((badge) => (
                            <div key={badge.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-1 transition-all">
                                <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center border-4 border-white shadow-md ${badge.color} group-hover:scale-105 transition-transform overflow-hidden`}>
                                   {badge.fallbackIcon}
                                </div>
                                <h3 className="font-bold text-gray-800 text-xs leading-tight">{badge.name}</h3>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{badge.date}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Profile;