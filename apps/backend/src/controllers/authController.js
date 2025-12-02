"use strict";

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

function signToken(user) {
  const payload = { sub: user.id, email: user.username };
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  return jwt.sign(payload, secret, { expiresIn });
}

exports.postRegister = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body || {};
    const username = (email || '').trim();
    if (!username || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, displayName });
    const token = signToken(user);
    return res.status(201).json({ message: 'Registered', token, accessToken: token, user: { id: user.id, email: user.username, displayName: user.displayName } });
  } catch (err) {
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const username = (email || '').trim();
    if (!username || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user);
    return res.status(200).json({ message: 'Login successful', token, accessToken: token, user: { id: user.id, email: user.username, displayName: user.displayName } });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  return res.status(200).json({ user: req.user });
};