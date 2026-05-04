const express = require('express');
const router = express.Router();
const FriendController = require('../controllers/FriendController');

// Routes des relations amicales AS-Chat (toutes protégées par JWT)
// (routes statiques déclarées AVANT les routes dynamiques :id)
router.get('/', FriendController.getFriends);
router.get('/pending', FriendController.getPendingRequests);
router.get('/relationship/:userId', FriendController.getRelationship);
router.post('/request-by-username', FriendController.sendRequestByUsername);
router.post('/request/:addresseeId', FriendController.sendRequest);
router.patch('/accept/:requesterId', FriendController.acceptRequest);
router.post('/block/:userId', FriendController.block);
router.delete('/:userId', FriendController.declineOrRemove);

module.exports = router;
