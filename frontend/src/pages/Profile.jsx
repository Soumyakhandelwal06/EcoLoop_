// import React from 'react';
// import Header from '../components/common/Header';
// import { Award, Droplets, Zap, Recycle, Leaf } from 'lucide-react';
// import { useGame } from '../context/GameContext';

// const Profile = () => {
//     const { user } = useGame();

//     if (!user) return <div className="text-center mt-20">Please Login</div>;

//     // Derive badges from user progress (Simple logic for now)
//     // If coins > 100 -> Waste Hero. If Level > 1 -> Water Saver.
//     const dynamicBadges = [];
//     if (user.coins >= 100) dynamicBadges.push({ id: 1, name: "Waste Hero", icon: <Recycle className="w-8 h-8 text-white"/>, color: "bg-green-500", date: "Just now" });
//     if (user.progress && user.progress.some(p => p.level_id === 2 && p.status === 'completed')) dynamicBadges.push({ id: 2, name: "Water Saver", icon: <Droplets className="w-8 h-8 text-white"/>, color: "bg-blue-500", date: "Recently" });
//     // Default badge
//     if (dynamicBadges.length === 0) dynamicBadges.push({ id: 0, name: "Newbie", icon: <Leaf className="w-8 h-8 text-white"/>, color: "bg-gray-400", date: "Today" });

//     const maxLevel = user.progress ? Math.max(1, ...user.progress.map(p => p.level_id)) : 1;

//     // Use real user object (preserving badge structure for map)
//     const profileData = {
//         name: user.username,
//         rank: user.coins > 500 ? "Eco Warrior" : "Eco Scout",
//         level: maxLevel,
//         coins: user.coins,
//         badges: dynamicBadges
//     };

//     return (
//         <div className="min-h-screen bg-green-50 pb-20">
//             <Header />

//             <main className="max-w-4xl mx-auto px-4">
//                 {/* Profile Header */}
//                 <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
//                     <div className="w-32 h-32 bg-green-100 rounded-full border-4 border-green-500 flex items-center justify-center text-6xl shadow-inner">
//                         👩‍🎓
//                     </div>
//                     <div className="text-center md:text-left flex-1">
//                         <h1 className="text-3xl font-bold text-gray-800">{profileData.name}</h1>
//                         <p className="text-xl text-green-600 font-bold mb-4">{profileData.rank}</p>
                        
//                         <div className="flex justify-center md:justify-start gap-4">
//                             <div className="bg-gray-100 px-6 py-3 rounded-2xl text-center">
//                                 <span className="block text-2xl font-bold text-gray-800">{profileData.level}</span>
//                                 <span className="text-xs text-gray-500 uppercase tracking-widest">Level</span>
//                             </div>
//                             <div className="bg-yellow-50 px-6 py-3 rounded-2xl text-center border border-yellow-200">
//                                 <span className="block text-2xl font-bold text-yellow-700">{profileData.coins}</span>
//                                 <span className="text-xs text-yellow-600 uppercase tracking-widest">EcoCoins</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Badges Section */}
//                 <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
//                     <Award className="text-yellow-500" /> My Badges
//                 </h2>
                
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                     {profileData.badges.map((badge) => (
//                         <div key={badge.id} className="bg-white p-6 rounded-3xl shadow hover:shadow-xl transition transform hover:-translate-y-2 flex flex-col items-center text-center group">
//                             <div className={`${badge.color} p-4 rounded-full mb-4 shadow-lg group-hover:scale-110 transition`}>
//                                 {badge.icon}
//                             </div>
//                             <h3 className="font-bold text-gray-800">{badge.name}</h3>
//                             <p className="text-xs text-gray-400 mt-1">Unlocked {badge.date}</p>
//                         </div>
//                     ))}
                    
//                     {/* Locked Badge Placeholder */}
//                     <div className="bg-gray-100 p-6 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center opacity-60">
//                         <div className="bg-gray-300 p-4 rounded-full mb-4">
//                             <Award className="w-8 h-8 text-gray-500" />
//                         </div>
//                         <h3 className="font-bold text-gray-500">Locked</h3>
//                         <p className="text-xs text-gray-400 mt-1">Complete Level 5</p>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default Profile;


import React from 'react';
import Header from '../components/common/Header';
import { Award, Droplets, Recycle, Leaf } from 'lucide-react'; 
import { useGame } from '../context/GameContext';

const Profile = () => {
    const { user } = useGame();

    if (!user) return <div className="text-center mt-20">Please Login</div>;

    // --- BADGE CONFIGURATION ---
    const dynamicBadges = [];

    // Badge 1: Waste Hero (Coins > 100)
    if (user.coins >= 100) {
        dynamicBadges.push({ 
            id: 1, 
            name: "Waste Hero", 
            image: "/badges/waste-hero.png", 
            fallbackIcon: <Recycle className="w-8 h-8 text-white"/>,
            color: "bg-green-500", 
            date: "Just now" 
        });
    }

    // Badge 2: Water Saver (Unlocked after completing 2 levels)
    // Logic: Count how many levels have status 'completed'
    const completedLevelsCount = user.progress 
        ? user.progress.filter(p => p.status === 'completed' || p.status === 'COMPLETED').length 
        : 0;

    if (completedLevelsCount >= 2) {
        dynamicBadges.push({ 
            id: 2, 
            name: "Water Saver", 
            image: "/badges/water-saver.png", 
            fallbackIcon: <Droplets className="w-8 h-8 text-white"/>,
            color: "bg-blue-500", 
            date: "Recently" 
        });
    }

    // Default Badge: Newbie (Always visible)
    // You mentioned "getting badge only after completing 2 levels EXCEPT newbie", 
    // so Newbie stays as the default starter badge.
    dynamicBadges.push({ 
        id: 0, 
        name: "Newbie", 
        image: "/badges/newbie.png", 
        fallbackIcon: <Leaf className="w-8 h-8 text-white"/>,
        color: "bg-gray-400", 
        date: "Today" 
    });

    // Sort badges so Newbie is first, then others
    dynamicBadges.sort((a, b) => a.id - b.id);

    const maxLevel = user.progress ? Math.max(1, ...user.progress.map(p => p.level_id)) : 1;

    const profileData = {
        name: user.username,
        rank: user.coins > 500 ? "Eco Warrior" : "Eco Scout",
        level: maxLevel,
        coins: user.coins,
        badges: dynamicBadges
    };

    return (
        <div className="min-h-screen bg-green-50 pb-20">
            <Header />

            <main className="max-w-4xl mx-auto px-4">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 bg-green-100 rounded-full border-4 border-green-500 flex items-center justify-center text-6xl shadow-inner overflow-hidden relative">
                        {user.profile_image ? (
                            <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>👩‍🎓</span>
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-gray-800">{profileData.name}</h1>
                        <p className="text-xl text-green-600 font-bold mb-4">{profileData.rank}</p>
                        
                        <div className="flex justify-center md:justify-start gap-4">
                            <div className="bg-gray-100 px-6 py-3 rounded-2xl text-center">
                                <span className="block text-2xl font-bold text-gray-800">{profileData.level}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-widest">Level</span>
                            </div>
                            <div className="bg-yellow-50 px-6 py-3 rounded-2xl text-center border border-yellow-200">
                                <span className="block text-2xl font-bold text-yellow-700">{profileData.coins}</span>
                                <span className="text-xs text-yellow-600 uppercase tracking-widest">EcoCoins</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges Section */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Award className="text-yellow-500" /> My Badges
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {profileData.badges.map((badge) => (
                        <div key={badge.id} className="bg-white p-6 rounded-3xl shadow hover:shadow-xl transition transform hover:-translate-y-2 flex flex-col items-center text-center group">
                            
                            {/* UPDATED BADGE IMAGE CONTAINER */}
                            <div className={`rounded-full mb-4 shadow-lg group-hover:scale-110 transition flex items-center justify-center w-24 h-24 overflow-hidden relative border-4 border-white ${badge.color}`}>
                                {/* Image fills circle completely */}
                                <img 
                                    src={badge.image} 
                                    alt={badge.name}
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                        // If image fails, hide it so the background color + fallback icon shows
                                        e.target.style.display = 'none';
                                    }}
                                />
                                {/* Fallback icon sits behind image */}
                                <div className="absolute inset-0 flex items-center justify-center -z-10">
                                    {badge.fallbackIcon}
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-800">{badge.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">Unlocked {badge.date}</p>
                        </div>
                    ))}
                    
                    {/* Locked Badge Placeholder */}
                    <div className="bg-gray-100 p-6 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center opacity-60">
                        <div className="bg-gray-300 p-4 rounded-full mb-4 w-24 h-24 flex items-center justify-center">
                            <Award className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="font-bold text-gray-500">Locked</h3>
                        <p className="text-xs text-gray-400 mt-1">Complete Level 5</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;