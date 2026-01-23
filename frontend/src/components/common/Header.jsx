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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                <div className="w-full px-4 sm:px-8 h-20 flex justify-between items-center gap-2 sm:gap-6">

                    {/* LEFT: Brand & Main Nav */}
                    <div className="flex items-center gap-4 sm:gap-10">
                        <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 sm:gap-3 group">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-green-200 shadow-md group-hover:rotate-6 transition-transform">
                                <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="font-black text-xl sm:text-2xl text-slate-800 tracking-tight hidden xs:block">EcoLoop</span>
                        </Link>

                        {isLoggedIn && (
                            <nav className="hidden lg:flex items-center gap-1 sm:gap-2">
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
                            <div className="flex gap-4 sm:gap-6 items-center">
                                <Link to="/about" className="text-sm sm:text-base font-bold text-slate-500 hover:text-green-600 hidden sm:block">About</Link>
                                <Link to="/contact" className="text-sm sm:text-base font-bold text-slate-500 hover:text-green-600 hidden sm:block">Contact</Link>
                                <Link to="/" className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-sm sm:text-base hover:bg-green-700 transition shadow-lg shadow-green-200">
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
                                <div className="flex items-center gap-1.5 sm:gap-3">
                                    {/* Scanner Trigger (n2 feature) */}
                                    <button
                                        onClick={() => setIsScannerOpen(true)}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition shadow-sm relative group w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                                        title="AI Eco-Scanner"
                                    >
                                        <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-blue-500 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
                                    </button>

                                    {/* Challenges (n1) */}
                                    <button
                                        onClick={() => setIsChallengesOpen(true)}
                                        className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-white hover:text-emerald-600 hover:shadow-md transition-all group"
                                        title="Challenges"
                                    >
                                        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border border-white z-10"></div>
                                        <Target className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                                    </button>

                                    <div className="hidden sm:flex items-center gap-1.5 sm:gap-3">
                                        <IconButton to="/leaderboard" icon={Trophy} title="Leaderboard" />
                                        <IconButton to="/store" icon={ShoppingBag} title="Store" />
                                    </div>

                                    {/* Mobile Nav Button (Fixed) */}
                                    <div className="lg:hidden">
                                         <button 
                                            onClick={() => setIsMenuOpen(true)}
                                            className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
                                         >
                                            <Menu className="w-6 h-6" />
                                         </button>
                                    </div>

                                    {/* Profile */}
                                    <Link to="/profile" className="flex items-center gap-2 sm:gap-3 group bg-slate-50 px-2 sm:px-3 py-1.5 rounded-2xl border border-slate-100 hover:bg-white transition-all hover:shadow-sm">
                                        <div className="flex flex-col items-end hidden lg:flex">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Identity</span>
                                            <span className="text-xs font-black text-green-600 leading-none">{identity}</span>
                                        </div>
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-500 group-hover:border-green-600 transition overflow-hidden shadow-sm" title={`${user.username} (${identity})`}>
                                            <span className="text-lg sm:text-xl">👩‍🎓</span>
                                        </div>
                                    </Link>

                                    <button onClick={handleLogout} className="text-slate-300 hover:text-red-500 transition ml-1" title="Logout">
                                        <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
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

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 z-[110] bg-white flex flex-col p-8"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                                    <Leaf className="w-6 h-6" />
                                </div>
                                <span className="font-black text-2xl text-slate-800">EcoLoop</span>
                            </div>
                            <button 
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 bg-slate-100 rounded-full text-slate-600"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-6">
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-slate-800 hover:text-green-600 transition flex items-center gap-4">
                                <Leaf className="text-green-500" /> Play
                            </Link>
                            <Link to="/community" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-slate-800 hover:text-green-600 transition flex items-center gap-4">
                                <Globe className="text-blue-500" /> Community
                            </Link>
                            <Link to="/leaderboard" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-slate-800 hover:text-green-600 transition flex items-center gap-4">
                                <Trophy className="text-yellow-500" /> Leaderboard
                            </Link>
                            <Link to="/store" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black text-slate-800 hover:text-green-600 transition flex items-center gap-4">
                                <ShoppingBag className="text-orange-500" /> Store
                            </Link>
                            <div className="h-px bg-slate-100 my-4"></div>
                            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-slate-500 hover:text-green-600 flex items-center gap-4">
                                <Info size={20} /> About Us
                            </Link>
                            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-slate-500 hover:text-green-600 flex items-center gap-4">
                                <Mail size={20} /> Contact Us
                            </Link>
                        </nav>

                        <div className="mt-auto pt-8 border-t border-slate-100">
                             <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[2.5rem] mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-500">
                                        <span className="text-2xl">👩‍🎓</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800">{user.username}</p>
                                        <p className="text-xs font-bold text-green-600 uppercase tracking-widest">{identity}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Coins</p>
                                    <p className="text-xl font-black text-yellow-600">{user.coins}</p>
                                </div>
                             </div>

                             <button 
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-3 py-5 bg-red-50 text-red-600 rounded-[2rem] font-black hover:bg-red-100 transition"
                             >
                                <LogOut size={24} /> Logout
                             </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
