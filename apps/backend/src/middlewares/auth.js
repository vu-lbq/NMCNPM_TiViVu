"use strict";

const jwt = require('jsonwebtoken');
const { User } = require('../models');
// Middleware để xác thực người dùng qua JWT
exports.authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const auth = req.headers.authorization || '';
    // Kiểm tra và trích xuất token nếu có định dạng "Bearer <token>"
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    // Nếu không có token, trả về lỗi 401 Unauthorized
    if (!token) return res.status(401).json({ message: 'Missing token' });
    // Xác minh token và lấy thông tin người dùng
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    // payload chua thong tin user
    const payload = jwt.verify(token, secret);
    // Tìm người dùng trong cơ sở dữ liệu
    const user = await User.findByPk(payload.sub, { attributes: ['id', 'username', 'displayName', 'role'] });
    // Nếu không tìm thấy người dùng, trả về lỗi 401 Unauthorized
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    // Gán thông tin người dùng vào req.user để sử dụng trong các middleware và route sau
    req.user = { id: user.id, username: user.username, displayName: user.displayName, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};
// Middleware để đảm bảo người dùng là admin
// Nếu không phải admin, trả về lỗi 403 Forbidden
exports.ensureAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};