import { io } from 'socket.io-client';

// URL du serveur backend (doit correspondre à VITE_API_URL dans .env du frontend)
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initialise et retourne la connexion Socket.io.
 * À appeler une seule fois après le login, avec le token JWT.
 * @param {string} token - Le JWT récupéré après login
 * @returns {Socket}
 */
export const connectSocket = (token) => {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        // On envoie le JWT dans le handshake pour que le middleware serveur puisse l'authentifier
        auth: { token },
        // Reconnexion automatique si la connexion est perdue (coupure réseau, etc.)
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('[Socket] Connecté au serveur AS-Chat');
    });

    socket.on('connect_error', (err) => {
        console.error('[Socket] Erreur de connexion :', err.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('[Socket] Déconnecté :', reason);
    });

    return socket;
};

/**
 * Retourne l'instance socket existante (sans en créer une nouvelle).
 * À utiliser dans les composants après connexion initiale.
 * @returns {Socket|null}
 */
export const getSocket = () => socket;

/**
 * Déconnecte proprement le socket.
 * À appeler lors du logout.
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
