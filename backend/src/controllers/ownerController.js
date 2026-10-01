const asyncHandler = require('../utils/asyncHandler');
const ownerService = require('../services/ownerService');

const getDashboard = asyncHandler(async (req, res) => {
  res.json({ data: await ownerService.getDashboard(req.user.id, req.query) });
});

module.exports = { getDashboard };
