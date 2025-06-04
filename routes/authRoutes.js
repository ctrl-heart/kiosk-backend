const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");
const authenticate = require("../middlewares/authenticate"); // Middleware import



// Normal user signup
router.post("/signup", authController.userSignup);

// Admin signup
router.post("/admin-signup", authController.adminSignup);

// Login
router.post("/login", authController.loginUser);

// Update user name
router.put("/update-name",authenticate, authController.updateUserName);

// Update admin name
router.put("/admin/update-name", authenticate, authController.updateAdminName);

// admin change password
router.put("/change-password", authenticate, authController.changePassword);

// Normal user change password route
router.put('/user/change-password', authenticate, authController.changeUserPassword);


// router.get("/user/:user_id", authController.getUserById);

module.exports = router;
