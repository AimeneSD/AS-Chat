const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const messageRoutes = require('./messageRoutes');
const userRoutes    = require('./userRoutes');
const friendRoutes  = require('./friendRoutes');
const authMiddleware = require('../middlewares/authMiddleware');

// API Gateway - Centralisation des routes AS-Chat
router.use('/auth', authRoutes);

router.use('/messages', authMiddleware, messageRoutes);

router.use('/users', authMiddleware, userRoutes);

router.use('/friends', authMiddleware, friendRoutes);

// Futures routes
// router.use('/rooms', roomRoutes);

module.exports = router;
