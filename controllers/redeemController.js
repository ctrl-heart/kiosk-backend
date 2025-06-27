const pool = require("../database.js");

const applyRedeem = async (req, res) => {
  try {
    const { user_id, redeem_percent } = req.body;

    if (!user_id || !redeem_percent) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const userCheck = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = userCheck.rows[0];
    let userPoints = user.points || 0;
    const percent = parseInt(redeem_percent);
    let requiredPoints = 0;

    if (percent === 10) requiredPoints = 50;
    else if (percent === 25) requiredPoints = 100;
    else if (percent === 50) requiredPoints = 200;
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid redeem_percent. Allowed: 10, 25, 50",
      });
    }

    if (userPoints < requiredPoints) {
      return res.status(200).json({
        success: false,
        message: `You do not have enough points for ${percent}% discount.`,
      });
    }

    // ✅ Check if existing discount is bigger
    if (percent <= user.discount_percent) {
      return res.status(200).json({
        success: false,
        message: `You already have ${user.discount_percent}% redeem applied. You cannot apply a smaller or equal discount.`,
      });
    }

    // ✅ Deduct points and apply new redeem
    userPoints -= requiredPoints;

    await pool.query(
      "UPDATE users SET points = $1, discount_percent = $2 WHERE user_id = $3",
      [userPoints, percent, user_id]
    );

    res.status(200).json({
      success: true,
      message: `${percent}% discount applied successfully`,
      remaining_points: userPoints,
      discount_applied: percent,
    });

  } catch (error) {
    console.error("Redeem error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Export at the end
module.exports = { applyRedeem };
