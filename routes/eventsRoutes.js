// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// GET all events
router.get('/events', eventController.getAllEvents);

// GET event by ID
router.get('/events/:id', eventController.getEventById);

module.exports = router;