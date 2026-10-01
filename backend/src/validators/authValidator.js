const AppError = require('../utils/AppError');
const { sanitize, toError } = require('./validate');
const { nameError, emailError, addressError, passwordError } = require('./rules');

const validateSignup = (req, res, next) => {
  const body = sanitize(req.body, ['name', 'email', 'password', 'address']);
  const error = toError({
    name: nameError(body.name),
    email: emailError(body.email),
    password: passwordError(body.password),
    address: addressError(body.address),
  });
  if (error) return next(error);
  req.body = body;
  return next();
};

const validateLogin = (req, res, next) => {
  const body = sanitize(req.body, ['email', 'password']);
  const error = toError({
    email: emailError(body.email),
    password: typeof body.password === 'string' && body.password ? null : 'Password is required',
  });
  if (error) return next(error);
  req.body = body;
  return next();
};

const validateChangePassword = (req, res, next) => {
  const body = sanitize(req.body, ['currentPassword', 'newPassword']);
  const error = toError({
    currentPassword:
      typeof body.currentPassword === 'string' && body.currentPassword ? null : 'Current password is required',
    newPassword: passwordError(body.newPassword),
  });
  if (error) return next(error);
  if (body.currentPassword === body.newPassword) {
    return next(
      new AppError(400, 'Validation failed', { newPassword: 'New password must be different from the current one' })
    );
  }
  req.body = body;
  return next();
};

module.exports = { validateSignup, validateLogin, validateChangePassword };
