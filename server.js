const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Import auth routes only
const authRoutes = require('./routes/authRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Auth Routes
app.use('/api', authRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Auth-only server running at http://localhost:${port}`);
});
