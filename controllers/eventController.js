// controllers/eventController.js
const Event = require('../models/eventModel');

const getAllEvents = async (req, res) => {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;
  
    try {
      const events = await Event.getAllEvents(skip, limit);
      const total = await Event.getTotalEventsCount();
  
      res.status(200).json({
        success: true,
        results: events,
        total,
        skip,
        limit
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server Error'
      });
    }
  };

  const getEventById = async (req, res) => {
    try {
      const event = await Event.getEventById(req.params.id);
      if (event) {
        res.status(200).json(event);
      } else {
        res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || 'Server Error'
      });
    }
  };
  
  

// const getEventById = async (req, res) => {
//     try {
//         const event = await Event.getEventById(req.params.id);
//         if (event) {
//             res.status(200).json(event);
//         } else {
//             res.status(404).json({ error: 'Event not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ error: 'Something went wrong!' });
//     }
// };


module.exports = { getAllEvents, getEventById };