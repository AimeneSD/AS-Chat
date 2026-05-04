const jwt = require('jsonwebtoken');

/**
* Middleware d'authentification JWT pour AS-Chat.
*
* Attend un header Authorization de la forme : Authorization: Bearer <token>
*
* En cas de succès, injecte req.user = { id, username, email }
* pour que tous les controllers puissent l'utiliser.
*/
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // ── 1. Vérification de la présence du header ────────────────────────────
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }

    // ── 2. Extraction du token (on enlève "Bearer ") ────────────────────────
    const token = authHeader.split(' ')[1];

    // ── 3. Vérification et décodage du token ────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // jwt.verify lève une erreur si le token est invalide ou expiré.
    // Elle sera attrapée par le error handler global dans app.js.

    // ── 4. On injecte le payload dans req.user ──────────────────────────────
    req.user = decoded; // { id, username, email, iat, exp }
    next();
};

module.exports = authMiddleware;
