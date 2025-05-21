const pool = require("../database.js");

// Create user
const createUser = async ({ name, email, password, role }) => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, email, password, role]
  );
  return result.rows[0];
};

const createGuestUser = async (name, email) => {
  const query =
    "INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *";
  const values = [name, email, "guest"];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// ✅ This function MUST exist!
const getUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};
// normal username change
const updateUserName = async (user_id, name) => {
  const result = await pool.query(
    "UPDATE users SET name = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id, name, email, created_at, role",
    [name, user_id]
  );
  return result.rows[0];
};

// admin username change
const updateUserNameById = async (userId, newName) => {
  const result = await pool.query(
    "UPDATE users SET name = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *",
    [newName, userId]
  );
  return result.rows[0];
};

const getUserById = async (userId) => {
  const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
    userId,
  ]);
  return result.rows[0];
};

const updateUserPassword = async (userId, hashedPassword) => {
  await pool.query(
    "UPDATE users SET password = $1, updated_at = NOW() WHERE user_id = $2",
    [hashedPassword, userId]
  );
};

module.exports = {
  getUserById,
  createGuestUser,
  findUserByEmail,
  getUserByEmail, // ✅ Now this will work
  createUser,
  updateUserName,
  updateUserNameById,
  getUserById,
  updateUserPassword,
};
