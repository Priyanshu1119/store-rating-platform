// Single-field rules. Each returns an error message, or null when the value is valid.
// The frontend has a matching copy in frontend/src/utils/validators.js.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/;
const ROLES = ['ADMIN', 'USER', 'OWNER'];

const nameError = (value) => {
  if (typeof value !== 'string' || value.length === 0) return 'Name is required';
  if (value.length < 20) return 'Name must be at least 20 characters';
  if (value.length > 60) return 'Name must be at most 60 characters';
  return null;
};

const emailError = (value) => {
  if (typeof value !== 'string' || value.length === 0) return 'Email is required';
  if (value.length > 255 || !EMAIL_REGEX.test(value)) return 'Enter a valid email address';
  return null;
};

const addressError = (value) => {
  if (typeof value !== 'string' || value.length === 0) return 'Address is required';
  if (value.length > 400) return 'Address must be at most 400 characters';
  return null;
};

const passwordError = (value) => {
  if (typeof value !== 'string' || value.length === 0) return 'Password is required';
  if (value.length < 8 || value.length > 16) return 'Password must be 8 to 16 characters';
  if (!PASSWORD_REGEX.test(value)) {
    return 'Password needs at least one uppercase letter and one special character';
  }
  return null;
};

const roleError = (value) => (ROLES.includes(value) ? null : 'Role must be ADMIN, USER or OWNER');

const ratingError = (value) =>
  Number.isInteger(value) && value >= 1 && value <= 5 ? null : 'Rating must be a whole number from 1 to 5';

module.exports = {
  ROLES,
  nameError,
  emailError,
  addressError,
  passwordError,
  roleError,
  ratingError,
};
