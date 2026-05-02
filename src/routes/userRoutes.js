const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
// const authMiddleware = require('../middlewares/authMiddleware'); // À activer avec le JWT

// Routes utilisateur AS-Chat
router.get('/search',   /* authMiddleware, */ UserController.search);      // AVANT /:id pour éviter le conflit
router.get('/me',       /* authMiddleware, */ UserController.getMe);
router.patch('/me',     /* authMiddleware, */ UserController.updateProfile);
router.get('/:id',      /* authMiddleware, */ UserController.getProfile);

module.exports = router;
