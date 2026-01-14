import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Leaf, Mic, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameAPI } from '../../services/api';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Hi! I'm EcoBot. Ask me anything about sustainability or how to earn coins! 🌱" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // --- SCROLL TO BOTTOM ---
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // --- SPEECH RECOGNITION SETUP ---
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(null, transcript); // Auto-send when speaking stops
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    // --- TEXT TO SPEECH ---
    const speak = (text) => {
        if (!voiceEnabled || !window.speechSynthesis) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        // Try to pick a friendly voice (optional)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
            window.speechSynthesis.cancel(); // Stop speaking if user interrupts
        }
    };

    // --- SEND MESSAGE ---
    const handleSend = async (e, overrideText = null) => {
        if (e) e.preventDefault();
        
        const userMsg = overrideText || input;
        if (!userMsg.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await gameAPI.chat(userMsg);
            const botResponse = data.response;
            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
            
            // Speak the response
            speak(botResponse);

        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting. Try again!" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl mb-4 overflow-hidden border border-green-100 flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 flex justify-between items-center text-white shadow-md z-10">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1.5 rounded-full">
                                    <Leaf size={18} />
                                </div>
                                <div>
                                    <span className="font-bold block text-sm">EcoBot Assistant</span>
                                    {isSpeaking && <span className="text-xs text-green-100 animate-pulse">Speaking...</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => {
                                        setVoiceEnabled(!voiceEnabled);
                                        if (voiceEnabled) window.speechSynthesis.cancel();
                                    }}
                                    className="hover:bg-white/20 rounded-full p-2 transition"
                                    title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
                                >
                                    {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-2 transition">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-green-600 text-white rounded-br-none' 
                                            : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                        Thinking...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`p-3 rounded-full transition-all duration-300 ${
                                    isListening 
                                        ? 'bg-red-500 text-white shadow-lg scale-110 animate-pulse' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title="Push to Talk"
                            >
                                <Mic size={20} />
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isListening ? "Listening..." : "Ask EcoBot..."}
                                className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                            
                            <button 
                                type="submit" 
                                disabled={loading || !input.trim()}
                                className="bg-green-600 text-white p-2.5 rounded-full hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-green-500/30 transition-shadow z-50"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>
        </div>
    );
};

export default ChatBot;