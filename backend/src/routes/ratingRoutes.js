const express = require('express');
const controller = require('../controllers/ratingController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateRating } = require('../validators/ratingValidator');

// Mounted at /api/stores, so the full paths are /api/stores/:storeId/rating
const router = express.Router();

router.post('/:storeId/rating', authenticate, authorize('USER'), validateRating, controller.createRating);
router.put('/:storeId/rating', authenticate, authorize('USER'), validateRating, controller.updateRating);

module.exports = router;
