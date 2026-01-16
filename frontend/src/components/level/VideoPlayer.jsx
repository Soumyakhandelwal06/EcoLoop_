import React, { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle, RotateCcw } from 'lucide-react';

const VideoPlayer = ({ onSegmentComplete, onVideoComplete, levelData, currentSegmentIndex, segmentDuration, isRestarting }) => {
    // Backend now sends full URL in video_id field
    const videoUrl = levelData?.video_id || "";
    const videoRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    // Calculate the end time for the current segment
    // Segment 0: 0 to 1*duration
    // Segment 1: 1*duration to 2*duration
    // ...
    // Note: If exact duration logic is complex, we use percentage roughly on frontend or strict time.
    // Ideally, LevelView calculates segmentDuration based on precise video length. 
    // Here we assume segmentDuration is provided in seconds.
    const segmentEndTime = (currentSegmentIndex + 1) * segmentDuration;
    const segmentStartTime = currentSegmentIndex * segmentDuration;

    // Handle Restart (Incorrect Answer)
    useEffect(() => {
        if (isRestarting && videoRef.current) {
            videoRef.current.currentTime = segmentStartTime;
            videoRef.current.play();
            setIsPlaying(true);
            console.log("Restarting segment:", segmentStartTime);
        }
    }, [isRestarting, segmentStartTime]);

    // Handle Resume (Correct Answer / Next Segment)
    useEffect(() => {
        // If index increments and we are not restarting, it means we passed the quiz.
        // We should just ensure it plays.
        // We add a check for >0 to avoid auto-playing on initial load (unless we want that).
        // Also check if video is paused to avoid interfering with manual interactions.
        if (currentSegmentIndex > 0 && !isRestarting && videoRef.current && videoRef.current.paused) {
            console.log("Resuming for next segment:", currentSegmentIndex);
            videoRef.current.play().catch(e => console.error("Play failed:", e));
            setIsPlaying(true);
        }
    }, [currentSegmentIndex, isRestarting]);

    // Update progress based on actual video time
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;

            // 1. Check for Segment End
            if (current >= segmentEndTime && currentSegmentIndex < 4) {
                videoRef.current.pause();
                setIsPlaying(false);
                onSegmentComplete(); // Trigger Quiz
                return;
            }

            // 2. Prohibit Skipping (Seeking forward past current segment) or past previously watched?
            // "No Skipping" usually means you can't jump ahead of what you've seen.
            // But here, we strictly enforce "Can't jump past current segment end".
            // Since we pause at segment end, this is implicit for the boundary.
            // But user might manually seek. 
            // Implementation: If user seeks past segmentEndTime, snap back.
            if (current > segmentEndTime + 0.5) { // 0.5s buffer
                videoRef.current.currentTime = segmentEndTime - 0.1;
            }

            if (duration > 0) {
                const percent = (current / duration) * 100;
                setProgress(Math.min(percent, 100));
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(100);
        // Only trigger completion if we are at the very end (Segment 4 finished)
        if (currentSegmentIndex === 4) {
            onVideoComplete();
        }
    };

    const handlePlayClick = () => {
        setIsPlaying(true);
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

    // Prevent manual seeking via native controls if desired
    // (Native controls make it hard to block seeking perfectly, hiding them and building custom is better,
    // but for now we enforce logic in handleTimeUpdate).

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full mx-auto relative group">
            {/* Video Container (Aspect Ratio 16:9) */}
            <div className="relative pb-[56.25%] h-0 bg-black">

                <video
                    ref={videoRef}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    src={videoUrl}
                    controls={false}
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    onClick={(e) => {
                        if (videoRef.current.paused) {
                            videoRef.current.play();
                            setIsPlaying(true);
                        } else {
                            videoRef.current.pause();
                            setIsPlaying(false);
                        }
                    }}
                >
                    Your browser does not support the video tag.
                </video>

                {!isPlaying && (
                    <div className="absolute inset-0 bg-gray-900/40 cursor-pointer group z-10 flex flex-col justify-between" onClick={handlePlayClick}>
                        {/* Gradient & Overlay Logic */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 to-black/80 group-hover:opacity-90 transition duration-500" />

                        <div className="relative z-20 flex-1 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md p-6 rounded-full group-hover:scale-110 transition shadow-2xl border-2 border-white/50">
                                <Play className="w-16 h-16 text-white ml-2 fill-current" />
                            </div>
                        </div>

                        {/* Title Info - Only show if at start or paused? Keeping it simple */}
                        <div className="relative z-20 p-6 text-white text-left">
                            <div className="bg-green-600/90 px-3 py-1 rounded text-sm font-bold inline-block mb-2">EDUCATIONAL VIDEO</div>
                            <h3 className="text-3xl font-bold text-shadow-lg">{levelData?.title || "Eco Lesson"}</h3>
                            <p className="font-semibold opacity-90">
                                Segment {currentSegmentIndex + 1} / 5 • Watch to unlock quiz!
                            </p>
                        </div>
                    </div>
                )}

                {/* Custom Overlay Controls since we hid native */}
                {isPlaying && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 bg-black/50 p-2 rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => {
                            setIsPlaying(!isPlaying);
                            isPlaying ? videoRef.current.pause() : videoRef.current.play();
                        }} className="text-white hover:text-green-400">
                            {isPlaying ? "❚❚" : "▶"}
                        </button>
                        <div className="text-white text-xs font-mono">
                            Part {currentSegmentIndex + 1}/5
                        </div>
                    </div>
                )}
            </div>

            {/* Completion State */}
            {currentSegmentIndex === 4 && progress >= 99 && (
                <div className="p-6 bg-green-100 flex items-center justify-between animate-fade-in-up">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                            <h4 className="font-bold text-green-800">Lesson Completed!</h4>
                            <p className="text-sm text-green-700">You earned +50 XP for watching.</p>
                        </div>
                    </div>
                    <button
                        onClick={onVideoComplete}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition"
                    >
                        Success! Next Step →
                    </button>
                </div>
            )}

            {/* Progress Bar */}
            {progress < 99 && (
                <div className="bg-gray-800 h-2 w-full relative">
                    {/* Segment Markers */}
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="absolute top-0 bottom-0 w-0.5 bg-white z-10" style={{ left: `${i * 20}%` }} />
                    ))}

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
