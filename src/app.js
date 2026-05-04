const express = require('express');
const cors = require('cors'); // CORS (Cross-Origin Resource Sharing): permet de definir qui peut faire des call API ici
const cookieParser = require('cookie-parser');
require('dotenv').config();
const apiRouter = require('./routes/index');//on récupère la route api de routes/index.js

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Configuration CORS flexible (Production + Local)
const allowedOrigins = [
    process.env.CORS_ORIGIN,        // Ton URL Vercel
    'http://localhost:5173',       // Ton Localhost Frontend
    'http://127.0.0.1:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Autorise les requêtes sans origine (comme Postman ou serveurs internes) 
        // ou si l'origine est dans la liste blanche
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    optionsSuccessStatus: 200,
    credentials: true // Important pour Socket.io et les cookies
};

app.use(cors(corsOptions));

// API GATEWAY
app.use('/api', apiRouter);//route mounting vers index.js

// ─── Error Handler Global ─────────────────────────────────────────────────────
// Attrape toutes les erreurs lancées dans les controllers et middlewares.
// Les 4 paramètres (err, req, res, next) sont obligatoires pour qu'Express
// reconnaisse ce middleware comme un handler d'erreurs.
app.use((err, req, res, next) => {
    // Erreur JWT : token invalide ou mal formé
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token invalide.' });
    }
    // Erreur JWT : token expiré
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expirée. Veuillez vous reconnecter.' });
    }
    // Erreur MySQL : violation de contrainte unique (email ou username déjà pris)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Cet email ou username est déjà utilisé.' });
    }

    // Erreur inconnue : on logue en interne mais on ne l'expose pas au client
    console.error('[ERROR]', err.message);
    return res.status(500).json({ error: 'Erreur serveur interne.' });
});

module.exports = app;
