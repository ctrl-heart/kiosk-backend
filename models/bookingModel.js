const pool = require("../database.js");

const createBooking = async (event_id, user_id) => {
  const result = await pool.query(
    `INSERT INTO bookings (user_id, event_id, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     RETURNING *`,
    [user_id, event_id]
  );
  return result.rows[0];
};


const getEventById = async (event_id) => {
  const result = await pool.query(
    `SELECT 
       e.title,
       e.description,
       e.location,
       e.time,
       e.capacity,
       e.price,
       c.name AS category_name
     FROM events e
     JOIN categories c ON e.category_id = c.category_id
     WHERE e.event_id = $1`,
    [event_id]
    // `SELECT * FROM events WHERE event_id = $1`,
    // [event_id]
  );
  return result.rows[0];
};

const getAllBookings = async () => {
  const result = await pool.query(`SELECT * FROM bookings`);
  return result.rows;
};

const getBookingById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM bookings WHERE booking_id = $1`,
    [id]
  );
  return result.rows[0];
};

const deleteBooking = async (id) => {
  const result = await pool.query(
    `DELETE FROM bookings WHERE booking_id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};
const findBookingByUserAndEvent = async (user_id, event_id) => {
  const result = await pool.query(
    'SELECT * FROM bookings WHERE user_id = $1 AND event_id = $2',
    [user_id, event_id]
  );
  return result.rows[0]; // returns booking if it exists, otherwise undefined
};


module.exports = {
  createBooking,
  getEventById,
  getAllBookings,
  getBookingById,
  deleteBooking,
  findBookingByUserAndEvent,
};
