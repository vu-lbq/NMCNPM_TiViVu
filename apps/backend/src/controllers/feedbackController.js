'use strict';

const { Feedback } = require('../models');

exports.create = async (req, res) => {
  try {
    const { message, email } = req.body || {};
    if (!message || String(message).trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters' });
    }
    const payload = {
      message: String(message).trim(),
    };
    if (req.user) {
      payload.userId = req.user.id;
      payload.email = req.user.email || req.user.username || email || null;
    } else if (email) {
      payload.email = String(email).trim();
    }
    const created = await Feedback.create(payload);
    return res.status(201).json({ ok: true, id: created.id });
  } catch (err) {
    console.error('feedback create error:', err);
    return res.status(500).json({ error: 'Failed to submit feedback' });
  }
};
