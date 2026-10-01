const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

const signup = asyncHandler(async (req, res) => {
  const session = await authService.signup(req.body);
  res.status(201).json({ message: 'Account created successfully', ...session });
});

const login = asyncHandler(async (req, res) => {
  const session = await authService.login(req.body);
  res.json({ message: 'Login successful', ...session });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({ data: user });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  res.json({ message: 'Password updated successfully' });
});

module.exports = { signup, login, me, changePassword };
