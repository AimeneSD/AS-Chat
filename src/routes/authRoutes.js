const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes d'authentification
router.post('/register', AuthController.register);
router.post('/login',    AuthController.login);
router.post('/logout',   AuthController.logout);
router.get('/me',        authMiddleware, AuthController.me);

module.exports = router;
