"use strict";

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

function signToken(user) { // Helper to sign JWT token
  const payload = { sub: user.id, email: user.username }; // payload chua thong tin user
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me'; // secret key
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h'; // token expiration
  return jwt.sign(payload, secret, { expiresIn }); // tra ve token
}

exports.postRegister = async (req, res, next) => {
  try {
    // Dang ky nguoi dung moi
    const { email, password, displayName } = req.body || {}; // lay thong tin tu body
    const username = (email || '').trim(); // su dung email lam username
    if (!username || !password) { // kiem tra thong tin
      return res.status(400).json({ message: 'Email and password are required' }); // tra ve loi neu thieu thong tin
    }
    const existing = await User.findOne({ where: { username } }); // kiem tra xem email da ton tai chua
    if (existing) {
      // Neu ton tai, tra ve loi 409 Conflict
      return res.status(409).json({ message: 'Email already exists' });
    }
    // Tao nguoi dung moi, ma hoa mat khau
    const passwordHash = await bcrypt.hash(password, 10);
    // Luu nguoi dung vao database
    const user = await User.create({ username, passwordHash, displayName, role: 'user' });
    const token = signToken(user); // tao token cho nguoi dung moi
    return res.status(201).json({ message: 'Registered', token, accessToken: token, user: { id: user.id, email: user.username, displayName: user.displayName, role: user.role } }); // tra ve token va thong tin nguoi dung
  } catch (err) {
    next(err);
  }
};
// POST /login - xac thuc nguoi dung va tra ve JWT token
exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const username = (email || '').trim();
    if (!username || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) { // neu khong tim thay nguoi dung, tra ve loi 401 Unauthorized
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Kiem tra mat khau, so sanh voi hash luu trong database
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) { // neu mat khau sai, tra ve loi 401 Unauthorized
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Dang nhap thanh cong, tao va tra ve token
    const token = signToken(user);
    // Tra ve token va thong tin nguoi dung
    return res.status(200).json({ message: 'Login successful', token, accessToken: token, user: { id: user.id, email: user.username, displayName: user.displayName, role: user.role } });
  } catch (err) {
    next(err);
  }
};
// GET /me - tra ve thong tin nguoi dung hien tai, duoc xac thuc qua middleware
exports.getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  return res.status(200).json({ user: req.user });
};