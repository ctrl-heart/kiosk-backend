const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const authenticate = require('../middlewares/authenticate'); // Middleware import



// Normal user signup
router.post('/signup', authController.userSignup);

// Admin signup
router.post('/admin-signup', authController.adminSignup);

// Login
router.post('/login', authController.loginUser);

// Update user name
router.put('/update-name', authenticate, authController.updateUserName);

router.put('/admin/update-name', authenticate, authController.updateAdminName);



module.exports = router;
