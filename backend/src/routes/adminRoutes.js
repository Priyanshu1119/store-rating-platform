const express = require('express');
const controller = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateCreateUser, validateCreateStore } = require('../validators/adminValidator');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', controller.getDashboard);
router.get('/users', controller.listUsers);
router.post('/users', validateCreateUser, controller.createUser);
router.get('/users/:id', controller.getUser);
router.get('/stores', controller.listStores);
router.post('/stores', validateCreateStore, controller.createStore);
router.get('/owners', controller.listOwners);

module.exports = router;
