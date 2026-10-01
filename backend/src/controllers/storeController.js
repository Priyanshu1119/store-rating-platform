const asyncHandler = require('../utils/asyncHandler');
const storeService = require('../services/storeService');
const { parseId } = require('../utils/query');

const listStores = asyncHandler(async (req, res) => {
  res.json(await storeService.listStores(req.user.id, req.query));
});

const getStore = asyncHandler(async (req, res) => {
  const storeId = parseId(req.params.id, 'store id');
  res.json({ data: await storeService.getStoreById(req.user.id, storeId) });
});

module.exports = { listStores, getStore };
