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
     * Body attendu : { username?, currentPassword?, avatar_url? }
     */
    updateProfile: async (req, res) => {
        const { username, currentPassword, avatar_url } = req.body;

        // ── Validation ──────────────────────────────────────────────────────────
        if (username !== undefined) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Le mot de passe actuel est requis pour changer de nom d\'utilisateur.' });
            }
            
            const dbPassword = await User.findPasswordById(req.user.id);
            const isValid = await User.verifyPassword(currentPassword, dbPassword);
            if (!isValid) {
                return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
            }

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
     * PATCH /api/users/password
     * Met à jour le mot de passe
     */
    updatePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Mots de passe requis.' });
            if (newPassword.length < 12) return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 12 caractères.' });

            const dbPassword = await User.findPasswordById(req.user.id);
            const isValid = await User.verifyPassword(currentPassword, dbPassword);
            if (!isValid) return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });

            await User.updatePassword(req.user.id, newPassword);
            return res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
        } catch (error) {
            console.error('[UpdatePassword Error]', error);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe.' });
        }
    },

    /**
     * GET /api/users/search?q=...
     */
    search: async (req, res) => {
        const query = req.query.q;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: 'La recherche doit contenir au moins 2 caractères.' });
        }

        const users = await User.search(query.trim(), req.user.id);
        return res.status(200).json(users);
    },

    /**
     * DELETE /api/users/me
     * Supprime le compte de l'utilisateur.
     */
    deleteAccount: async (req, res) => {
        try {
            await User.deleteAccount(req.user.id);
            res.clearCookie('token');
            return res.status(200).json({ message: 'Compte supprimé avec succès.' });
        } catch (error) {
            console.error('[DeleteAccount Error]', error);
            return res.status(500).json({ error: 'Erreur lors de la suppression du compte.' });
        }
    },
};

module.exports = UserController;
