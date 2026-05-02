const mysql = require('mysql2');
require('dotenv').config();

// Pool de connexions sql
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// exporte version promise pour async/await
module.exports = pool.promise();
