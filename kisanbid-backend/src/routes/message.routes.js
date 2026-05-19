const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

router.get('/conversations', messageController.getConversations);
router.get('/:conversationId', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.put('/:conversationId/read', messageController.markAsRead);
router.delete('/:id', messageController.deleteMessage);
router.get('/unread/count', messageController.getUnreadCount);

module.exports = router;
