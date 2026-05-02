const { createServer } = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// ── 1. Création du serveur HTTP à partir de l'app Express ─────────────────────
// Socket.io ne peut pas se brancher directement sur Express.
// Il a besoin d'un serveur HTTP natif Node.js comme base.
const httpServer = createServer(app);

// ── 2. Initialisation de Socket.io sur ce serveur HTTP ────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
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