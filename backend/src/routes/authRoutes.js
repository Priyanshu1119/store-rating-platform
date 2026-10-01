const express = require('express');
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateSignup, validateLogin, validateChangePassword } = require('../validators/authValidator');

const router = express.Router();

router.post('/signup', validateSignup, controller.signup);
router.post('/login', validateLogin, controller.login);
router.get('/me', authenticate, controller.me);
router.patch('/password', authenticate, validateChangePassword, controller.changePassword);

module.exports = router;
