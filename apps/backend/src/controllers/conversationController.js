"use strict";

const { Conversation } = require('../models');
const { Message } = require('../models');

exports.listConversations = async (req, res, next) => {
  try {
    const items = await Conversation.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json({ conversations: items });
  } catch (err) { next(err); }
};

exports.getConversation = async (req, res, next) => {
  try {
    const convo = await Conversation.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    res.json({ conversation: convo });
  } catch (err) { next(err); }
};

exports.createConversation = async (req, res, next) => {
  try {
    const { title } = req.body || {};
    const convo = await Conversation.create({ title: title || 'New Conversation', status: 'active', userId: req.user.id });
    res.status(201).json({ conversation: convo });
  } catch (err) { next(err); }
};

exports.deleteConversation = async (req, res, next) => {
  try {
    const convo = await Conversation.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });
    // Delete messages first to avoid orphan records
    await Message.destroy({ where: { conversationId: convo.id } });
    await convo.destroy();
    res.status(204).end();
  } catch (err) { next(err); }
};
