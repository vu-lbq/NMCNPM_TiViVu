"use strict";

const { Message, Conversation } = require('../models');

exports.listMessages = async (req, res, next) => {
  try {
    const convo = await Conversation.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    const items = await Message.findAll({ where: { conversationId: convo.id }, order: [['createdAt', 'ASC']] });
    res.json({ messages: items });
  } catch (err) { next(err); }
};

exports.postMessage = async (req, res, next) => {
  try {
    const convo = await Conversation.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    const { content } = req.body || {};
    if (!content) return res.status(400).json({ message: 'content is required' });
    const userMsg = await Message.create({ role: 'user', content, conversationId: convo.id, userId: req.user.id });
    // Stub assistant reply. Replace with AI integration later.
    const assistantMsg = await Message.create({ role: 'assistant', content: 'This is a stubbed assistant reply.', conversationId: convo.id, userId: req.user.id });
    res.status(201).json({ userMessage: userMsg, assistantMessage: assistantMsg });
  } catch (err) { next(err); }
};
