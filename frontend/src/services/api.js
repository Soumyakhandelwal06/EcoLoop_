import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Matches your FastAPI main.py address

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Add Token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (username, password) => api.post('/login', { username, password }),
    register: (username, email, password) => api.post('/register', { username, email, password }),
    getMe: () => api.get('/users/me'),
};

export const gameAPI = {
    getLevels: () => api.get('/levels'),
    updateProgress: (levelId, coinsEarned, xpEarned) => 
        api.post('/users/progress', { level_id: levelId, coins_earned: coinsEarned, xp_earned: xpEarned }),
    
    // Uses the newly added chat endpoint in main.py
    chat: (message) => api.post('/chat', { message }),

    // The Critical AI Endpoint
    verifyTask: (formData) => api.post('/verify-task', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;