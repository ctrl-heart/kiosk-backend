const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// Normal User Signup
exports.userSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = jwt.sign(
      { user_id: newUser.user_id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Signup
exports.adminSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    const token = jwt.sign(
      { user_id: newAdmin.user_id, email: newAdmin.email, role: newAdmin.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// User Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "30d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// normal user name change

exports.updateUserName = async (req, res) => {
  const { name } = req.body;
  const user_id = req.user.user_id;

  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  }

  try {
    const updatedUser = await userModel.updateUserName(user_id, name);
    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: "Name updated successfully",
      user: {
        user_id: updatedUser.user_id,
        name: updatedUser.name,
        email: updatedUser.email,
        created_at: updatedUser.created_at,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// admin name change
exports.updateAdminName = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.user_id;

  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  }

  try {
    const updatedUser = await userModel.updateUserNameById(userId, name);
    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: "Name updated successfully",
      user: {
        user_id: updatedUser.user_id,
        name: updatedUser.name,
        email: updatedUser.email,
        created_at: updatedUser.created_at,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get User Details by ID
exports.getUserById = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const user = await userModel.getUserById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// update adminpassword

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.user_id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
  }

  try {
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updateUserPassword(userId, hashedPassword);

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// getuserpoints
exports.getUserPoints = async (req, res) => {
  const { user_id } = req.params;

  try {
    const user = await userModel.getUserPoints(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user_id,
      points: user.points !== null ? user.points : null, // Don't convert null to 0
    });
  } catch (error) {
    console.error("Error fetching user points:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// GET USER REDEEM INFO
exports.getUserRedeemInfo = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await userModel.getUserRedeemInfo(user_id);
    if (!result) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user_id,
      discount_percent: result.discount_percent !== null ? result.discount_percent : null,
    });
  } catch (error) {
    console.error("Error fetching redeem info:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};