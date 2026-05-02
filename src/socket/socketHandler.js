const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * socketHandler — Gestionnaire principal de Socket.io pour AS-Chat.
 *
 * Vocabulaire Socket.io :
 *   - io     : le serveur Socket.io (diffuse à tout le monde)
 *   - socket : la connexion individuelle d'UN client
 *   - emit   : envoyer un événement
 *   - on     : écouter un événement
 *   - room   : canal privé identifié par un nom (ici l'userId)
 */
module.exports = (io) => {

    // ── Middleware JWT pour Socket.io ──────────────────────────────────────────
    // Avant d'accepter une connexion, on vérifie le token JWT envoyé par le client.
    // Le client doit envoyer : socket = io(URL, { auth: { token: '...' } })
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error('Authentification requise.'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // { id, username, email } — disponible partout
        next();
    });

    // ── Connexion d'un client ──────────────────────────────────────────────────
    io.on('connection', async (socket) => {
        const userId = socket.user.id;
        console.log(`[Socket] ${socket.user.username} connecté (socket: ${socket.id})`);

        // ── 1. Rejoindre sa "Room" personnelle ──────────────────────────────────
        // Chaque utilisateur rejoint une room portant son propre ID.
        // Cela permet d'envoyer un message précisément à cette personne.
        socket.join(`user:${userId}`);

        // ── 2. Mettre à jour le statut en base ──────────────────────────────────
        await User.setStatus(userId, 'online');

        // ── 3. Informer les autres que cet utilisateur est en ligne ─────────────
        // broadcast.emit envoie à TOUS sauf à l'expéditeur lui-même
        socket.broadcast.emit('user:online', { userId, username: socket.user.username });


        // ── ÉVÉNEMENT : Envoi d'un message ───────────────────────────────────────
        // Déclenché par le frontend quand l'utilisateur envoie un message.
        // Payload attendu : { receiverId, content }
        socket.on('message:send', async (data, callback) => {
            const { receiverId, content } = data;

            // Validation rapide
            if (!receiverId || !content || content.trim().length === 0) {
                return callback?.({ error: 'Données invalides.' });
            }

            if (content.length > 2000) {
                return callback?.({ error: 'Message trop long (max 2000 caractères).' });
            }

            // Sauvegarde en base de données
            const message = await Message.create(userId, receiverId, content.trim());

            // Envoyer le message au destinataire dans sa room privée
            // Si le destinataire est connecté, il le reçoit instantanément
            io.to(`user:${receiverId}`).emit('message:receive', message);

            // Confirmer à l'expéditeur que le message a bien été envoyé
            // (callback est une fonction d'accusé de réception côté client)
            callback?.({ success: true, message });
        });


        // ── ÉVÉNEMENT : Indicateur "est en train d'écrire" ───────────────────────
        // Déclenché quand l'utilisateur tape dans le champ de saisie.
        // Payload attendu : { receiverId }
        socket.on('message:typing', (data) => {
            const { receiverId } = data;
            if (!receiverId) return;

            // On prévient le destinataire (sans sauvegarder en base, c'est éphémère)
            io.to(`user:${receiverId}`).emit('message:typing', {
                senderId: userId,
                username: socket.user.username,
            });
        });


        // ── ÉVÉNEMENT : Arrêt de la frappe ───────────────────────────────────────
        socket.on('message:stopTyping', (data) => {
            const { receiverId } = data;
            if (!receiverId) return;

            io.to(`user:${receiverId}`).emit('message:stopTyping', { senderId: userId });
        });


        // ── ÉVÉNEMENT : Messages lus ──────────────────────────────────────────────
        // Déclenché quand l'utilisateur ouvre une conversation.
        // Payload attendu : { senderId } (celui dont on vient de lire les messages)
        socket.on('message:read', async (data) => {
            const { senderId } = data;
            if (!senderId) return;

            await Message.markAsRead(senderId, userId);

            // Notifier l'expéditeur original que ses messages ont été lus
            // (pour afficher les "coches bleues" côté frontend)
            io.to(`user:${senderId}`).emit('message:read', { readBy: userId });
        });


        // ── DÉCONNEXION ───────────────────────────────────────────────────────────
        socket.on('disconnect', async () => {
            console.log(`[Socket] ${socket.user.username} déconnecté`);

            await User.setStatus(userId, 'offline');

            // Informer les autres que cet utilisateur est maintenant hors ligne
            socket.broadcast.emit('user:offline', { userId });
        });
    });
};
