const User = require('../models/User');

// ─── Limites de contenu (Free Plan) ───────────────────────────────────────────
const MAX_USERNAME_LENGTH = 30;
const MAX_AVATAR_URL_LENGTH = 500;

const UserController = {

    /**
     * GET /api/users/me
     * Retourne le profil de l'utilisateur actuellement connecté.
     * (req.user est injecté par le middleware JWT)
     */
    getMe: async (req, res) => {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        return res.status(200).json(user);
    },

    /**
     * GET /api/users/:id
     * Retourne le profil public d'un autre utilisateur.
     */
    getProfile: async (req, res) => {
        const targetId = parseInt(req.params.id);

        if (isNaN(targetId)) {
            return res.status(400).json({ error: 'ID invalide.' });
        }

        const user = await User.findById(targetId);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        return res.status(200).json(user);
    },

    /**
     * PATCH /api/users/me
     * Met à jour le profil de l'utilisateur connecté.
     * Body attendu : { username?, avatar_url? }
     */
    updateProfile: async (req, res) => {
        const { username, avatar_url } = req.body;

        // ── Validation ──────────────────────────────────────────────────────────
        if (username !== undefined) {
            if (typeof username !== 'string' || username.trim().length < 3) {
                return res.status(400).json({ error: 'Le username doit faire au moins 3 caractères.' });
            }
            if (username.length > MAX_USERNAME_LENGTH) {
                return res.status(400).json({
                    error: `Le username ne peut pas dépasser ${MAX_USERNAME_LENGTH} caractères.`
                });
            }
        }

        if (avatar_url !== undefined && avatar_url.length > MAX_AVATAR_URL_LENGTH) {
            return res.status(400).json({
                error: `L'URL de l'avatar est trop longue (max ${MAX_AVATAR_URL_LENGTH} caractères).`
            });
        }

        // ── Mise à jour ─────────────────────────────────────────────────────────
        const updatedUser = await User.updateProfile(req.user.id, {
            username: username?.trim(),
            avatar_url,
        });

        if (!updatedUser) {
            return res.status(400).json({ error: 'Aucun champ valide fourni.' });
        }

        return res.status(200).json(updatedUser);
    },

    /**
     * GET /api/users/search?q=...
     * Recherche des utilisateurs par username.
     * Utilisé pour démarrer une nouvelle conversation.
     */
    search: async (req, res) => {
        const query = req.query.q;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: 'La recherche doit contenir au moins 2 caractères.' });
        }

        // On exclut l'utilisateur connecté des résultats
        const users = await User.search(query.trim(), req.user.id);

        return res.status(200).json(users);
    },
};

module.exports = UserController;
