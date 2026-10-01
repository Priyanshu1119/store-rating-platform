const { query } = require('../config/db');
const AppError = require('../utils/AppError');
const storeService = require('./storeService');

const assertStoreExists = async (storeId) => {
  const { rows } = await query('SELECT id FROM stores WHERE id = $1', [storeId]);
  if (rows.length === 0) throw new AppError(404, 'Store not found');
};

// A duplicate (user_id, store_id) is rejected by the UNIQUE constraint and mapped to 409 in errorMiddleware.
const createRating = async (userId, storeId, rating) => {
  await assertStoreExists(storeId);
  await query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [userId, storeId, rating]);
  return storeService.getStoreById(userId, storeId);
};

const updateRating = async (userId, storeId, rating) => {
  await assertStoreExists(storeId);
  const { rowCount } = await query('UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3', [
    rating,
    userId,
    storeId,
  ]);
  if (rowCount === 0) throw new AppError(404, 'You have not rated this store yet');
  return storeService.getStoreById(userId, storeId);
};

module.exports = { createRating, updateRating };
