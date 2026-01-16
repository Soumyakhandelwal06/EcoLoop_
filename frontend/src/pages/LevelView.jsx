import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Header from '../components/common/Header';
import VideoPlayer from '../components/level/VideoPlayer';
import QuizInterface from '../components/level/QuizInterface';
import TaskUpload from '../components/level/TaskUpload';
import QuizModal from '../components/level/QuizModal';

const LEVEL_DURATIONS = {
    1: 354, // 5m 54s
    2: 132, // 2m 12s
    3: 356, // 5m 56s
    4: 143, // 2m 23s
    5: 371  // 6m 11s
};

const LevelView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { levels, updateProgress } = useGame();
    const [levelData, setLevelData] = useState(null);
    const [step, setStep] = useState('video'); // video, info, quiz, task, completed

    // Segment Logic
    const [currentSegment, setCurrentSegment] = useState(0); // 0-4
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [isRestartingSegment, setIsRestartingSegment] = useState(false);

    useEffect(() => {
        if (levels.length > 0) {
            const found = levels.find(l => l.id === parseInt(id));
            if (found) {
                setLevelData(found);
            }
        }
    }, [levels, id]);

    // Cleanup restart trigger
    useEffect(() => {
        if (isRestartingSegment) {
            const timer = setTimeout(() => setIsRestartingSegment(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isRestartingSegment]);

    const handleSegmentComplete = () => {
        console.log("Segment Ended. Showing Quiz.");
        setShowQuizModal(true);
    };

    const handleVideoComplete = async () => {
        // Award 10 Coins for watching ENTIRE video
        const success = await updateProgress(levelData.id, 10, 0, false);
        if (success) {
            console.log("Video Reward: +10 Coins");
        }
        setStep('info');
    };

    const handleQuizCorrect = () => {
        setShowQuizModal(false);
        if (currentSegment < 4) {
            setCurrentSegment(prev => prev + 1);
        }
    };

    const handleQuizIncorrect = () => {
        setShowQuizModal(false);
        setIsRestartingSegment(true); // Triggers VideoPlayer to seek back
        alert("Incorrect answer! You must re-watch this segment to understand the concept.");
    };

    const handleInfoRead = () => setStep('quiz');

    const handleCorrectAnswer = async () => {
        // Standard quiz after video (optional now? Keeping for legacy flow or extra points)
        await updateProgress(levelData.id, 5, 0, false);
    };

    const handleQuizPass = () => setStep('task');
    const handleTaskVerified = async () => {
        if (levelData) {
            const success = await updateProgress(levelData.id, 20, levelData.xp_reward, true);
            if (success) {
                alert(`Level Completed! +${levelData.xp_reward} XP & +20 EcoCoins 🪙`);
                navigate('/dashboard');
            } else {
                alert("Failed to save progress. Please retry.");
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

    const videoDuration = LEVEL_DURATIONS[levelData.id] || 300;
    const segmentDuration = videoDuration / 5;

    // Find question for current segment
    // Assuming levelData.questions has 'segment_index' field.
    // Fallback logic if segment_index missing: use array index.
    const currentQuizQuestion = levelData.questions?.find(q => q.segment_index === currentSegment)
        || levelData.questions?.[currentSegment];

    // Fallback if no question found (prevent crash)
    const safeQuestion = currentQuizQuestion || {
        text: "Keep watching closely!",
        options: "OK|Got it|Understood|Cool",
        correct_index: 0
    };

    return (
        <div className="min-h-screen bg-green-50 pb-20">
            <Header />

            {showQuizModal && (
                <QuizModal
                    question={safeQuestion}
                    onCorrect={handleQuizCorrect}
                    onIncorrect={handleQuizIncorrect}
                />
            )}

            <main className="max-w-4xl mx-auto px-4">
                <div className="mb-8 text-center pt-8">
                    <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-sm">
                        Level {id}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-800 mt-4">{levelData.title}</h1>
                    <p className="text-gray-600 mt-2">{levelData.description}</p>

                    {/* Steps UI */}
                    <div className="flex justify-center mt-6 gap-2">
                        <span
                            onClick={() => setStep('video')}
                            className={`px-4 py-2 rounded-lg font-bold cursor-pointer transition-colors hover:bg-green-200 ${step === 'video' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                        >
                            Video Interaction
                        </span>
                        <span className="text-gray-400 self-center">➔</span>
                        <span
                            onClick={() => setStep('info')}
                            className={`px-4 py-2 rounded-lg font-bold cursor-pointer transition-colors hover:bg-green-200 ${step === 'info' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                        >
                            Info
                        </span>
                        <span className="text-gray-400 self-center">➔</span>
                        <span
                            onClick={() => setStep('quiz')}
                            className={`px-4 py-2 rounded-lg font-bold cursor-pointer transition-colors hover:bg-green-200 ${step === 'quiz' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                        >
                            Practice Quiz
                        </span>
                        <span className="text-gray-400 self-center">➔</span>
                        <span className={`px-4 py-2 rounded-lg font-bold ${step === 'task' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>Eco Task</span>
                    </div>
                </div>

                <div className="mt-8 transition-all duration-500 ease-in-out">
                    {step === 'video' && (
                        <VideoPlayer
                            onSegmentComplete={handleSegmentComplete}
                            onVideoComplete={handleVideoComplete}
                            levelData={levelData}
                            currentSegmentIndex={currentSegment}
                            segmentDuration={segmentDuration}
                            isRestarting={isRestartingSegment}
                        />
                    )}

                    {step === 'info' && (
                        <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-green-100/50 text-left">
                            <h2 className="text-2xl font-black text-green-900 mb-6 text-center">📚 Knowledge Hub</h2>
                            <div className="text-lg text-gray-700 mb-8 whitespace-pre-line leading-relaxed border-l-4 border-green-500 pl-4 bg-green-50/50 p-4 rounded-r-xl">
                                {levelData.info_content}
                            </div>
                            <div className="text-center">
                                <button
                                    onClick={() => setStep('quiz')}
                                    className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg transition-transform hover:scale-105"
                                >
                                    Take Practice Quiz 📝
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'quiz' && <QuizInterface onPass={handleQuizPass} onCorrectAnswer={handleCorrectAnswer} questions={levelData.questions} />}
                    {step === 'task' && <TaskUpload onSuccess={handleTaskVerified} taskDescription={levelData.task_description} taskType="Level Challenge" levelId={levelData.id} />}
                </div>
            </main>
        </div>
    );
};

export default LevelView;
