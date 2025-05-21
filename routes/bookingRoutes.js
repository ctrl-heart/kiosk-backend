const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Create booking
router.post("/", bookingController.createBooking);

// Get all bookings (Admin)
router.get("/", bookingController.getAllBookings);

// Get booking by ID
// router.get("/:id", bookingController.getBookingById);

// Delete booking
router.delete("/:id", bookingController.deleteBooking);

router.post("/user", bookingController.getBookingByUserAndEvent);

router.get("/user/events/:user_id", bookingController.getBookingsByUserId);

module.exports = router;
