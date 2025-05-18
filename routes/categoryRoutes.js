// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// GET all categories
router.get("/categories", categoryController.getAllCategories);

module.exports = router;
