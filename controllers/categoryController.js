// controllers/categoryController.js
const Category = require("../models/categoryModel");

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAllCategories();
    res.status(200).json({
      success: true,
      results: categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllCategories,
};
