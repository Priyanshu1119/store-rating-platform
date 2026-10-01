const { query } = require('../config/db');
const AppError = require('../utils/AppError');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

const toUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  address: row.address,
  role: row.role,
  createdAt: row.created_at,
});

const buildSession = (row) => ({
  token: signToken({ userId: row.id, role: row.role }),
  user: toUser(row),
});

// Public signup always creates a normal USER. Admins and owners are created by an admin.
const signup = async ({ name, email, password, address }) => {
  const hash = await hashPassword(password);
  const { rows } = await query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, 'USER')
     RETURNING id, name, email, address, role, created_at`,
    [name, email, hash, address]
  );
  return buildSession(rows[0]);
};

const login = async ({ email, password }) => {
  const { rows } = await query(
    'SELECT id, name, email, address, role, password, created_at FROM users WHERE email = $1',
    [email]
  );
  // Same message for unknown email and wrong password so accounts cannot be probed.
  const invalid = new AppError(401, 'Invalid email or password');
  if (rows.length === 0) throw invalid;
  const matches = await comparePassword(password, rows[0].password);
  if (!matches) throw invalid;
  return buildSession(rows[0]);
};

const getProfile = async (userId) => {
  const { rows } = await query(
    'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
    [userId]
  );
  if (rows.length === 0) throw new AppError(404, 'User not found');
  return toUser(rows[0]);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const { rows } = await query('SELECT password FROM users WHERE id = $1', [userId]);
  if (rows.length === 0) throw new AppError(404, 'User not found');

  const matches = await comparePassword(currentPassword, rows[0].password);
  if (!matches) {
    throw new AppError(400, 'Validation failed', { currentPassword: 'Current password is incorrect' });
  }

  const hash = await hashPassword(newPassword);
  await query('UPDATE users SET password = $1 WHERE id = $2', [hash, userId]);
};

module.exports = { toUser, signup, login, getProfile, changePassword };
