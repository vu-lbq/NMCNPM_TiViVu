'use strict';

const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { signResetToken, verifyResetToken } = require('../utils/resetToken');
const { sendForgotPasswordMail } = require('../services/mailService');

const passwordController = {};

passwordController.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    // DB uses username (stores the user's email); there's no email column
    const user = await User.findOne({ where: { username: email } });
    if (!user) {
      // Avoid user enumeration: respond with success regardless
      return res.status(200).json({ ok: true });
    }
    const token = signResetToken(email);
    const host = req.get('host');
    const resetLink = `${req.protocol}://${host}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    await sendForgotPasswordMail({
      toEmail: email,
      toName: user.displayName || email,
      host,
      resetLink
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ error: 'Failed to send reset email', detail: String(err.message || err) });
  }
};

passwordController.showReset = (req, res) => {
  const { token, email } = req.query || {};
  const payload = token ? verifyResetToken(token) : null;
  if (!payload || payload.email !== email) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  return res.status(200).json({ ok: true });
};

passwordController.resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body || {};
    if (!token || !email || !password) {
      return res.status(400).json({ error: 'Token, email, and password are required' });
    }
    const payload = verifyResetToken(token);
    if (!payload || payload.email !== email) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    // Lookup by username since there's no email column
    const user = await User.findOne({ where: { username: email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    // Update correct column: passwordHash
    await User.update({ passwordHash: hashed }, { where: { id: user.id } });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ error: 'Failed to reset password', detail: String(err.message || err) });
  }
};

module.exports = passwordController;