'use strict';

const jwt = require('jsonwebtoken');

const DEFAULT_EXPIRY = '30m';

function getSecret() {
  const secret = process.env.RESET_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('RESET_JWT_SECRET/JWT_SECRET is not configured');
  return secret;
}

function signResetToken(email) {
  const secret = getSecret();
  return jwt.sign({ email, type: 'password-reset' }, secret, { expiresIn: process.env.RESET_JWT_EXPIRES || DEFAULT_EXPIRY });
}

function verifyResetToken(token) {
  const secret = getSecret();
  try {
    const payload = jwt.verify(token, secret);
    if (payload.type !== 'password-reset') return null;
    return payload;
  } catch (_) {
    return null;
  }
}

module.exports = { signResetToken, verifyResetToken };
