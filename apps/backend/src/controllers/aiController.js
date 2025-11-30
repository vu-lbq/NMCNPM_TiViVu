"use strict";

const { simplePrompt } = require('../services/aiService');

exports.test = async (req, res) => {
  try {
    const reply = await simplePrompt("Say 'pong' in one short sentence.");
    res.status(200).json({ ok: true, reply });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
