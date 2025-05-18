// models/categoryModel.js
const pool = require("../database");

const getAllCategories = async () => {
  const query = `
    SELECT category_id, name
    FROM categories
    ORDER BY name ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getAllCategories,
};
