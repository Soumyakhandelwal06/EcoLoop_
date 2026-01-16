import React, { useState } from 'react';

const QuizModal = ({ question, onCorrect, onIncorrect }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    if (!question) return null;

    // Parse options if they are string "A|B|C|D"
    const options = question.options.split('|');

    const handleOptionSelect = (index) => {
        if (isSubmitted) return;
        setSelectedOption(index);
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        if (selectedOption === question.correct_index) {
            setIsCorrect(true);
            setTimeout(() => {
                onCorrect();
            }, 1500); // Wait a bit to show success message
        } else {
            setIsCorrect(false);
            setTimeout(() => {
               onIncorrect(); 
            }, 2000); // Wait bit longer for failure message
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl transform scale-100 transition-all border-4 border-white">
                
                <div className="text-center mb-6">
                    <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                        Quick Quiz
                    </span>
                    <h3 className="text-2xl font-bold text-gray-800 mt-4 leading-tight">
                        {question.text}
                    </h3>
                </div>

                <div className="space-y-3">
                    {options.map((option, idx) => {
                        let btnClass = "w-full p-4 rounded-xl border-2 text-left font-semibold transition-all ";
                        
                        if (isSubmitted) {
                            if (idx === question.correct_index) {
                                btnClass += "bg-green-500 border-green-500 text-white shadow-lg";
                            } else if (idx === selectedOption) {
                                btnClass += "bg-red-500 border-red-500 text-white shadow-lg";
                            } else {
                                btnClass += "bg-gray-100 border-gray-200 text-gray-400 opacity-50";
                            }
                        } else {
                            if (selectedOption === idx) {
                                btnClass += "bg-green-50 border-green-500 text-green-700 shadow-md transform scale-102";
                            } else {
                                btnClass += "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-green-300";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                className={btnClass}
                                disabled={isSubmitted}
                            >
                                <div className="flex items-center">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 text-sm font-bold
                                        ${isSubmitted && idx === question.correct_index ? 'bg-white text-green-600' : 
                                          isSubmitted && idx === selectedOption ? 'bg-white text-red-600' :
                                          selectedOption === idx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    {option}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {!isSubmitted && (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedOption === null}
                        className={`mt-8 w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all
                            ${selectedOption !== null 
                                ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Submit Answer
                    </button>
                )}

                {isSubmitted && (
                    <div className={`mt-6 text-center text-lg font-bold animate-pulse
                        ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                        {isCorrect ? "🎉 Correct! Resuming video..." : "❌ Incorrect. You must re-watch this segment."}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizModal;
