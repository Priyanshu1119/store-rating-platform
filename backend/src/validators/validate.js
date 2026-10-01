const AppError = require('../utils/AppError');

// Trims text fields and lowercases the email. Passwords are never trimmed.
const sanitize = (body = {}, fields) => {
  const clean = {};
  for (const field of fields) {
    let value = body[field];
    if (typeof value === 'string' && !/password/i.test(field)) value = value.trim();
    if (field === 'email' && typeof value === 'string') value = value.toLowerCase();
    clean[field] = value;
  }
  return clean;
};

// Turns { field: message | null } into a 400 error when at least one message exists.
const toError = (checks) => {
  const errors = {};
  for (const [field, message] of Object.entries(checks)) {
    if (message) errors[field] = message;
  }
  return Object.keys(errors).length ? new AppError(400, 'Validation failed', errors) : null;
};

module.exports = { sanitize, toError };
