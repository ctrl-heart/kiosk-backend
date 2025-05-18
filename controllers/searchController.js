const pool = require("../database.js");

// Search Events with Pagination + Clean response + Error handling
exports.searchEvents = async (req, res) => {
  const { search } = req.query;

  // Pagination parameters
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;

  try {
    let query = `
            SELECT 
                e.event_id, 
                e.title, 
                e.description, 
                e.location, 
                e.time, 
                e.capacity, 
                e.price, 
                c.name AS category_name
            FROM events e
            JOIN categories c ON e.category_id = c.category_id
        `;

    let conditions = [];
    let values = [];

    // Search condition (title, description, location)
    if (search) {
      conditions.push(
        "(e.title ILIKE $" +
          (values.length + 1) +
          " OR e.description ILIKE $" +
          (values.length + 1) +
          " OR e.location ILIKE $" +
          (values.length + 1) +
          ")"
      );
      values.push(`%${search}%`);
    }

    // Add where conditions if any
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // ✅ ✅ ✅ TOTAL (without any filters → pure database total count)
    const totalQuery = `SELECT COUNT(*) FROM events`;
    const totalResult = await pool.query(totalQuery);
    const total = parseInt(totalResult.rows[0].count);

    // Add pagination
    query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit);
    values.push(skip);

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      results: result.rows.length > 0 ? result.rows : [],
      total: total,
      skip: skip,
      limit: limit,
    });
  } catch (error) {
    console.error("Error caught:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Filter Events with Category, Date Range, Price Range and Pagination
exports.filterEvents = async (req, res) => {
  const { category_name, start_date, end_date, price_min, price_max } =
    req.query;

  // Pagination parameters
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;

  try {
    let query = `
            SELECT 
                e.event_id, 
                e.title, 
                e.description, 
                e.location, 
                e.time, 
                e.capacity, 
                e.price, 
                c.name AS category_name
            FROM events e
            JOIN categories c ON e.category_id = c.category_id
        `;

    let conditions = [];
    let values = [];

    // Category filter
    if (category_name) {
      conditions.push("c.name ILIKE $" + (values.length + 1));
      values.push(`%${category_name}%`);
    }

    // Date Range filter
    if (start_date && end_date) {
      conditions.push(
        "DATE(e.time) BETWEEN $" +
          (values.length + 1) +
          " AND $" +
          (values.length + 2)
      );
      values.push(start_date);
      values.push(end_date);
    }

    // Price Range filter
    if (price_min && price_max) {
      conditions.push(
        "e.price BETWEEN $" +
          (values.length + 1) +
          " AND $" +
          (values.length + 2)
      );
      values.push(price_min);
      values.push(price_max);
    }

    // Add where conditions if any
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // ✅ ✅ ✅ TOTAL (without any filters → pure database total count)
    const totalQuery = `SELECT COUNT(*) FROM events`;
    const totalResult = await pool.query(totalQuery);
    const total = parseInt(totalResult.rows[0].count);

    // // Total count query (for total records without limit/skip)
    // const countQuery = query.replace(
    //     `SELECT
    //         e.event_id,
    //         e.title,
    //         e.description,
    //         e.location,
    //         e.time,
    //         e.capacity,
    //         e.price,
    //         c.name AS category_name`,
    //     'SELECT COUNT(*)'
    // );

    // const totalResult = await pool.query(countQuery, values);
    // const total = parseInt(totalResult.rows[0].count);

    // Add pagination
    query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit);
    values.push(skip);

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      results: result.rows.length > 0 ? result.rows : [],
      total: total,
      skip: skip,
      limit: limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
