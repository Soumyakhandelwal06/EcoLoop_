import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Coins, Flame, LogOut, Trophy, ShoppingBag, Target, Camera, Globe, Info, Mail, Menu } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import StreakCalendar from './StreakCalendar';
import ChallengesModal from '../gamification/ChallengesModal';
import ScannerModal from '../scanner/ScannerModal';

const IconButton = ({ to, icon: Icon, title }) => (
    <Link to={to} className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all" title={title}>
        <Icon className="w-6 h-6" />
    </Link>
);

const NavLink = ({ to, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} className={`px-5 py-2.5 rounded-full font-bold text-base transition-all ${isActive ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
            {label}
        </Link>
    );
};

const Header = () => {
    const { user, logout } = useGame();
    const isLoggedIn = !!user;
    const navigate = useNavigate();
    const [showCalendar, setShowCalendar] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isChallengesOpen, setIsChallengesOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const identity = React.useMemo(() => {
        if (!user || !user.progress) return "Eco Hero";
        const completedCount = user.progress.filter(p => p.status === 'completed').length;
        const identities = [
            "Eco Novice", "Eco Beginner", "Climate Protector", "Nature Champion", "Planet Guardian", "Eco Legend"
        ];
        return identities[Math.min(completedCount, identities.length - 1)];
    }, [user]);

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div className="w-full px-8 h-20 flex justify-between items-center gap-6">

                    {/* LEFT: Brand & Main Nav */}
                    <div className="flex items-center gap-10">
                        <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-green-200 shadow-md group-hover:rotate-6 transition-transform">
                                <Leaf className="w-6 h-6" />
                            </div>
                            <span className="font-black text-2xl text-slate-800 tracking-tight hidden sm:block">EcoLoop</span>
                        </Link>

                        {isLoggedIn && (
                            <nav className="hidden md:flex items-center gap-2">
                                <NavLink to="/dashboard" label="Play" />
                                <NavLink to="/community" label="Community" />
                                <NavLink to="/about" label="About" />
                                <NavLink to="/contact" label="Contact" />
                            </nav>
                        )}
                    </div>

                    {/* RIGHT: Stats & Actions */}
                    <div className="flex items-center gap-4">
                        {!isLoggedIn ? (
                            <div className="flex gap-6 items-center">
                                <Link to="/about" className="text-base font-bold text-slate-500 hover:text-green-600">About</Link>
                                <Link to="/contact" className="text-base font-bold text-slate-500 hover:text-green-600">Contact</Link>
                                <Link to="/" className="bg-green-600 text-white px-6 py-2.5 rounded-full font-bold text-base hover:bg-green-700 transition shadow-lg shadow-green-200">
                                    Login
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Stats Group (n1 style) */}
                                <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 mr-2">
                                    <div
                                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                                        onClick={() => setShowCalendar(true)}
                                        title="View Streak"
                                    >
                                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                                        <span className="font-extrabold text-slate-700 text-base">{user.streak}</span>
                                    </div>
                                    <div className="w-px h-5 bg-slate-200"></div>
                                    <div className="flex items-center gap-2">
                                        <Coins className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                                        <span className="font-extrabold text-slate-700 text-base">{user.coins}</span>
                                    </div>
                                </div>

                                {/* Tools Group (Icons) */}
                                <div className="flex items-center gap-3">
                                    {/* Scanner Trigger (n2 feature) */}
                                    <button
                                        onClick={() => setIsScannerOpen(true)}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition shadow-sm relative group w-12 h-12 flex items-center justify-center"
                                        title="AI Eco-Scanner"
                                    >
                                        <Camera className="w-6 h-6" />
                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
                                    </button>

                                    {/* Challenges (n1) */}
                                    <button
                                        onClick={() => setIsChallengesOpen(true)}
                                        className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-white hover:text-emerald-600 hover:shadow-md transition-all group"
                                        title="Challenges"
                                    >
                                        <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white z-10"></div>
                                        <Target className="w-6 h-6" strokeWidth={2.5} />
                                    </button>

                                    <IconButton to="/leaderboard" icon={Trophy} title="Leaderboard" />
                                    <IconButton to="/store" icon={ShoppingBag} title="Store" />

                                    {/* Divider */}
                                    <div className="w-px h-10 bg-slate-100 mx-2"></div>

                                    {/* Profile */}
                                    <Link to="/profile" className="flex items-center gap-3 group bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100 hover:bg-white transition-all hover:shadow-sm">
                                        <div className="flex flex-col items-end hidden sm:flex">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Identity</span>
                                            <span className="text-xs font-black text-green-600 leading-none">{identity}</span>
                                        </div>
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-500 group-hover:border-green-600 transition overflow-hidden shadow-sm" title={`${user.username} (${identity})`}>
                                            <span className="text-xl">👩‍🎓</span>
                                        </div>
                                    </Link>

                                    <button onClick={handleLogout} className="text-slate-300 hover:text-red-500 transition ml-2" title="Logout">
                                        <LogOut className="w-6 h-6" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>


            </header>

            <ScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
            />

            {/* Streak Calendar Modal */}
            {isLoggedIn && (
                <>
                    <StreakCalendar
                        isOpen={showCalendar}
                        onClose={() => setShowCalendar(false)}
                        streak={user.streak}
                    />
                    <ChallengesModal
                        isOpen={isChallengesOpen}
                        onClose={() => setIsChallengesOpen(false)}
                    />
                </>
            )}
        </>
    );
};

export default Header;
