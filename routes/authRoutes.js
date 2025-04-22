const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

// Normal user signup
router.post('/signup', authController.userSignup);

// Admin signup
router.post('/admin-signup', authController.adminSignup);

// Login
router.post('/login', authController.loginUser);

module.exports = router;
