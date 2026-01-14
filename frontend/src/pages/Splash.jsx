import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, ArrowRight, BookOpen, Layers, Award } from 'lucide-react';

const Splash = ({ onComplete }) => {
    // Removed auto-timer to allow users to read the content

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: { duration: 0.5 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-teal-700 text-white overflow-y-auto"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
        >
            <div className="w-full max-w-4xl px-6 py-12 md:py-20 flex flex-col items-center text-center">

                {/* Header Section */}
                <motion.div variants={itemVariants} className="mb-8">
                    <div className="bg-white/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm">
                        <Leaf className="w-12 h-12 md:w-16 md:h-16 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2 drop-shadow-md">
                        Welcome to EcoLoop
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-green-50">
                        Gamified Sustainability Education
                    </p>
                </motion.div>

                {/* Main Description */}
                <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-10 shadow-xl border border-white/20 max-w-3xl">
                    <p className="text-lg md:text-xl leading-relaxed mb-6 text-green-50">
                        EcoLoop is a gamified, web-based learning platform that helps school students understand environmental sustainability in an engaging, practical, and action-oriented way. The platform transforms sustainability education from passive reading into an interactive journey where learning and real-world action go hand in hand.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 text-left mt-8">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <BookOpen className="w-8 h-8 mb-3 text-yellow-300" />
                            <h3 className="font-bold text-lg mb-2">Interactive Learning</h3>
                            <p className="text-sm opacity-90">Instead of traditional textbooks, explore concepts through visually engaging content and game-like progression.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <Layers className="w-8 h-8 mb-3 text-blue-300" />
                            <h3 className="font-bold text-lg mb-2">Level-Based Paths</h3>
                            <p className="text-sm opacity-90">Progress through topics like waste management & water conservation with videos and quizzes.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <Award className="w-8 h-8 mb-3 text-purple-300" />
                            <h3 className="font-bold text-lg mb-2">Rewards & Progress</h3>
                            <p className="text-sm opacity-90">Stay motivated as you move forward, seeing your progress reflected through levels and achievements.</p>
                        </div>
                    </div>

                    <p className="mt-8 text-base md:text-lg opacity-90 italic">
                        "By combining structured learning with engagement and progression, EcoLoop makes sustainability education simple, enjoyable, and meaningful."
                    </p>
                </motion.div>

                {/* CTA Button */}
                <motion.button
                    variants={itemVariants}
                    onClick={onComplete}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-10 group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-teal-800 bg-white rounded-full shadow-lg overflow-hidden hover:bg-green-50 transition-colors focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                >
                    <span className="mr-2">Start Your Journey</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

            </div>
        </motion.div>
    );
};

export default Splash;
