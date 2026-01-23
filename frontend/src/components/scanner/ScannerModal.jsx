import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, Loader2, Sparkles, CheckCircle, Info, Coins, ArrowRight } from 'lucide-react';
import { gameAPI } from '../../services/api';
import { useGame } from '../../context/GameContext';

const ScannerModal = ({ isOpen, onClose }) => {
    const { fetchUser } = useGame();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleScan = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);
        try {
            const data = await gameAPI.scanEcoObject(selectedFile);
            setResult(data);
            fetchUser(); // Refresh coins
        } catch (err) {
            setError(err.message || "Failed to analyze object. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    onClick={onClose}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[40px] shadow-2xl max-w-xl w-full overflow-hidden relative border border-white/20 max-h-[90vh] flex flex-col"
                    >
                    {/* Header Decoration */}
                    <div className="h-20 sm:h-24 bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-between px-6 sm:px-8 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <Sparkles className="w-full h-full scale-150 rotate-12" />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-white/20 p-2 rounded-xl sm:rounded-2xl backdrop-blur-md">
                                <Camera className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <h2 className="text-white text-xl sm:text-2xl font-black tracking-tight">AI Eco-Scanner</h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition text-white relative z-10"
                        >
                            <X size={20} className="sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    <div className="p-6 sm:p-8 pb-10 sm:pb-12 overflow-y-auto custom-scrollbar">
                        {!result ? (
                            <div className="space-y-6">
                                <p className="text-gray-500 font-medium text-center italic">
                                    "Is this recyclable? How do I dispose of this? Let our AI tell you!"
                                </p>

                                {/* Upload Area */}
                                <div 
                                    onClick={() => !loading && fileInputRef.current?.click()}
                                    className={`relative aspect-video rounded-[32px] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden
                                        ${previewUrl ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-green-50/30'}
                                        ${loading ? 'pointer-events-none opacity-60' : ''}
                                    `}
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                                <span className="bg-white text-gray-800 px-4 py-2 rounded-xl font-bold text-sm shadow-xl">Change Photo</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="bg-white p-4 rounded-3xl shadow-sm mx-auto mb-4 w-fit">
                                                <Upload className="w-8 h-8 text-green-600" />
                                            </div>
                                            <span className="block text-lg font-black text-gray-800">Choose a Clear Photo</span>
                                            <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">Click to browse</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        hidden 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                </div>

                                {error ? (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3"
                                    >
                                        <div className="bg-red-100 p-1 rounded-full"><X size={14} /></div>
                                        {error}
                                    </motion.div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-xl shadow-sm"><Info size={16} className="text-blue-500" /></div>
                                            <span className="text-xs font-bold text-blue-700 leading-tight">Identify any item's eco-impact</span>
                                        </div>
                                        <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-xl shadow-sm"><Coins size={16} className="text-yellow-600" /></div>
                                            <span className="text-xs font-bold text-yellow-700 leading-tight">Earn up to 25 EcoCoins per scan</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleScan}
                                    disabled={!selectedFile || loading}
                                    className="w-full bg-green-600 text-white py-5 rounded-[24px] font-black text-xl flex items-center justify-center gap-3 hover:bg-green-700 shadow-xl shadow-green-100 disabled:bg-gray-200 disabled:shadow-none transition-all active:scale-95 group"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            Analyzing with AI...
                                        </>
                                    ) : (
                                        <>
                                            Identify Object <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="inline-block bg-green-100 p-3 rounded-full mb-4">
                                        <CheckCircle className="text-green-600 w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-800 tracking-tight mb-1">{result.object_name}</h3>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1">
                                            <Sparkles size={12} /> Reward: +{result.points} Coins
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
                                        <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div> Recycling Protocol
                                        </label>
                                        <p className="text-gray-800 font-bold leading-relaxed">{result.recycling_protocol}</p>
                                    </div>

                                    <div className="bg-purple-50 p-6 rounded-[32px] border border-purple-100">
                                        <label className="block text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div> Amazing Eco Fact
                                        </label>
                                        <p className="text-gray-800 font-bold leading-relaxed italic">"{result.eco_fact}"</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={resetScanner}
                                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                                    >
                                        Scan Another Item
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
                                    >
                                        Finish & Return to Dashboard
                                    </button>
                                </div>
                                </motion.div>
                            )
                        }
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
};

export default ScannerModal;
