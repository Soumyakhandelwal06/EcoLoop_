import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle } from 'lucide-react';

const VideoPlayer = ({ onComplete, levelData }) => {
    // Backend now sends full URL in video_id field
    const videoUrl = levelData?.video_id || "";
    const videoRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    // Update progress based on actual video time
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            if (duration > 0) {
                const percent = (current / duration) * 100;
                setProgress(Math.min(percent, 100));
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(100);
        // completion handled by button click for now, but we track it
    };

    const handlePlayClick = () => {
        setIsPlaying(true);
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full mx-auto relative group">
            {/* Video Container (Aspect Ratio 16:9) */}
            <div className="relative pb-[56.25%] h-0 bg-black">

                {!isPlaying ? (
                    <div className="absolute inset-0 bg-gray-900 cursor-pointer group" onClick={handlePlayClick}>
                        {/* Placeholder gradient instead of YouTube thumb */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-black opacity-80 group-hover:opacity-60 transition" />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md p-6 rounded-full group-hover:scale-110 transition shadow-2xl border-2 border-white/50">
                                <Play className="w-16 h-16 text-white ml-2 fill-current" />
                            </div>
                        </div>
                        <div className="absolute bottom-6 left-6 text-white text-left z-10">
                            <div className="bg-green-600/90 px-3 py-1 rounded text-sm font-bold inline-block mb-2">EDUCATIONAL VIDEO</div>
                            <h3 className="text-3xl font-bold text-shadow-lg">{levelData?.title || "Eco Lesson"}</h3>
                            <p className="font-semibold opacity-90">Watch to unlock the quiz!</p>
                        </div>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        className="absolute top-0 left-0 w-full h-full"
                        src={videoUrl}
                        controls
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>

            {/* Completion State */}
            {progress >= 99 && (
                <div className="p-6 bg-green-100 flex items-center justify-between animate-fade-in-up">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                            <h4 className="font-bold text-green-800">Lesson Completed!</h4>
                            <p className="text-sm text-green-700">You earned +50 XP for watching.</p>
                        </div>
                    </div>
                    <button
                        onClick={onComplete}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition"
                    >
                        Go to Info →
                    </button>
                </div>
            )}

            {/* Progress Bar (Only show if playing and not done) */}
            {isPlaying && progress < 99 && (
                <div className="bg-green-800 h-2 w-full">
                    <div
                        className="bg-green-400 h-full transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
