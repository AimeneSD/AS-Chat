const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Génère un token JWT signé avec le payload de l'utilisateur.
 * @param {object} user - { id, username, email }
 * @returns {string} Le token JWT
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ─── Controller ────────────────────────────────────────────────────────────────

const AuthController = {

    /**
     * POST /api/auth/register
     * Crée un nouveau compte utilisateur.
     * Body attendu : { username, email, password }
     */
    register: async (req, res) => {
        const { username, email, password } = req.body;

        // ── Validation des champs ────────────────────────────────────────────
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont requis.' });
        }

        if (username.trim().length < 3 || username.length > 30) {
            return res.status(400).json({ error: 'Le username doit faire entre 3 et 30 caractères.' });
        }

        // Regex basique pour valider le format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Format d\'email invalide.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit faire au moins 8 caractères.' });
        }

        // ── Vérification de l'unicité de l'email ────────────────────────────
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Cet email est déjà utilisé.' }); // 409 = Conflict
        }

        // ── Création de l'utilisateur (le hachage est géré dans le model) ───
        const newUser = await User.create(username.trim(), email.toLowerCase(), password);

        // ── Génération du token et réponse ───────────────────────────────────
        const token = generateToken(newUser);

        return res.status(201).json({
            message: 'Compte créé avec succès.',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    },

    /**
     * POST /api/auth/login
     * Connecte un utilisateur existant.
     * Body attendu : { email, password }
     */
    login: async (req, res) => {
        const { email, password } = req.body;

        // ── Validation ───────────────────────────────────────────────────────
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis.' });
        }

        // ── Recherche de l'utilisateur ───────────────────────────────────────
        const user = await User.findByEmail(email.toLowerCase());

        // Message volontairement vague : on ne révèle pas si l'email existe ou non
        if (!user) {
            return res.status(401).json({ error: 'Identifiants incorrects.' });
        }

        // ── Vérification du mot de passe ─────────────────────────────────────
        const isPasswordValid = await User.verifyPassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Identifiants incorrects.' });
        }

        // ── Génération du token et réponse ───────────────────────────────────
        const token = generateToken(user);

        return res.status(200).json({
            message: 'Connexion réussie.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    },

    /**
     * GET /api/auth/me
     * Vérifie le token actuel et retourne l'utilisateur associé.
     * Utile pour que le frontend sache si la session est toujours valide au démarrage.
     * (Route protégée par authMiddleware)
     */
    me: async (req, res) => {
        // req.user est injecté par authMiddleware
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        return res.status(200).json(user);
    },
};

module.exports = AuthController;
