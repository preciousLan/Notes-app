const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.get('/me', authController.protect, userController.getUserById );
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;
