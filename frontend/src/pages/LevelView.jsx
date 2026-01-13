import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Header from '../components/common/Header';
import VideoPlayer from '../components/level/VideoPlayer';
import QuizInterface from '../components/level/QuizInterface';
import TaskUpload from '../components/level/TaskUpload';

const LevelView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { levels, updateProgress } = useGame();
    const [levelData, setLevelData] = useState(null);
    const [step, setStep] = useState('video'); // video, quiz, task, completed

    useEffect(() => {
        if (levels.length > 0) {
            // Find level data matching ID (ensure type safety)
            const found = levels.find(l => l.id === parseInt(id));
            if (found) {
                setLevelData(found);
            }
        }
    }, [levels, id]);

    const handleVideoComplete = () => setStep('quiz');
    const handleQuizPass = () => setStep('task');
    const handleTaskVerified = async () => {
        if (levelData) {
            const success = await updateProgress(levelData.id, levelData.xp_reward, levelData.xp_reward);
            if (success) {
                alert(`Level Completed! +${levelData.xp_reward} EcoCoins 🪙`);
                navigate('/dashboard');
            } else {
                 alert("Failed to save progress. Please try again.");
            }
        }
    };

    if (!levelData) {
        return (
            <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <p className="text-xl font-bold text-green-800 animate-pulse">Loading Level Data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-green-50 pb-20">
            <Header />
            
            <main className="max-w-4xl mx-auto px-4">
                <div className="mb-8 text-center pt-8">
                    <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-sm">
                        Level {id}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-800 mt-4">{levelData.title}</h1>
                    <p className="text-gray-600 mt-2">{levelData.description}</p>
                    
                    {/* Progress Steps */}
                    <div className="flex justify-center mt-6 gap-2">
                        {['Video 🎥', 'Quiz ❓', 'Task 📸'].map((label, idx) => {
                            const steps = ['video', 'quiz', 'task'];
                            const isActive = step === steps[idx];
                            const isDone = steps.indexOf(step) > idx;
                            
                            // Allow clicking if it's the current step or a step already completed
                            // Actually, let's allow clicking ANY step that the user has reached
                            const currentIdx = steps.indexOf(step);
                            const isReachable = idx <= currentIdx;

                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => isReachable && setStep(steps[idx])}
                                    disabled={!isReachable}
                                    className={`px-4 py-2 rounded-lg font-bold transition-all
                                        ${isActive ? 'bg-green-600 text-white scale-110 shadow' : ''}
                                        ${isDone ? 'bg-green-200 text-green-800' : ''}
                                        ${!isActive && !isDone ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                                    `}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 transition-all duration-500 ease-in-out">
                    {step === 'video' && <VideoPlayer onComplete={handleVideoComplete} levelData={levelData} />}
                    {step === 'quiz' && <QuizInterface onPass={handleQuizPass} questions={levelData.questions} />}
                    {step === 'task' && <TaskUpload onVerify={handleTaskVerified} taskDescription={levelData.task_description} />}
                </div>
            </main>
        </div>
    );
};

export default LevelView;
