const AppError = require('../utils/AppError');

// PostgreSQL unique constraint names (defined in database/schema.sql) mapped to readable messages.
const UNIQUE_MESSAGES = {
  users_email_key: 'This email is already registered',
  stores_email_key: 'A store with this email already exists',
  stores_owner_id_key: 'This owner already has a store',
  ratings_user_id_store_id_key: 'You have already rated this store',
};

const notFound = (req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;
  let errors = err.errors;

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body is not valid JSON';
  } else if (err.code === '23505') {
    statusCode = 409;
    message = UNIQUE_MESSAGES[err.constraint] || 'This record already exists';
    if (err.constraint === 'users_email_key' || err.constraint === 'stores_email_key') {
      errors = { email: message };
    }
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'A referenced record does not exist';
  } else if (err.code === '23514' || err.code === '22001' || err.code === '22003') {
    statusCode = 400;
    message = 'A submitted value is not allowed';
  } else if (!err.isOperational) {
    statusCode = 500;
    console.error(err);
    message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  }

  res.status(statusCode).json({ message, ...(errors ? { errors } : {}) });
};

module.exports = { notFound, errorHandler };
