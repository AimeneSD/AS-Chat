const { createServer } = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// ── 1. Création du serveur HTTP à partir de l'app Express ─────────────────────
// Socket.io ne peut pas se brancher directement sur Express.
// Il a besoin d'un serveur HTTP natif Node.js comme base.
const httpServer = createServer(app);

// Configuration des origines autorisées (identique à app.js)
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

// ── 2. Initialisation de Socket.io sur ce serveur HTTP ────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Non autorisé par CORS (Socket.io)'));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true
    },
});

// ── 3. Branchement du gestionnaire d'événements ───────────────────────────────
const socketHandler = require('./src/socket/socketHandler');
socketHandler(io);

// ── 4. Démarrage du serveur ───────────────────────────────────────────────────
httpServer.listen(PORT, () => {
    console.log(`[AS-Chat] Serveur démarré sur le port ${PORT}`);
    console.log(`[AS-Chat] Socket.io actif`);
});