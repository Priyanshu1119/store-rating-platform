export const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatRating = (value) => (value === null || value === undefined ? '' : Number(value).toFixed(1));

// Reads the { message, errors } body the API sends for failures.
export const getErrorPayload = (err) => {
  const data = err && err.response && err.response.data;
  if (data && data.message) return { message: data.message, errors: data.errors || {} };
  if (err && err.request) return { message: 'Cannot reach the server. Check your connection and try again.', errors: {} };
  return { message: (err && err.message) || 'Something went wrong', errors: {} };
};
