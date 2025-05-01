const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

exports.userSignup = async (req, res) => {
  const { name, email, password } = req.body;
  
  // Step 1: Check password length
  if (password.length > 16) {
    return res.status(400).json({
      success: false,
      message: 'Password should not exceed 16 characters.'
    });
  }

  // Step 2: Validate password strength (min 8 chars + uppercase + lowercase + number + special char)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be 8-16 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
    });
  }

  try {
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.createUser({ name, email, password: hashedPassword, role: 'user' });

    const token = jwt.sign(
      { user_id: newUser.user_id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

// Admin Signup
exports.adminSignup = async (req, res) => {
  const { name, email, password } = req.body;

  // Step 1: Check password length
  if (password.length > 16) {
    return res.status(400).json({
      success: false,
      message: 'Password should not exceed 16 characters.'
    });
  }

  // Step 2: Validate password strength (min 8 chars + uppercase + lowercase + number + special char)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be 8-16 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
    });
  }

  try {
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await userModel.createUser({ name, email, password: hashedPassword, role: 'admin' });

    const token = jwt.sign(
      { user_id: newAdmin.user_id, email: newAdmin.email, role: newAdmin.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};


// User Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

