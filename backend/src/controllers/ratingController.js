const asyncHandler = require('../utils/asyncHandler');
const ratingService = require('../services/ratingService');
const { parseId } = require('../utils/query');

const createRating = asyncHandler(async (req, res) => {
  const storeId = parseId(req.params.storeId, 'store id');
  const store = await ratingService.createRating(req.user.id, storeId, req.body.rating);
  res.status(201).json({ message: 'Rating submitted', data: store });
});

const updateRating = asyncHandler(async (req, res) => {
  const storeId = parseId(req.params.storeId, 'store id');
  const store = await ratingService.updateRating(req.user.id, storeId, req.body.rating);
  res.json({ message: 'Rating updated', data: store });
});

module.exports = { createRating, updateRating };
