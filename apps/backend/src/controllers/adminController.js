'use strict';

const { Op } = require('sequelize');
const { User, Feedback, Conversation, Message, Vocabulary } = require('../models');

exports.stats = async (_req, res) => {
  try {
    const now = new Date();
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [users, usersActive, conversations, messages, vocab, feedbacks] = await Promise.all([
      User.count(),
      User.count({ where: { updatedAt: { [Op.gte]: since } } }),
      Conversation.count(),
      Message.count(),
      Vocabulary ? Vocabulary.count() : Promise.resolve(0),
      Feedback.count()
    ]);
    res.json({ users, usersActive7d: usersActive, conversations, messages, vocabulary: vocab, feedbacks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
};

exports.listUsers = async (_req, res) => {
  const items = await User.findAll({ attributes: ['id', 'username', 'displayName', 'role', 'createdAt'] });
  res.json({ users: items });
};

exports.createUser = async (req, res) => {
  const { username, password, displayName, role = 'user' } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const bcrypt = require('bcryptjs');
  const exists = await User.findOne({ where: { username } });
  if (exists) return res.status(409).json({ error: 'User exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const created = await User.create({ username, passwordHash, displayName, role: role === 'admin' ? 'admin' : 'user' });
  res.status(201).json({ id: created.id });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.destroy({ where: { id } });
  res.status(204).end();
};

exports.toggleRole = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  user.role = user.role === 'admin' ? 'user' : 'admin';
  await user.save();
  res.json({ id: user.id, role: user.role });
};

exports.listFeedback = async (_req, res) => {
  const items = await Feedback.findAll({ order: [['createdAt', 'DESC']] });
  res.json({ feedback: items });
};

exports.deleteFeedback = async (req, res) => {
  const { id } = req.params;
  await Feedback.destroy({ where: { id } });
  res.status(204).end();
};
