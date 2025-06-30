// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const multer = require("multer");
const path = require("path");

// / Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET all events
router.get("/events", eventController.getAllEvents);

router.get("/events/latest", eventController.getLatestEvent);


// GET event by ID
router.get("/events/:id", eventController.getEventById);

// PUT update an event (Admin only)
router.put("/events/:id", upload.single("image"), eventController.updateEvent);

router.delete("/events/:id", eventController.deleteEvent);

router.get("/attendees", eventController.getEventAttendees);

// POST create a new event (Admin only)
router.post("/events", upload.single("image"), eventController.createEvent);

module.exports = router;
