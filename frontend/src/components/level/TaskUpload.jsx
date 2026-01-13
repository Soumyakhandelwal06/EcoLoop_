// import React, { useState } from 'react';
// import { Camera, Upload, Check, Loader, XCircle } from 'lucide-react';
// import { useGame } from '../../context/GameContext';

// const TaskUpload = ({ onVerify, taskDescription }) => {
//     const [file, setFile] = useState(null);
//     const [verifying, setVerifying] = useState(false);
//     const [verified, setVerified] = useState(false);
//     const [result, setResult] = useState(null);
//     const { verifyTask, user, loading } = useGame();

//     if (loading) {
//         return (
//             <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full mx-auto text-center flex flex-col items-center">
//                 <Loader className="w-10 h-10 text-green-600 animate-spin mb-4" />
//                 <p className="text-gray-500">Checking account...</p>
//             </div>
//         );
//     }

//     if (!user) {
//         return (
//             <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full mx-auto text-center border-2 border-dashed border-gray-300">
//                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <Camera className="w-8 h-8 text-gray-400" />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-700 mb-2">Login to Complete Task</h3>
//                 <p className="text-gray-500">You need to be logged in to upload proofs and earn rewards.</p>
//             </div>
//         );
//     }

//     const handleUpload = async (e) => {
//         const selectedFile = e.target.files[0];
//         if (selectedFile) {
//             setFile(URL.createObjectURL(selectedFile));
//             setVerifying(true);
//             setResult(null); // Clear previous result
            
//             // Call Gemini API via Backend
//             const res = await verifyTask(selectedFile, taskDescription || "sustainable content (waste bins, nature, eco-friendly)");
            
//             setVerifying(false);
//             setResult(res);
            
//             if (res.is_valid) {
//                 setVerified(true);
//             }
//         }
//         // IMPORTANT: Reset input value so the same file can be selected again if it failed
//         e.target.value = '';
//     };

//     if (verified) {
//         return (
//             <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full mx-auto text-center animate-fade-in-up">
//                 <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                     <Check className="w-12 h-12 text-green-600" />
//                 </div>
//                 <h2 className="text-3xl font-bold text-green-800 mb-2">Verified by AI! 🤖</h2>
//                 <p className="text-gray-600 mb-2">{result?.message || "Great job!"}</p>
//                 <p className="text-sm text-gray-400 mb-6">Confidence: {(result?.confidence * 100).toFixed(0)}%</p>
                
//                 <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-8 inline-block animate-bounce">
//                     <span className="text-2xl font-bold text-yellow-800">Earned 100 EcoCoins! 🪙</span>
//                 </div>

//                 <br/>
//                 <button 
//                   onClick={onVerify}
//                   className="bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-green-700 transition"
//                 >
//                   Collect Rewards & Finish
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full mx-auto">
//             <h2 className="text-2xl font-bold text-green-800 mb-2 flex items-center gap-2">
//                 <Camera className="w-8 h-8"/> Daily Task
//             </h2>
//             <p className="text-gray-600 mb-8 font-medium text-lg bg-green-50 p-4 rounded-xl border border-green-200">
//                 {taskDescription || "Upload a photo proving you completed the eco-task!"}
//             </p>

//             <div className={`border-4 border-dashed rounded-3xl p-10 text-center transition cursor-pointer relative group ${result?.is_valid === false ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'}`}>
//                 <input 
//                   type="file" 
//                   accept="image/*" 
//                   className="absolute inset-0 opacity-0 cursor-pointer"
//                   onChange={handleUpload}
//                   disabled={verifying || verified}
//                 />
                
//                 {verifying ? (
//                     <div className="flex flex-col items-center">
//                         <Loader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
//                         <h3 className="text-xl font-bold text-blue-600">Gemini AI is Analyzing...</h3>
//                         <p className="text-sm text-gray-500">Checking your submission...</p>
//                     </div>
//                 ) : result?.is_valid === false ? (
//                     <div className="flex flex-col items-center">
//                          <XCircle className="w-16 h-16 text-red-500 mb-4" />
//                          <h3 className="text-xl font-bold text-red-600">Verification Failed!</h3>
//                          <p className="text-gray-600 mb-2">{result.message}</p>
//                          <p className="text-sm font-bold text-red-400 animate-pulse">Click to try again</p>
//                     </div>
//                 ) : !file ? (
//                     <>
//                         <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:scale-110 transition" />
//                         <h3 className="text-xl font-bold text-gray-700">Click to Upload Proof</h3>
//                         <p className="text-sm text-gray-500">Supports JPG, PNG</p>
//                     </>
//                 ) : (
//                     <div className="relative">
//                         <img src={file} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow" />
//                     </div>
//                 )}
//             </div>
            
//             <div className="mt-8 bg-blue-50 p-4 rounded-xl text-sm text-blue-800 flex items-start gap-2">
//                 <span>ℹ️</span>
//                 <p>Powered by Google Gemini AI. Please upload a clear image relevant to the task.</p>
//             </div>
//         </div>
//     );
// };

// export default TaskUpload;


import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader2, Camera, AlertCircle, Coins, Star } from 'lucide-react';

const TaskUpload = ({ 
  taskDescription = "Find a tree or plant and take a photo.", 
  taskType = "Daily Task", 
  levelId = null, 
  onSuccess 
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload JPG, PNG, WEBP, or MP4 files only');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('task_description', taskDescription);
      formData.append('task_type', taskType);
      if (levelId) formData.append('level_id', levelId);

      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:8000/verify-task', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Verification failed');
      }

      setResult(data);

      // Call success callback if provided
      if (data.verified && onSuccess) {
        setTimeout(() => onSuccess(data), 2000);
      }

    } catch (err) {
      setError(err.message || 'Failed to verify task. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      {/* Task Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Daily Task</h2>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
          <p className="text-gray-700 text-base sm:text-lg font-medium">{taskDescription}</p>
        </div>
      </div>

      {/* Upload Area */}
      {!preview && !result && (
        <label className="block cursor-pointer group">
          <div className="border-3 border-dashed border-gray-300 rounded-xl p-8 sm:p-16 hover:border-green-500 hover:bg-green-50 transition-all duration-300 group-hover:shadow-lg">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Click to Upload Proof</p>
              <p className="text-sm sm:text-base text-gray-500">Supports JPG, PNG, MP4</p>
              <p className="text-xs text-gray-400 mt-2">Maximum file size: 10MB</p>
            </div>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {/* Preview Section */}
      {preview && !result && (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-gray-900 shadow-lg">
            {file.type.startsWith('image') ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full max-h-[500px] object-contain mx-auto" 
              />
            ) : (
              <video 
                src={preview} 
                controls 
                className="w-full max-h-[500px] mx-auto"
              />
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Verifying with AI...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Submit for Verification
                </>
              )}
            </button>
            <button
              onClick={resetUpload}
              disabled={uploading}
              className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-semibold text-gray-700 transition-all hover:border-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-red-800 font-bold text-lg mb-1">Oops! Something went wrong</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Verification Result */}
      {result && (
        <div className={`rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom duration-500 ${
          result.verified 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300' 
            : 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
              result.verified ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.verified ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className={`text-2xl sm:text-3xl font-bold mb-3 ${
                result.verified ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.verified ? '🎉 Task Verified!' : '❌ Verification Failed'}
              </h3>
              
              <p className={`text-base sm:text-lg mb-5 ${
                result.verified ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>

              {/* Rewards Section */}
              {result.verified && result.rewards && (
                <div className="bg-white rounded-xl p-5 mb-5 shadow-md border border-green-200">
                  <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                    🎁 Rewards Earned
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-yellow-50 px-5 py-3 rounded-lg border border-yellow-200">
                      <Coins className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold text-yellow-700">+{result.rewards.coins}</p>
                        <p className="text-xs text-yellow-600 font-medium">Coins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-purple-50 px-5 py-3 rounded-lg border border-purple-200">
                      <Star className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-purple-700">+{result.rewards.xp}</p>
                        <p className="text-xs text-purple-600 font-medium">XP</p>
                      </div>
                    </div>
                  </div>
                  {result.new_coin_balance && (
                    <p className="text-sm text-gray-600 mt-3">
                      Total Balance: <span className="font-bold text-gray-800">{result.new_coin_balance} coins</span>
                    </p>
                  )}
                </div>
              )}

              {/* Analysis Details */}
              {result.analysis && (
                <div className="bg-white rounded-xl p-5 space-y-3 text-sm shadow-md mb-5">
                  <p className="font-bold text-gray-700 mb-3 text-base">📊 AI Analysis Report</p>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Confidence Level:</span>
                    <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                      result.analysis.confidence === 'High' ? 'bg-green-100 text-green-700' :
                      result.analysis.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {result.analysis.confidence}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">AI-Generated Risk:</span>
                    <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                      result.analysis.ai_probability === 'High' ? 'bg-red-100 text-red-700' :
                      result.analysis.ai_probability === 'Medium' ? 'bg-orange-100 text-orange-700' :
                      result.analysis.ai_probability === 'Low' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {result.analysis.ai_probability}
                    </span>
                  </div>
                  
                  {result.analysis.relevance && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Task Relevance:</span>
                      <span className="font-bold text-gray-800">{result.analysis.relevance}</span>
                    </div>
                  )}
                  
                  {result.analysis.ai_details && (
                    <div className="pt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs font-semibold text-blue-700 mb-1">AI Detection Details:</p>
                      <p className="text-gray-700 text-xs leading-relaxed">{result.analysis.ai_details}</p>
                    </div>
                  )}
                  
                  <div className="pt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-1">What we detected:</p>
                    <p className="text-gray-700 italic leading-relaxed">{result.analysis.proof_detected}</p>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {!result.verified && result.rejection_reason && (
                <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-bold mb-1">⚠️ Rejection Reason:</p>
                  <p className="text-red-700">{result.rejection_reason}</p>
                </div>
              )}

              {/* Suggestions */}
              {!result.verified && result.suggestions && (
                <div className="bg-white rounded-xl p-5 shadow-md border border-orange-200">
                  <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    💡 Tips for Success:
                  </p>
                  <ul className="space-y-2">
                    {result.suggestions.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-600 font-bold text-lg leading-none mt-0.5">✓</span>
                        <span className="text-gray-700 text-sm leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={resetUpload}
                className="mt-6 w-full py-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-bold text-gray-700 transition-all shadow-sm hover:shadow"
              >
                {result.verified ? '🎯 Upload Another Task' : '🔄 Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="flex items-start gap-3 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold">Powered by Google Gemini AI.</span> Our AI verifies if your submission is genuine and matches the task description. Please upload clear, authentic photos or videos.
        </p>
      </div>
    </div>
  );
};

export default TaskUpload;