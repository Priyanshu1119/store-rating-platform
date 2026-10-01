// Same rules as backend/src/validators/rules.js. Each function returns an error message or '' when valid.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/;

export const nameError = (value) => {
  const v = (value || '').trim();
  if (!v) return 'Name is required';
  if (v.length < 20) return 'Name must be at least 20 characters';
  if (v.length > 60) return 'Name must be at most 60 characters';
  return '';
};

export const emailError = (value) => {
  const v = (value || '').trim();
  if (!v) return 'Email is required';
  if (v.length > 255 || !EMAIL_REGEX.test(v)) return 'Enter a valid email address';
  return '';
};

export const addressError = (value) => {
  const v = (value || '').trim();
  if (!v) return 'Address is required';
  if (v.length > 400) return 'Address must be at most 400 characters';
  return '';
};

export const passwordError = (value) => {
  const v = value || '';
  if (!v) return 'Password is required';
  if (v.length < 8 || v.length > 16) return 'Password must be 8 to 16 characters';
  if (!PASSWORD_REGEX.test(v)) return 'Password needs at least one uppercase letter and one special character';
  return '';
};

export const ratingError = (value) =>
  Number.isInteger(value) && value >= 1 && value <= 5 ? '' : 'Choose a rating from 1 to 5';

// Removes empty messages so `Object.keys(errors).length === 0` means the form is valid.
export const compact = (errors) =>
  Object.fromEntries(Object.entries(errors).filter(([, message]) => Boolean(message)));
