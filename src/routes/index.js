const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const messageRoutes = require('./messageRoutes');
const userRoutes    = require('./userRoutes');
const friendRoutes  = require('./friendRoutes');

// API Gateway - Centralisation des routes AS-Chat
router.use('/auth', authRoutes);

router.use('/messages', messageRoutes);

router.use('/users', userRoutes);

router.use('/friends', friendRoutes);

// Futures routes
// router.use('/rooms', roomRoutes);

module.exports = router;
