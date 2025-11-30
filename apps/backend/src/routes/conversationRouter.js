"use strict";

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const conversationController = require('../controllers/conversationController');
const messageController = require('../controllers/messageController');

// All conversation routes require authentication
router.use(authenticate);

// Conversations
router.get('/', conversationController.listConversations);
router.post('/', conversationController.createConversation);
router.get('/:id', conversationController.getConversation);

// Messages under a conversation
router.get('/:id/messages', messageController.listMessages);
router.post('/:id/messages', messageController.postMessage);

module.exports = router;