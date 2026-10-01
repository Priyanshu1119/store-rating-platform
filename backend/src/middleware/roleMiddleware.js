const AppError = require('../utils/AppError');

// Usage: authorize('ADMIN') or authorize('USER', 'ADMIN'). Must run after authenticate.
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to access this resource'));
    }
    return next();
  };

module.exports = { authorize };
