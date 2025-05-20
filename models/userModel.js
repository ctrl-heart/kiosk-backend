const pool = require('../database.js');

// Create user
const createUser = async ({ name, email, password, role }) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, password, role]
  );
  return result.rows[0];
};

const createGuestUser = async (name, email) => {
  const query = 'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *';
  const values = [name, email, 'guest'];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// ✅ This function MUST exist!
const getUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};



module.exports = {
  createGuestUser,
  findUserByEmail,
  getUserByEmail, // ✅ Now this will work
  createUser
};