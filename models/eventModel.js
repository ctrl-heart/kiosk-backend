// models/eventModel.js
const database = require('../database.js');  // Assume db.js file with pg-promise or pg setup

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
      c.name AS category_name
    FROM Events e
    JOIN Categories c ON e.category_id = c.category_id
    LIMIT $1 OFFSET $2
  `;
  const result = await database.query(query, [limit, skip]);
  return result.rows;
};

const getTotalEventsCount = async () => {
  const result = await database.query('SELECT COUNT(*) FROM Events');
  return parseInt(result.rows[0].count);
};
  

  const getEventById = async (id) => {
    const result = await database.query(`
      SELECT 
        e.event_id, 
        e.title, 
        e.description, 
        e.location, 
        e.time, 
        e.capacity, 
        e.price, 
        c.name AS category_name
      FROM Events e
      JOIN Categories c ON e.category_id = c.category_id
      WHERE e.event_id = $1
    `, [id]);
  
    return result.rows[0];  // Single event object
  };
  


module.exports = { getAllEvents, getEventById, getTotalEventsCount };
