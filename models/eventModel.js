// models/eventModel.js
const database = require("../database.js"); // Assume db.js file with pg-promise or pg setup

const getAllEvents = async (skip = 0, limit = 10) => {
  const query = `
    SELECT 
      e.event_id, 
      e.title, 
      e.description, 
      e.location, 
      e.time, 
      e.capacity, 
      e.price, 
      e.image_url, 
      c.name AS category_name
    FROM Events e
    JOIN Categories c ON e.category_id = c.category_id
    LIMIT $1 OFFSET $2
  `;
  const result = await database.query(query, [limit, skip]);
  return result.rows;
};

const getTotalEventsCount = async () => {
  const result = await database.query("SELECT COUNT(*) FROM Events");
  return parseInt(result.rows[0].count);
};

const getEventById = async (id) => {
  const result = await database.query(
    `
      SELECT 
        e.event_id, 
        e.title, 
        e.description, 
        e.location, 
        e.time, 
        e.capacity, 
        e.price, 
        e.image_url, 
        c.name AS category_name
      FROM Events e
      JOIN Categories c ON e.category_id = c.category_id
      WHERE e.event_id = $1
    `,
    [id]
  );

  return result.rows[0]; // Single event object
};

const updateEventById = async (event_id, eventData) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in eventData) {
    fields.push(`${key} = $${index}`);
    values.push(eventData[key]);
    index++;
  }

  if (fields.length === 0) {
    throw new Error("No data provided for update");
  }

  values.push(event_id); // Last value is ID
  const query = `UPDATE events SET ${fields.join(
    ", "
  )} WHERE event_id = $${index} RETURNING *`;
  const result = await database.query(query, values);
  return result.rows[0];
};

const deleteEvent = async (event_id) => {
  const result = await database.query(
    "DELETE FROM Events WHERE event_id = $1 RETURNING *",
    [event_id]
  );
  return result.rows[0];
};

const getEventAttendees = async (event_id) => {
  const result = await database.query(
    `SELECT 
       u.user_id, 
       u.name, 
       u.email, 
       u.role, 
       u.created_at,
       COUNT(b2.event_id) AS events_count
     FROM bookings b
     JOIN users u ON b.user_id = u.user_id
     LEFT JOIN bookings b2 ON u.user_id = b2.user_id
     WHERE b.event_id = $1
     GROUP BY u.user_id, u.name,  u.email, u.role, u.created_at`,
    [event_id]
  );
  return result.rows;
};

const createEvent = async (event) => {
  const { title, description, location, time, capacity, price, category_id } =
    event;
  const result = await database.query(
    "INSERT INTO Events (title, description, location, time, capacity, price, category_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *",
    [title, description, location, time, capacity, price, category_id]
  );
  return result.rows[0];
};

module.exports = {
  getAllEvents,
  getEventById,
  getTotalEventsCount,
  updateEventById,
  deleteEvent,
  getEventAttendees,
  createEvent,
};
