const express = require('express');
const controller = require('../controllers/storeController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', controller.listStores);
router.get('/:id', controller.getStore);

module.exports = router;
