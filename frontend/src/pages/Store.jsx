import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, TreePine, Shirt, Droplet, Zap, Award, Loader, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

const Store = () => {
    const { getStoreItems, buyItem, user } = useGame();
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [activeTab, setActiveTab] = useState('All Items');
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null);
    const [notification, setNotification] = useState(null);
    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (id) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    useEffect(() => {
        const fetchItems = async () => {
            const data = await getStoreItems();
            setItems(data || []);
            setFilteredItems(data || []);
            setLoading(false);
        };
        fetchItems();
    }, []);

    useEffect(() => {
        if (activeTab === 'All Items') {
            setFilteredItems(items);
        } else {
            setFilteredItems(items.filter(item => item.category === activeTab));
        }
    }, [activeTab, items]);

    const handlePurchase = async (item) => {
        if (user.coins < item.price) {
            showNotification("Insufficient EcoCoins!", "error");
            return;
        }

        setPurchasing(item.id);
        const res = await buyItem(item.id);
        setPurchasing(null);

        if (res.success) {
            showNotification(res.message, "success");
        } else {
            showNotification(res.message, "error");
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'tree': return <TreePine className="w-12 h-12 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]" />;
            case 'hoodie': return <Shirt className="w-12 h-12 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]" />;
            case 'bottle': return <Droplet className="w-12 h-12 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />;
            case 'badge': return <Award className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />;
            case 'water': return <Droplet className="w-12 h-12 text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]" />;
            case 'zap': return <Zap className="w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />;
            default: return <Star className="w-12 h-12 text-gray-400" />;
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader className="w-10 h-10 text-green-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafafb] pb-20">
            <Header />

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className={`fixed bottom-10 right-10 z-50 px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 font-bold border-2 ${notification.type === 'success' ? 'bg-green-600 text-white border-green-400' : 'bg-red-600 text-white border-red-400'
                            }`}
                    >
                        {notification.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        <span className="text-lg">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="max-w-6xl mx-auto px-4 mt-8">
                {/* Back to Dashboard Link */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6"
                >
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-2xl text-gray-600 font-black shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span>Back to Dashboard</span>
                    </Link>
                </motion.div>

                {/* Store Hero */}
                <div className="bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 rounded-[3rem] p-16 mb-12 relative overflow-hidden text-center shadow-2xl shadow-emerald-900/20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] -mr-48 -mt-48 backdrop-blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] -ml-40 -mb-40 backdrop-blur-3xl"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-emerald-400/15 p-5 rounded-[2rem] mb-6 backdrop-blur-xl border border-emerald-400/20"
                        >
                            <ShoppingBag className="w-12 h-12 text-emerald-400" />
                        </motion.div>
                        <h1 className="text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">EcoLoop <span className="text-emerald-400">Store</span></h1>
                        <p className="text-emerald-100/60 text-xl font-medium max-w-lg mx-auto leading-relaxed">
                            Redeem your EcoCoins for real-world impact and exclusive premium goodies!
                        </p>
                    </div>
                </div>

                {/* Sub-Header / Filters (LeetCode Style) */}
                <div className="flex flex-wrap gap-2 mb-12 justify-center bg-white/50 backdrop-blur-sm p-2 rounded-[2.5rem] border border-gray-200/50 max-w-fit mx-auto shadow-sm">
                    {['All Items', 'Symbolic', 'Premium', 'Virtual'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === tab
                                ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/20 scale-105'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode='popLayout'>
                        {filteredItems.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -12 }}
                                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] transition-all duration-500 p-8 flex flex-col group overflow-hidden relative"
                            >
                                {/* Category Badge */}
                                <div className="absolute top-6 right-8">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${item.category === 'Symbolic' ? 'bg-emerald-50 text-emerald-600' :
                                        item.category === 'Premium' ? 'bg-orange-50 text-orange-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                        {item.category}
                                    </span>
                                </div>

                                <div className="bg-[#f8f9fa] rounded-[2rem] p-4 mb-8 flex items-center justify-center transition-all duration-500 group-hover:bg-emerald-50 relative overflow-hidden h-64">
                                    <div className="absolute inset-0 bg-emerald-400/0 group-hover:bg-emerald-400/5 transition-colors duration-500"></div>

                                    {/* Background Glow */}
                                    <div className={`absolute w-32 h-32 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${item.category === 'Symbolic' ? 'bg-emerald-400' :
                                        item.category === 'Premium' ? 'bg-orange-400' :
                                            'bg-blue-400'
                                        }`}></div>

                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 2 }}
                                        className="relative z-10 w-full h-full flex items-center justify-center"
                                    >
                                        {item.image_url && !imageErrors[item.id] ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-contain p-4 drop-shadow-2xl"
                                                onError={() => handleImageError(item.id)}
                                            />
                                        ) : (
                                            getIcon(item.icon_type)
                                        )}
                                    </motion.div>
                                </div>

                                <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight group-hover:text-emerald-700 transition-colors">{item.name}</h3>
                                <p className="text-gray-400 font-medium mb-10 leading-relaxed h-16 line-clamp-2 text-lg">
                                    {item.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between gap-5 pt-8 border-t border-gray-50">
                                    <div className="flex items-center gap-2.5 bg-yellow-50 px-5 py-2.5 rounded-2xl border border-yellow-100 group-hover:bg-yellow-100 transition-colors">
                                        <Star className="w-5 h-5 text-yellow-600 fill-yellow-400" />
                                        <span className="text-xl font-black text-yellow-800 tracking-tighter">{item.price}</span>
                                    </div>
                                    <button
                                        onClick={() => handlePurchase(item)}
                                        disabled={purchasing === item.id}
                                        className={`flex-1 py-4 rounded-2xl font-extrabold text-sm transition-all duration-300 shadow-lg active:scale-95 uppercase tracking-wider ${purchasing === item.id
                                            ? 'bg-gray-100 text-gray-400 cursor-wait'
                                            : 'bg-gray-900 text-white hover:bg-emerald-600 hover:shadow-emerald-200'
                                            }`}
                                    >
                                        {purchasing === item.id ? 'Loading...' : 'Redeem Now'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Bottom Section */}
                <div className="mt-20 text-center pb-10">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">Redeem With Code</p>
                    <div className="flex max-w-md mx-auto items-center bg-white rounded-2xl p-2 shadow-inner border border-gray-200">
                        <input
                            type="text"
                            placeholder="Enter Gift Code"
                            className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-gray-700"
                        />
                        <button className="bg-yellow-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-yellow-600 transition">
                            Redeem
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Store;