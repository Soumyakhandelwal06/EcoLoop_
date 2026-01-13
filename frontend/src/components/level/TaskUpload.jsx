import React, { useState } from 'react';
import { Camera, Upload, Check, Loader, XCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';

const TaskUpload = ({ onVerify, taskDescription }) => {
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null); // 'image' or 'video'
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [result, setResult] = useState(null);
    const { verifyTask, user, loading } = useGame();

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full mx-auto text-center flex flex-col items-center">
                <Loader className="w-10 h-10 text-green-600 animate-spin mb-4" />
                <p className="text-gray-500">Checking account...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full mx-auto text-center border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Login to Complete Task</h3>
                <p className="text-gray-500">You need to be logged in to upload proofs and earn rewards.</p>
            </div>
        );
    }

    const handleUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(URL.createObjectURL(selectedFile));
            setFileType(selectedFile.type.startsWith('video') ? 'video' : 'image');
            setVerifying(true);
            setResult(null); // Clear previous result
            
            // Call Gemini API via Backend
            const res = await verifyTask(selectedFile, taskDescription || "sustainable content (waste bins, nature, eco-friendly)");
            
            setVerifying(false);
            setResult(res);
            
            if (res.is_valid) {
                setVerified(true);
            }
        }
        // IMPORTANT: Reset input value so the same file can be selected again if it failed
        e.target.value = '';
    };

    if (verified) {
        return (
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full mx-auto text-center animate-fade-in-up">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-green-800 mb-2">Verified by AI! 🤖</h2>
                <p className="text-gray-600 mb-2">{result?.message || "Great job!"}</p>
                <p className="text-sm text-gray-400 mb-6">Confidence: {(result?.confidence * 100).toFixed(0)}%</p>
                
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-8 inline-block animate-bounce">
                    <span className="text-2xl font-bold text-yellow-800">Earned 100 EcoCoins! 🪙</span>
                </div>

                <br/>
                <button 
                  onClick={onVerify}
                  className="bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-green-700 transition"
                >
                  Collect Rewards & Finish
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full mx-auto">
            <h2 className="text-2xl font-bold text-green-800 mb-2 flex items-center gap-2">
                <Camera className="w-8 h-8"/> Daily Task
            </h2>
            <p className="text-gray-600 mb-8 font-medium text-lg bg-green-50 p-4 rounded-xl border border-green-200">
                {taskDescription || "Upload a photo or a short video proving you completed the eco-task!"}
            </p>

            <div className={`border-4 border-dashed rounded-3xl p-10 text-center transition cursor-pointer relative group ${result?.is_valid === false ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'}`}>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleUpload}
                  disabled={verifying || verified}
                />
                
                {verifying ? (
                    <div className="flex flex-col items-center">
                        <Loader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-blue-600">AI is Analyzing...</h3>
                        {fileType === 'video' && <p className="text-sm font-bold text-blue-400 mb-1 animate-pulse italic">Watching your video (this can take a few seconds)...</p>}
                        <p className="text-sm text-gray-500">Checking your submission...</p>
                    </div>
                ) : result?.is_valid === false ? (
                    <div className="flex flex-col items-center">
                         <XCircle className="w-16 h-16 text-red-500 mb-4" />
                         <h3 className="text-xl font-bold text-red-600">Verification Failed!</h3>
                         <p className="text-gray-600 mb-2">{result.message}</p>
                         <p className="text-sm font-bold text-red-400 animate-pulse">Click to try again</p>
                    </div>
                ) : !file ? (
                    <>
                        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:scale-110 transition" />
                        <h3 className="text-xl font-bold text-gray-700">Click to Upload Proof</h3>
                        <p className="text-sm text-gray-500">Supports JPG, PNG, MP4, MOV</p>
                    </>
                ) : (
                    <div className="relative">
                        {fileType === 'image' ? (
                            <img src={file} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow" />
                        ) : (
                            <video src={file} controls className="max-h-64 mx-auto rounded-lg shadow" />
                        )}
                    </div>
                )}
            </div>
            
            <div className="mt-8 bg-blue-50 p-4 rounded-xl text-sm text-blue-800 flex items-start gap-2">
                <span>ℹ️</span>
                <p>Powered by AI. Please upload a clear image or video relevant to the task.</p>
            </div>
        </div>
    );
};

export default TaskUpload;
