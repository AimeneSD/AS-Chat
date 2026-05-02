import axios from 'axios';

// ─── Instance Axios configurée ────────────────────────────────────────────────
// Toutes les requêtes partent de cette URL de base.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : 'http://localhost:5000/api',
    withCredentials: true
});

// ── Intercepteur de requête ────────────────────────────────────────────────────
// Avant chaque requête, on récupère le token depuis le localStorage
// et on l'ajoute automatiquement dans le header Authorization.
// Grâce à ça, on n'a jamais besoin de passer le token manuellement.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('as_chat_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Intercepteur de réponse ────────────────────────────────────────────────────
// Si le serveur répond 401 (token expiré ou invalide), on déconnecte
// l'utilisateur automatiquement et on redirige vers le login.
api.interceptors.response.use(
    (response) => response, // Cas normal : on retourne la réponse telle quelle
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('as_chat_token');
            localStorage.removeItem('as_chat_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─── Services Auth ────────────────────────────────────────────────────────────
export const authService = {
    register: (data) => api.post('/auth/register', data),
    login:    (data) => api.post('/auth/login', data),
    me:       ()     => api.get('/auth/me'),
};

// ─── Services User ────────────────────────────────────────────────────────────
export const userService = {
    search:        (query)  => api.get(`/users/search?q=${query}`),
    getProfile:    (userId) => api.get(`/users/${userId}`),
    updateProfile: (data)   => api.patch('/users/me', data),
};

// ─── Services Messages ────────────────────────────────────────────────────────
export const messageService = {
    getConversation: (userId, page = 1) => api.get(`/messages/${userId}?page=${page}`),
    getUnreadCount:  ()                 => api.get('/messages/unread'),
};

// ─── Services Friends ─────────────────────────────────────────────────────────
export const friendService = {
    getFriends:       ()         => api.get('/friends'),
    getPending:       ()         => api.get('/friends/pending'),
    getRelationship:  (userId)   => api.get(`/friends/relationship/${userId}`),
    sendRequest:      (userId)   => api.post(`/friends/request/${userId}`),
    acceptRequest:    (userId)   => api.patch(`/friends/accept/${userId}`),
    declineOrRemove:  (userId)   => api.delete(`/friends/${userId}`),
    block:            (userId)   => api.post(`/friends/block/${userId}`),
};

export default api;
