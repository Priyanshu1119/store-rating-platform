const { query } = require('../config/db');
const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the Bearer token, then loads the user so a deleted user or a changed role takes effect immediately.
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError(401, 'Authentication required');

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw new AppError(401, 'Invalid or expired token');
  }

  const { rows } = await query('SELECT id, role FROM users WHERE id = $1', [payload.userId]);
  if (rows.length === 0) throw new AppError(401, 'User no longer exists');

  req.user = { id: rows[0].id, role: rows[0].role };
  next();
});

module.exports = { authenticate };
