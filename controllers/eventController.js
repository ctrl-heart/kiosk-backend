// controllers/eventController.js
const Event = require("../models/eventModel");
const pool = require("../database");

const getAllEvents = async (req, res) => {
  const {
    search,
    category_name,
    start_date,
    end_date,
    price_min,
    price_max,
    skip = 0,
    limit = 10,
  } = req.query;

  let query = `
    SELECT 
      e.event_id, 
      e.title, 
      e.description, 
      e.location, 
      e.time, 
      e.capacity, 
      e.price, 
      e.image_url, 
      c.name AS category_name,
      COUNT(b.booking_id) AS registered
    FROM events e
    JOIN categories c ON e.category_id = c.category_id
    LEFT JOIN bookings b ON e.event_id = b.event_id
  `;

  let conditions = [];
  let values = [];

  if (search) {
    conditions.push(
      `(e.title ILIKE $${values.length + 1} OR e.description ILIKE $${
        values.length + 1
      } OR e.location ILIKE $${values.length + 1})`
    );
    values.push(`%${search}%`);
  }

  if (category_name) {
    conditions.push(`c.name ILIKE $${values.length + 1}`);
    values.push(`%${category_name}%`);
  }

  if (start_date && end_date) {
    conditions.push(
      `DATE(e.time) BETWEEN $${values.length + 1} AND $${values.length + 2}`
    );
    values.push(start_date, end_date);
  }

  if (price_min && price_max) {
    conditions.push(
      `e.price BETWEEN $${values.length + 1} AND $${values.length + 2}`
    );
    values.push(price_min, price_max);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` GROUP BY e.event_id, c.name`;

  // Get total (for filtered + grouped data)
  const countQuery = `SELECT COUNT(*) FROM (${query}) AS grouped_events`;
  const totalResult = await pool.query(countQuery, values);
  const total = parseInt(totalResult.rows[0].count);

  // Add pagination
  query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(parseInt(limit), parseInt(skip));

  try {
    const result = await pool.query(query, values);
    res.status(200).json({
      success: true,
      results: result.rows,
      total,
      skip: parseInt(skip),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "Server Error" });
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
        message: "Event not found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event_id = req.params.id;
    const eventData = req.body;

    const updatedEvent = await Event.updateEventById(event_id, eventData); // ✅ renamed function call

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found or not updated",
      });
    }
    delete updatedEvent.updated_at;
    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Update Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.deleteEvent(req.params.id);
    if (event) {
      res.status(200).json({
        success: true,
        message: "Event deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const getEventAttendees = async (req, res) => {
  const { event_id } = req.query;

  try {
    const attendees = await Event.getEventAttendees(event_id);
    res.status(200).json({
      success: true,
      attendees,
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendees",
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const event = await Event.createEvent(req.body);

    // Remove `created_at` and `updated_at` before sending response
    const { created_at, updated_at, ...eventWithoutTimestamps } = event;

    res.status(201).json(eventWithoutTimestamps);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventAttendees,
  createEvent,
};
