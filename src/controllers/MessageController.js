const Message = require('../models/Message');

// ─── Limites de stockage (Free Plan) ──────────────────────────────────────────
const MAX_CONTENT_LENGTH = 2000; // caractères max par message
const MAX_MESSAGES_PER_PAGE = 50; // messages max par requête de pagination

const MessageController = {

    /**
     * POST /api/messages
     * Envoie un nouveau message texte.
     * Body attendu : { receiver_id, content }
     */
    send: async (req, res) => {
        const { receiver_id, content } = req.body;
        const sender_id = req.user.id; // injecté par le middleware JWT

        // ── Validation ──────────────────────────────────────────────────────────
        if (!receiver_id || !content) {
            return res.status(400).json({ error: 'receiver_id et content sont requis.' });
        }

        if (typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ error: 'Le message ne peut pas être vide.' });
        }

        // Limite de stockage : on refuse les messages trop longs
        if (content.length > MAX_CONTENT_LENGTH) {
            return res.status(413).json({ // 413 = Payload Too Large
                error: `Message trop long. Maximum ${MAX_CONTENT_LENGTH} caractères.`
            });
        }

        if (sender_id === parseInt(receiver_id)) {
            return res.status(400).json({ error: 'Vous ne pouvez pas vous envoyer un message.' });
        }

        // ── Création en base ────────────────────────────────────────────────────
        const message = await Message.create(sender_id, receiver_id, content.trim());
        return res.status(201).json(message);
    },

    /**
     * GET /api/messages/:userId
     * Récupère la conversation avec un utilisateur donné.
     * Query params optionnels : ?page=1
     */
    getConversation: async (req, res) => {
        const currentUserId = req.user.id;
        const targetUserId = parseInt(req.params.userId);

        if (!targetUserId || isNaN(targetUserId)) {
            return res.status(400).json({ error: 'userId invalide.' });
        }

        // Pagination : calcul de l'offset depuis le numéro de page
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const offset = (page - 1) * MAX_MESSAGES_PER_PAGE;

        const messages = await Message.getConversation(
            currentUserId,
            targetUserId,
            MAX_MESSAGES_PER_PAGE,
            offset
        );

        return res.status(200).json({
            page,
            limit: MAX_MESSAGES_PER_PAGE,
            messages
        });
    },

    /**
     * PATCH /api/messages/read/:senderId
     * Marque comme "lus" tous les messages reçus d'un expéditeur.
     */
    markAsRead: async (req, res) => {
        const receiverId = req.user.id;
        const senderId = parseInt(req.params.senderId);

        if (!senderId || isNaN(senderId)) {
            return res.status(400).json({ error: 'senderId invalide.' });
        }

        const updated = await Message.markAsRead(senderId, receiverId);
        return res.status(200).json({ updated_count: updated });
    },

    /**
     * GET /api/messages/unread
     * Retourne le nombre total de messages non lus pour l'utilisateur connecté.
     */
    getUnreadCount: async (req, res) => {
        const userId = req.user.id;
        const count = await Message.getUnreadCount(userId);
        return res.status(200).json({ unread: count });
    },

    /**
     * DELETE /api/messages/:messageId
     * Soft delete d'un message (seul l'auteur peut le supprimer).
     */
    delete: async (req, res) => {
        const senderId = req.user.id;
        const messageId = parseInt(req.params.messageId);

        if (!messageId || isNaN(messageId)) {
            return res.status(400).json({ error: 'messageId invalide.' });
        }

        const success = await Message.delete(messageId, senderId);

        if (!success) {
            // Soit le message n'existe pas, soit l'utilisateur n'en est pas l'auteur
            return res.status(403).json({ error: 'Action non autorisée ou message introuvable.' });
        }

        return res.status(200).json({ message: 'Message supprimé.' });
    },
};

module.exports = MessageController;
