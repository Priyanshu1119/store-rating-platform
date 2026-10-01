const express = require('express');
const controller = require('../controllers/ownerController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate, authorize('OWNER'));

router.get('/dashboard', controller.getDashboard);

module.exports = router;
