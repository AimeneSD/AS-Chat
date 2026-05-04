const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/authMiddleware'); // Retiré dans index.js, mais par sécurité on le laisse si besoin. Attends, index.js a l'authMiddleware, je vais le retirer d'ici.

// (Le middleware est maintenant appliqué dans index.js)
router.get('/search', UserController.search);
router.get('/me',     UserController.getMe);
router.patch('/me',   UserController.updateProfile);
router.get('/:id',    UserController.getProfile);

// Nouvelles routes pour les paramètres de compte
router.patch('/password',            UserController.updatePassword);

module.exports = router;
