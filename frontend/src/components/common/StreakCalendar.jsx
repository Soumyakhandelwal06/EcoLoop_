import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Flame } from 'lucide-react';
import moment from 'moment';

const StreakCalendar = ({ isOpen, onClose, streak }) => {
    if (!isOpen) return null;

    // Generate full current month
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    const startDay = startOfMonth.day(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = startOfMonth.daysInMonth();

    // Create array for the grid: Empty slots for start padding + actual days
    const calendarDays = [];

    // Add empty slots for days before start of month
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(moment().date(i));
    }

    // Determine which days are "checked" based on streak
    // Streak includes Today + previous (streak-1) days consecutive
    const checkedDates = [];
    for (let i = 0; i < streak; i++) {
        checkedDates.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-[#1a1a1a] text-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative z-10 font-sans"
                >
                    {/* Header Section */}
                    <div className="p-6 pb-2 flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold flex items-center gap-2">
                                {moment().format('MMMM YYYY')}
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">{streak} Day Streak 🔥</p>
                        </div>
                        <button onClick={onClose} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Flame Animation Area */}
                    <div className="flex justify-center my-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                            <Flame className="w-24 h-24 text-orange-500 fill-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="bg-[#242424] p-6 m-2 rounded-[2rem]">
                        <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                        </div>

                        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                            {calendarDays.map((day, idx) => {
                                if (!day) return <div key={idx}></div>;

                                const isToday = day.isSame(moment(), 'day');
                                const isChecked = checkedDates.includes(day.format('YYYY-MM-DD'));
                                const isFuture = day.isAfter(moment(), 'day');

                                return (
                                    <div key={idx} className="flex flex-col items-center">
                                        {isToday ? (
                                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg transform scale-110 border-2 border-[#1a1a1a]">
                                                {/* Tick mark for Today */}
                                                <CheckCircle size={20} className="text-white" strokeWidth={3} />
                                            </div>
                                        ) : isChecked ? (
                                            <div className="w-10 h-10 flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500">
                                                    <CheckCircle size={16} fill="currentColor" className="text-black" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFuture ? 'text-gray-700' : 'text-gray-500'}`}>
                                                <span className="text-sm font-medium">{day.date()}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="text-center p-4 text-gray-400 text-xs">
                        Practice daily to keep your streak alive!
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default StreakCalendar;
