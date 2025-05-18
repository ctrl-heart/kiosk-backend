const express = require("express");
const router = express.Router();
const eventController = require("../controllers/searchController");

// Search and Filter Events Route
router.get("/events/search", eventController.searchEvents);

// Filtering route
router.get("/events/filter", eventController.filterEvents);

module.exports = router;
