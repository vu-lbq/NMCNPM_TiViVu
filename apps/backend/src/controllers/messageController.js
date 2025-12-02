"use strict";

const { Message, Conversation } = require('../models');
const { generateAssistantReply, generateConversationTitle } = require('../services/aiService');

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

    // Generate assistant reply via OpenAI
    let replyText = '';
    try {
      replyText = await generateAssistantReply(convo.id, content);
    } catch (aiErr) {
      // Fall back gracefully if AI call fails
      replyText = 'Sorry, I could not generate a reply right now.';
    }

    const assistantMsg = await Message.create({ role: 'assistant', content: replyText, conversationId: convo.id, userId: req.user.id });

    // Auto-update conversation title if it's generic/empty
    try {
      const currentTitle = convo.title || '';
      const isGeneric = currentTitle.trim() === '' || /^(new\s+chat|new\s+conversation)$/i.test(currentTitle.trim());
      if (isGeneric) {
        const newTitle = await generateConversationTitle(convo.id);
        if (newTitle && newTitle.length > 0) {
          convo.title = newTitle;
          await convo.save();
        }
      }
    } catch (e) {
      // non-fatal if title generation fails
    }

    res.status(201).json({ userMessage: userMsg, assistantMessage: assistantMsg });
  } catch (err) { next(err); }
};
