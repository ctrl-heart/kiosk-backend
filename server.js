const express = require("express");
require('dotenv').config();
const cors = require("cors");
const bodyParser = require('body-parser'); // for Stripe
const Stripe = require('stripe');


const app = express();
const port = 5000;
// Stripe setup
const stripe =require('stripe')(process.env.STRIPE_SECRET_KEY);

// Import auth routes only
const authRoutes = require("./routes/authRoutes"); // Signup/Login routes
const searchRoutes = require("./routes/searchRoutes"); // Events Search + Filter route
const eventsRoutes = require("./routes/eventsRoutes"); // Add events routes
const categoryRoutes = require("./routes/categoryRoutes");
const bookingRoutes = require('./routes/bookingRoutes');
const guestRoutes = require('./routes/guestRoutes');
const qrRoutes = require('./routes/qrRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); // for Stripe

// Auth Routes
app.use("/api", authRoutes);
app.use("/api", searchRoutes);
app.use("/api", eventsRoutes); // Add events routes
app.use("/api", categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/guest-booking', guestRoutes);
app.use('/api', qrRoutes);



// Stripe payment intent route
app.post('/api/payments/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  if (!amount || !currency) {
    return res.status(400).json({ success: false, message: 'Amount or currency missing' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.status(200).json({
      success: true,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// General error handling middleware for server errors
app.use((error, req, res, next) => {
  console.error("Error:", error); // Error ko console pe print karna
  res.status(500).json({
    success: false,
    message: error.message || "Server Error",
  });
});
// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Auth-only server running at http://192.168.18.10:5000`);
});

