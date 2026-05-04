const Friend = require('../models/Friend');

const FriendController = {

    /**
     * POST /api/friends/request/:addresseeId
     * Envoie une demande d'ami à un utilisateur.
     */
    sendRequest: async (req, res) => {
        const requesterId = req.user.id;
        const addresseeId = parseInt(req.params.addresseeId);

        if (isNaN(addresseeId)) {
            return res.status(400).json({ error: 'ID invalide.' });
        }

        if (requesterId === addresseeId) {
            return res.status(400).json({ error: 'Vous ne pouvez pas vous envoyer une demande.' });
        }

        // Vérifie qu'il n'existe pas déjà une relation entre les deux
        const existing = await Friend.getRelationship(requesterId, addresseeId);
        if (existing) {
            const messages = {
                pending:  'Une demande est déjà en attente.',
                accepted: 'Vous êtes déjà amis.',
                blocked:  'Impossible d\'envoyer une demande.',
            };
            return res.status(409).json({ error: messages[existing] }); // 409 = Conflict
        }

        const request = await Friend.sendRequest(requesterId, addresseeId);
        return res.status(201).json(request);
    },

    /**
     * POST /api/friends/request-by-username
     * Envoie une demande d'ami via le pseudo exact.
     */
    sendRequestByUsername: async (req, res) => {
        const requesterId = req.user.id;
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Pseudo requis.' });
        }

        const User = require('../models/User');
        const targetUser = await User.findByUsername(username);

        if (!targetUser) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        const addresseeId = targetUser.id;

        if (requesterId === addresseeId) {
            return res.status(400).json({ error: 'Vous ne pouvez pas vous envoyer une demande.' });
        }

        const existing = await Friend.getRelationship(requesterId, addresseeId);
        if (existing) {
            const messages = {
                pending:  'Une demande est déjà en attente.',
                accepted: 'Vous êtes déjà amis.',
                blocked:  'Impossible d\'envoyer une demande.',
            };
            return res.status(409).json({ error: messages[existing] });
        }

        const request = await Friend.sendRequest(requesterId, addresseeId);
        return res.status(201).json(request);
    },

    /**
     * PATCH /api/friends/accept/:requesterId
     * Accepte la demande d'ami d'un utilisateur.
     */
    acceptRequest: async (req, res) => {
        const addresseeId = req.user.id;
        const requesterId = parseInt(req.params.requesterId);

        if (isNaN(requesterId)) {
            return res.status(400).json({ error: 'ID invalide.' });
        }

        const success = await Friend.acceptRequest(requesterId, addresseeId);

        if (!success) {
            return res.status(404).json({ error: 'Demande introuvable ou déjà traitée.' });
        }

        return res.status(200).json({ message: 'Demande acceptée.' });
    },

    /**
     * DELETE /api/friends/:userId
     * Refuse, annule ou supprime une relation avec un utilisateur.
     * Fonctionne dans les deux sens (peu importe qui avait initié).
     */
    declineOrRemove: async (req, res) => {
        const currentUserId = req.user.id;
        const targetUserId = parseInt(req.params.userId);

        if (isNaN(targetUserId)) {
            return res.status(400).json({ error: 'ID invalide.' });
        }

        const success = await Friend.declineOrCancel(currentUserId, targetUserId);

        if (!success) {
            return res.status(404).json({ error: 'Relation introuvable.' });
        }

        return res.status(200).json({ message: 'Relation supprimée.' });
    },

    /**
     * POST /api/friends/block/:userId
     * Bloque un utilisateur.
     */
    block: async (req, res) => {
        const blockerId = req.user.id;
        const blockedId = parseInt(req.params.userId);

        if (isNaN(blockedId)) {
            return res.status(400).json({ error: 'ID invalide.' });
        }

        if (blockerId === blockedId) {
            return res.status(400).json({ error: 'Action invalide.' });
        }

        await Friend.block(blockerId, blockedId);
        return res.status(200).json({ message: 'Utilisateur bloqué.' });
    },

    /**
     * GET /api/friends
     * Retourne la liste des amis confirmés de l'utilisateur connecté.
     */
    getFriends: async (req, res) => {
        const friends = await Friend.getFriends(req.user.id);
        return res.status(200).json(friends);
    },

    /**
     * GET /api/friends/pending
     * Retourne les demandes d'ami reçues et en attente.
     */
    getPendingRequests: async (req, res) => {
        const requests = await Friend.getPendingRequests(req.user.id);
        return res.status(200).json(requests);
    },

    /**
     * GET /api/friends/relationship/:userId
     * Vérifie la relation entre l'utilisateur connecté et un autre user.
     * Utile côté frontend pour afficher le bon bouton (Ajouter / En attente / Amis).
     */
    getRelationship: async (req, res) => {
        const currentUserId = req.user.id;
        const targetUserId = parseInt(req.params.userId);

        if (isNaN(targetUserId)) {
            return res.status(400).json({ error: 'ID invalide.' });
        }

        const status = await Friend.getRelationship(currentUserId, targetUserId);
        return res.status(200).json({ status }); // null si aucune relation
    },
};

module.exports = FriendController;
