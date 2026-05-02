const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');

// API Gateway - Centralisation des routes AS-Chat
router.use('/auth', authRoutes);

// Futures routes
// router.use('/friends', friendRoutes);
// router.use('/messages', messageRoutes);

module.exports = router;
