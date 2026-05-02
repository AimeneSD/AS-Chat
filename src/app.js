const express = require('express');
const cors = require('cors'); // CORS (Cross-Origin Resource Sharing): permet de definir qui peut faire des call API ici
require('dotenv').config();
const apiRouter = require('./routes/index');//on récupère la route api de routes/index.js

const app = express();

// Middlewares
app.use(express.json());
const corsOptions = { //On definit l'autorisation API pour le frontend
    origin : process.env.CORS_ORIGIN,
    optionSuccessStatus:200
}

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
