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

router.put("/admin/update-name", authenticate, authController.updateAdminName);

// admin change password
router.put("/change-password", authenticate, authController.changePassword);

router.get("/user/:user_id", authController.getUserById);

// GET /users/:user_id/points
router.get("/users/:user_id/points", authController.getUserPoints);

// New route for redeem info
router.get("/users/:user_id/redeem", authController.getUserRedeemInfo);

module.exports = router;
