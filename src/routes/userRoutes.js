const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes utilisateur AS-Chat (toutes protégées par JWT)
// (routes statiques déclarées AVANT les routes dynamiques :id)
router.get('/search', authMiddleware, UserController.search);
router.get('/me',     authMiddleware, UserController.getMe);
router.patch('/me',   authMiddleware, UserController.updateProfile);
router.get('/:id',    authMiddleware, UserController.getProfile);

module.exports = router;
