const jwt = require('jsonwebtoken');

/**
* Middleware d'authentification JWT pour AS-Chat.
*
* Attend un token JWT stocké dans un cookie HttpOnly nommé 'as_chat_token'
*
* En cas de succès, injecte req.user = { id, username, email }
* pour que tous les controllers puissent l'utiliser.
*/
const authMiddleware = (req, res, next) => {
    // Lecture du token depuis les cookies (nécessite cookie-parser)
    const token = req.cookies.as_chat_token;

    // Vérification de la présence du token ────────────────────────────
    if (!token) {
        return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }

    // Vérification et décodage du token ────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // jwt.verify lève une erreur si le token est invalide ou expiré.
    // Elle sera attrapée par le error handler global dans app.js.

    // On injecte le payload dans req.user ──────────────────────────────
    req.user = decoded; // { id, username, email, iat, exp }
    next();
};

module.exports = authMiddleware;
