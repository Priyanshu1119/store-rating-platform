const jwt = require('jsonwebtoken');

// Payload only holds the user id and role. Never put the password (or hash) in a token.
const signToken = ({ userId, role }) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { signToken, verifyToken };
