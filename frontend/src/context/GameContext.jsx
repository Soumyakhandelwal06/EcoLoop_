import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const GameContext = createContext();

// Configure Axios
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log("EcoLoop API Base URL:", API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 120000, // 120 seconds timeout (to handle extremely slow Render cold starts)
});

console.log("Axios Instance Created with Timeout:", api.defaults.timeout);

// Add Token Interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add Response Interceptor for 401 (Global Logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // We can't easily access setUser here outside the provider loop without a workaround or signal,
            // but clearing the token ensures next refresh is clean.
            // Ideally trigger a custom event or just reload if critical.
            // For now, let's let the component handling the error also do its thing, but the token is gone.
        }
        return Promise.reject(error);
    }
);

export const GameProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await api.get('/users/me');
                setUser(res.data);
            } catch (err) {
                console.error("Auth Failed - Token Invalid", err);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
    };

    // Initial Load - Check Token
    useEffect(() => {
        const init = async () => {
            await fetchUser();
            // Always fetch levels (Public Data)
            await fetchLevels();
            setLoading(false);
        };
        init();
    }, []);

    const fetchLevels = async () => {
        try {
            const res = await api.get('/levels');
            // We need to merge backend levels with local progress if needed, 
            // but for now backend is the source of truth for level content.
            // Backend should also return status, or we map user.progress to levels.
            // My API currently returns just levels. The user object has 'progress'.
            // I need to map them.
            setLevels(res.data);
        } catch (err) {
            console.error("Fetch Levels Failed. Current BaseURL:", api.defaults.baseURL, err);
        }
    };

    const login = async (username, password) => {
        try {
            const res = await api.post('/login', { username, password });
            const { access_token } = res.data;
            localStorage.setItem('token', access_token);

            // Get User Details
            const userRes = await api.get('/users/me');
            setUser(userRes.data);
            fetchLevels();
            return { success: true };
        } catch (err) {
            console.error("Login Error:", err);
            let errorMessage = "Login failed";
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                errorMessage = "Request timed out. The server might be waking up (Cold Start). This can take up to 2 minutes on the first try. Please wait and try again.";
                console.warn("Timeout detected:", err);
            } else if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (!err.response) {
                errorMessage = "Network error. Please check your internet connection and verify if the backend is running at: " + API_URL;
                console.error("Network error details:", err);
            }
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await api.post('/register', { username, email, password });
            const { access_token } = res.data;
            localStorage.setItem('token', access_token);

            const userRes = await api.get('/users/me');
            setUser(userRes.data);
            fetchLevels();
            return { success: true };
        } catch (err) {
            console.error("Register Error:", err);
            let errorMessage = "Registration failed";
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                errorMessage = "Request timed out. The server might be waking up (Cold Start). This can take up to 2 minutes on the first try. Please wait and try again.";
                console.warn("Timeout detected during registration:", err);
            } else if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (!err.response) {
                errorMessage = "Network error. Please check your internet connection and verify if the backend is running at: " + API_URL;
                console.error("Network error details during registration:", err);
            }
            return { success: false, error: errorMessage };
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await api.get('/leaderboard');
            return res.data;
        } catch (err) {
            console.error("Fetch Leaderboard Failed", err);
            return [];
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setLevels([]);
    };

    const verifyTask = async (file, taskLabel) => {
        const formData = new FormData();
        formData.append('file', file);
        if (taskLabel) {
            formData.append('task_label', taskLabel);
        }

        try {
            const token = localStorage.getItem('token');
            const res = await api.post('/verify-task', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return res.data; // { is_valid: boolean, message: string, confidence: number }
        } catch (err) {
            console.error(err);
            return { is_valid: false, message: "Server Error", confidence: 0 };
        }
    };

    const updateProgress = async (levelId, coinsEarned, xpEarned, isLevelCompletion = true) => {
        try {
            const res = await api.post('/users/progress', {
                level_id: levelId,
                coins_earned: coinsEarned,
                xp_earned: xpEarned,
                is_level_completion: isLevelCompletion
            });
            // Update local user state
            if (user) {
                setUser({ ...user, coins: res.data.new_balance });
            }
            // Refetch levels to update status (locked/unlocked)
            fetchLevels(); // Actually we need to refetch 'user' because progress is effectively on user object/user-progress
            // Wait, passing 'user progress' inside 'user' object is tricky if we don't refresh 'user'
            // Let's refresh user
            const userRes = await api.get('/users/me');
            setUser(userRes.data);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    // Helper: Get Level Status from User Progress
    const getLevelStatus = (levelId) => {
        if (!user || !user.progress) {
            // Fallback for immediate UI if user data takes a split second
            // But actually, just default to locked if not found, unless it's Level 1
            return levelId === 1 ? 'unlocked' : 'locked';
        }

        // Find progress entry
        // NOTE: Backend automatically creates progress for level 1 on register.
        // So we can rely on that state.
        // For now, let's treat Level 1 as always unlocked if nothing exists.

        // Wait, user.progress is a list.
        // Let's implement robust logic:
        // Level 1 is unlocked by default if not present.

        const prog = user.progress.find(p => p.level_id === levelId);
        if (prog) return prog.status;

        return levelId === 1 ? 'unlocked' : 'locked';
    };

    const getStoreItems = async () => {
        try {
            const res = await api.get('/store/items');
            // Ensure image_url is fully qualified if it starts with /static
            const processedData = res.data.map(item => ({
                ...item,
                image_url: item.image_url && item.image_url.startsWith('/') 
                    ? `${API_URL}${item.image_url}` 
                    : item.image_url
            }));
            return processedData;
        } catch (err) {
            console.error("Store Fetch Error:", err);
            return [];
        }
    };

    const buyItem = async (itemId) => {
        try {
            const res = await api.post('/store/buy', { item_id: itemId });
            // Refresh user to get new balance
            await fetchUser();
            return { success: true, message: res.data.message };
        } catch (err) {
            console.error("Purchase Error:", err);
            return {
                success: false,
                message: err.response?.data?.detail || "Purchase failed"
            };
        }
    };

    const getChallenges = async () => {
        try {
            const res = await api.get('/challenges');
            return res.data;
        } catch (err) {
            console.error("Fetch Challenges Failed", err);
            return [];
        }
    };

    const completeChallenge = async (challengeId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post(`/challenges/${challengeId}/complete`, formData);
            // Refresh user to get new balance and streak
            await fetchUser();
            return { success: true, ...res.data };
        } catch (err) {
            console.error("Complete Challenge Failed", err);
            return {
                success: false,
                message: err.response?.data?.detail || "Completion failed"
            };
        }
    };

    return (
        <GameContext.Provider value={{
            user,
            levels,
            loading,
            error,
            login,
            register,
            logout,
            verifyTask,
            updateProgress,
            getLevelStatus,
            fetchLeaderboard,
            getStoreItems,
            buyItem,
            getChallenges,
            completeChallenge,
            fetchUser // Expose fetchUser for manual refresh if needed
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
