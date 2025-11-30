"use strict";

const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const payload = jwt.verify(token, secret);
    const user = await User.findByPk(payload.sub, { attributes: ['id', 'username', 'displayName'] });
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = { id: user.id, username: user.username, displayName: user.displayName };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};