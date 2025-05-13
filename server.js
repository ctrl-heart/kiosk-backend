const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Import auth routes only
const authRoutes = require('./routes/authRoutes');  // Signup/Login routes
const searchRoutes = require('./routes/searchRoutes');  // Events Search + Filter route
const eventsRoutes = require('./routes/eventsRoutes'); // Add events routes



// Middleware
app.use(cors());
app.use(express.json());

// Auth Routes
app.use('/api', authRoutes);
app.use('/api', searchRoutes);
app.use('/api', eventsRoutes); // Add events routes

// General error handling middleware for server errors
app.use((error, req, res, next) => {
  console.error("Error:", error);  // Error ko console pe print karna
  res.status(500).json({
    success: false,
    message: error.message || 'Server Error'
  });
});
// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});



// Start Server
app.listen(port, () => {
  console.log(`Auth-only server running at http://localhost:${port}`);
});
