const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes d'authentification AS-Chat
router.post('/register', AuthController.register);
router.post('/login',    AuthController.login);
router.get('/me',        authMiddleware, AuthController.me); // Route protégée

module.exports = router;
