// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

// GET all events
router.get("/events", eventController.getAllEvents);

// GET event by ID
router.get("/events/:id", eventController.getEventById);

// PUT update an event (Admin only)
router.put("/events/:id", eventController.updateEvent);

router.delete("/events/:id", eventController.deleteEvent);

router.get("/attendees", eventController.getEventAttendees);

// POST create a new event (Admin only)
router.post("/events", eventController.createEvent);

module.exports = router;
