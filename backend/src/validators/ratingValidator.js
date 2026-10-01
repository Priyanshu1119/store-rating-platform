const { toError } = require('./validate');
const { ratingError } = require('./rules');

const validateRating = (req, res, next) => {
  let rating = req.body ? req.body.rating : undefined;
  if (typeof rating === 'string' && /^\d+$/.test(rating)) rating = Number(rating);

  const error = toError({ rating: ratingError(rating) });
  if (error) return next(error);
  req.body = { rating };
  return next();
};

module.exports = { validateRating };
