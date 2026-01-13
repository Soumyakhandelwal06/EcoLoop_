import React from 'react';
import { Leaf, Coins, Flame, LogOut, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';

const Header = () => {
    const { user, logout } = useGame();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirect to landing/login
    };

    // If loading or no user, still show the Logo at least
    const isLoggedIn = !!user;

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm px-6 py-4 flex justify-between items-center rounded-b-3xl mx-4 mt-2 mb-6">
            <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 group">
                <Leaf className="text-green-600 w-8 h-8 group-hover:rotate-12 transition-transform" />
                <span className="font-extrabold text-xl text-green-800 tracking-tight">EcoLoop</span>
            </Link>

            <div className="flex gap-4 items-center">
                {!isLoggedIn ? (
                    <Link to="/" className="bg-green-600 text-white px-5 py-2 rounded-full font-bold hover:bg-green-700 transition">
                        Login
                    </Link>
                ) : (
                    <>
                        {/* Streak Badge */}
                        <div className="hidden sm:flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full border border-orange-200 shadow-sm">
                            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                            <span className="font-bold text-orange-700">{user.streak} Days</span>
                        </div>
        
                        {/* Coins Badge */}
                        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200 shadow-sm">
                            <Coins className="w-5 h-5 text-yellow-600 fill-yellow-400" />
                            <span className="font-bold text-yellow-800">{user.coins}</span>
                        </div>

                        {/* Leaderboard Link */}
                        <Link to="/leaderboard" className="p-2 bg-yellow-50 text-yellow-600 rounded-full hover:bg-yellow-100 transition shadow-sm ml-1" title="Leaderboard">
                            <Trophy className="w-5 h-5" />
                        </Link>
        
                        {/* Profile Link */}
                        <Link to="/profile">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-500 shadow hover:shadow-md transition cursor-pointer" title={user.username}>
                               <span className="text-xl">👩‍🎓</span>
                            </div>
                        </Link>
        
                        {/* Logout Button */}
                        <button 
                            onClick={handleLogout}
                            className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition shadow-sm ml-2"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
