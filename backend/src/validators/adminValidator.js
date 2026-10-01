const { sanitize, toError } = require('./validate');
const { nameError, emailError, addressError, passwordError, roleError } = require('./rules');

const validateCreateUser = (req, res, next) => {
  const body = sanitize(req.body, ['name', 'email', 'password', 'address', 'role']);
  const error = toError({
    name: nameError(body.name),
    email: emailError(body.email),
    password: passwordError(body.password),
    address: addressError(body.address),
    role: roleError(body.role),
  });
  if (error) return next(error);
  req.body = body;
  return next();
};

const validateCreateStore = (req, res, next) => {
  const body = sanitize(req.body, ['name', 'email', 'address']);
  let ownerId = req.body ? req.body.ownerId : undefined;
  if (ownerId === '' || ownerId === undefined) ownerId = null;
  if (typeof ownerId === 'string' && /^\d+$/.test(ownerId)) ownerId = Number(ownerId);

  const error = toError({
    name: nameError(body.name),
    email: emailError(body.email),
    address: addressError(body.address),
    ownerId: ownerId === null || (Number.isInteger(ownerId) && ownerId > 0) ? null : 'Owner is invalid',
  });
  if (error) return next(error);
  req.body = { ...body, ownerId };
  return next();
};

module.exports = { validateCreateUser, validateCreateStore };
