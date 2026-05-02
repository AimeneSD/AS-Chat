const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
// const authMiddleware = require('../middlewares/authMiddleware'); // À activer avec le JWT

// Routes de messagerie AS-Chat
// (authMiddleware sera ajouté devant chaque route lors de l'implémentation du JWT)

router.post('/',                        /* authMiddleware, */ MessageController.send);
router.get('/unread',                   /* authMiddleware, */ MessageController.getUnreadCount);
router.get('/:userId',                  /* authMiddleware, */ MessageController.getConversation);
router.patch('/read/:senderId',         /* authMiddleware, */ MessageController.markAsRead);
router.delete('/:messageId',            /* authMiddleware, */ MessageController.delete);

module.exports = router;
