// models/eventModel.js
const database = require("../database.js"); // Assume db.js file with pg-promise or pg setup

// const getAllEvents = async (skip = 0, limit = 10) => {
//   const query = `
//     SELECT
//       e.event_id,
//       e.title,
//       e.description,
//       e.location,
//       e.time,
//       e.capacity,
//       e.price,
//       e.image_url,
//       c.name AS category_name
//     FROM Events e
//     JOIN Categories c ON e.category_id = c.category_id
//     LIMIT $1 OFFSET $2
//   `;
//   const result = await database.query(query, [limit, skip]);
//   return result.rows;
// };

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

  let baseQuery = `
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
      json_agg(
        json_build_object(
          'user_id', u.user_id,
          'name', u.name,
          'email', u.email,
          'role', u.role,
          'created_at', u.created_at
        )
      ) FILTER (WHERE u.user_id IS NOT NULL) AS attendees
    FROM events e
    JOIN categories c ON e.category_id = c.category_id
    LEFT JOIN bookings b ON e.event_id = b.event_id
    LEFT JOIN users u ON u.user_id = b.user_id
  `;

  const values = [];
  const conditions = [];

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
    baseQuery += ` WHERE ${conditions.join(" AND ")}`;
  }

  baseQuery += `
    GROUP BY e.event_id, c.name
    ORDER BY e.time ASC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  values.push(parseInt(limit), parseInt(skip));

  try {
    const result = await pool.query(baseQuery, values);

    // Remove null attendee arrays from empty events
    const cleaned = result.rows.map((row) => ({
      ...row,
      attendees: row.attendees || [],
    }));

    res.status(200).json({
      success: true,
      results: cleaned,
      total: cleaned.length,
      skip: parseInt(skip),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
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
  let query = `
    SELECT 
      u.user_id,
      u.name,
      u.email,
      u.role,
      u.created_at,
      COUNT(DISTINCT b.event_id) AS events_count,
      json_agg(
        json_build_object(
          'event_id', e.event_id,
          'title', e.title,
          'time', e.time,
          'location', e.location,
          'price', e.price
        )
      ) AS events
    FROM users u
    JOIN bookings b ON u.user_id = b.user_id
    JOIN events e ON e.event_id = b.event_id
  `;

  const params = [];

  if (event_id) {
    query += ` WHERE b.event_id = $1`;
    params.push(event_id);
  }

  query += ` GROUP BY u.user_id ORDER BY u.created_at DESC`;

  const { rows } = await database.query(query, params);
  return rows;
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
