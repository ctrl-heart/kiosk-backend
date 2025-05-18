const db = require('../database.js');

const createGuestUser = async (name, email) => {
  const query = 'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *';
  const values = [name, email, 'guest'];
  const result = await db.query(query, values);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(query, [email]);
  return result.rows[0];
};

// ✅ This function MUST exist!
const getUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(query, [email]);
  return result.rows[0];
};

module.exports = {
  createGuestUser,
  findUserByEmail,
  getUserByEmail, // ✅ Now this will work
};