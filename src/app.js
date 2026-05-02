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

module.exports = app;
