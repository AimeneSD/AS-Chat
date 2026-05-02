const express = require('express');
const router = express.Router();
const FriendController = require('../controllers/FriendController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes des relations amicales AS-Chat (toutes protégées par JWT)
// (routes statiques déclarées AVANT les routes dynamiques :id)
router.get('/',                       authMiddleware, FriendController.getFriends);
router.get('/pending',                authMiddleware, FriendController.getPendingRequests);
router.get('/relationship/:userId',   authMiddleware, FriendController.getRelationship);
router.post('/request/:addresseeId',  authMiddleware, FriendController.sendRequest);
router.patch('/accept/:requesterId',  authMiddleware, FriendController.acceptRequest);
router.post('/block/:userId',         authMiddleware, FriendController.block);
router.delete('/:userId',             authMiddleware, FriendController.declineOrRemove);

module.exports = router;
