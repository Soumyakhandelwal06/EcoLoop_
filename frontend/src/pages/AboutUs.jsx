import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Leaf, Cloud, Sun, Wind, Droplets, Globe } from 'lucide-react';
import Header from '../components/common/Header';

const FloatingElement = ({ children, delay = 0, xRange = [0, 0], yRange = [0, 0], duration = 5 }) => (
    <motion.div
        animate={{
            y: yRange,
            x: xRange,
            rotate: [0, 5, -5, 0],
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: delay,
        }}
        className="absolute text-slate-300/30"
    >
        {children}
    </motion.div>
);

const AboutUs = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        mouseX.set((clientX - centerX) / 50);
        mouseY.set((clientY - centerY) / 50);
    };

    const backgroundX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const backgroundY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    return (
        <div
            className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            <Header />

            {/* Interactive Background Layer */}
            <motion.div
                style={{ x: backgroundX, y: backgroundY }}
                className="absolute inset-0 z-0 pointer-events-none"
            >
                <FloatingElement delay={0} yRange={[-20, 20]} xRange={[-10, 10]} duration={6}>
                    <Cloud className="w-32 h-32 top-20 left-10 opacity-20" />
                </FloatingElement>
                <FloatingElement delay={2} yRange={[20, -20]} xRange={[10, -10]} duration={8}>
                    <Cloud className="w-48 h-48 top-40 right-20 opacity-20" />
                </FloatingElement>
                <FloatingElement delay={1} yRange={[-15, 15]} duration={7}>
                    <Leaf className="w-16 h-16 bottom-1/4 left-1/4 opacity-10 rotate-12" />
                </FloatingElement>
                <FloatingElement delay={3} yRange={[15, -15]} duration={9}>
                    <Wind className="w-24 h-24 top-1/3 right-1/3 opacity-10" />
                </FloatingElement>
                <FloatingElement delay={0.5} yRange={[-10, 10]} duration={10}>
                    <Sun className="w-40 h-40 -top-10 -right-10 text-yellow-500/10" />
                </FloatingElement>
                <FloatingElement delay={4} yRange={[20, -20]} duration={12}>
                    <Globe className="w-64 h-64 -bottom-32 -left-20 text-green-500/5 rotate-12" />
                </FloatingElement>
            </motion.div>

            <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 mb-6 sm:mb-8 text-center tracking-tight">
                        About EcoLoop <span className="inline-block animate-bounce">🌿</span>
                    </h1>

                    <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] shadow-xl border border-white/50 space-y-6 sm:space-y-8 text-base sm:text-lg text-slate-700 leading-relaxed relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>

                        <section>
                            <h2 className="text-2xl font-black text-green-700 mb-3 flex items-center gap-2">
                                <Leaf className="w-6 h-6" /> Our Mission
                            </h2>
                            <p>
                                EcoLoop is dedicated to gamifying sustainability education. We believe that learning about the environment should be fun, interactive, and rewarding. By turning eco-actions into a game, we empower the next generation to build a greener future.
                            </p>
                        </section>

                        <div className="w-full h-px bg-slate-100"></div>

                        <section>
                            <h2 className="text-2xl font-black text-green-700 mb-3 flex items-center gap-2">
                                <Droplets className="w-6 h-6" /> Why Sustainability + Students?
                            </h2>
                            <p>
                                Students are the architects of tomorrow. Instilling sustainable habits early on creates a ripple effect that lasts a lifetime. EcoLoop bridges the gap between theoretical knowledge and practical action.
                            </p>
                        </section>

                        <div className="w-full h-px bg-slate-100"></div>

                        <section>
                            <h2 className="text-2xl font-black text-green-700 mb-3 flex items-center gap-2">
                                <Globe className="w-6 h-6" /> How the Community Feed Works
                            </h2>
                            <p>
                                The Community Feed connects students with real-world initiatives. It serves as a window into the broader ecosystem of environmental action, inspiring students to see beyond their own tasks.
                            </p>
                        </section>

                        <div className="bg-yellow-50/50 border-l-4 border-yellow-400 p-6 rounded-r-3xl text-base mt-4">
                            <p className="font-bold text-yellow-800 mb-1 flex items-center gap-2">
                                ⚠️ Note on Content Safety
                            </p>
                            <p className="text-yellow-700">
                                All initiatives displayed in the Community Feed are manually curated and verified to ensure relevance, safety, and educational value for students.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>

        </div>
    );
};

export default AboutUs;
