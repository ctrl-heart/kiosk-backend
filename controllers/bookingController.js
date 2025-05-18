const Booking = require("../models/bookingModel");
const pool = require("../database.js");
// controllers/bookingController.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");


const createBooking = async (req, res) => {
  try {
    const { event_id, user_id } = req.body;
    console.log("event_id received:", event_id);
    console.log("user_id received:", user_id);

    // ✅ A. Validate user_id exists
const userCheck = await pool.query(
  "SELECT * FROM users WHERE user_id = $1",
  [user_id]
);
if (userCheck.rows.length === 0) {
  return res.status(200).json({
    success: false,
    message: "user_id does not exist"
  });
}

// ✅ B. Validate event_id exists
const eventCheck = await pool.query(
  "SELECT * FROM events WHERE event_id = $1",
  [event_id]
);
if (eventCheck.rows.length === 0) {
  return res.status(200).json({
    success: false,
    message: "event_id does not exist"
  });
}

    // ✅ 1. Check if user already booked this event
    const existing = await pool.query(
      "SELECT * FROM bookings WHERE event_id = $1 AND user_id = $2",
      [event_id, user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({
        success: false,
        message: "User already registered for this event"
      });
    }

    // ✅ 2. Create booking
    const booking = await Booking.createBooking(event_id, user_id);

    // ✅ 3. Fetch user info (without user_id)
    const userResult = await pool.query(
      "SELECT name, email FROM users WHERE user_id = $1",
      [user_id]
    );
    const user = userResult.rows[0];

    // ✅ 4. Fetch event info (without event_id)
    const eventResult = await pool.query(
      `SELECT title, description, location, time, capacity, price, category_id 
       FROM events WHERE event_id = $1`,
      [event_id]
    );
    const event = eventResult.rows[0];

    // ✅ 5. Fetch category name using category_id
    const categoryResult = await pool.query(
      "SELECT name FROM categories WHERE category_id = $1",
      [event.category_id]
    );
    const category = categoryResult.rows[0];

    // ✅ 6. Generate PDF
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=booking_confirmation.pdf");
    doc.pipe(res);

    // ➕ Add logo
    const logoPath = path.resolve(__dirname, "../assets/logo_clean.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 100 });
    }

    doc.moveDown(5);
    doc.fontSize(20).text("Booking Confirmation", { underline: true });
    doc.moveDown();

    const bookingDate = new Date(booking.created_at);
    const dateStr = bookingDate.toLocaleDateString("en-GB", {
      day: "2-digit", month: "long", year: "numeric"
    });
    const timeStr = bookingDate.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit"
    });

    doc.fontSize(14).text(`Booking Date: ${dateStr}`);
    doc.text(`Booking Time: ${timeStr}`);
    doc.moveDown();

    doc.fontSize(16).text("User Info", { underline: true });
    doc.fontSize(14).text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.moveDown();

    doc.fontSize(16).text("Event Info", { underline: true });
    doc.fontSize(14).text(`Title: ${event.title}`);
    doc.text(`Description: ${event.description}`);
    doc.text(`Location: ${event.location}`);

    const eventTime = new Date(event.time);
    const eventDateStr = eventTime.toLocaleDateString("en-GB", {
      day: "2-digit", month: "long", year: "numeric"
    });
    const eventTimeStr = eventTime.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit"
    });

    doc.text(`Time: ${eventDateStr} ${eventTimeStr}`);
    doc.text(`Capacity: ${event.capacity}`);
    doc.text(`Price: $${event.price}`);

    doc.fontSize(16).text("Category Info", { underline: true });
    doc.text(`Category name: ${category.name}`);
    doc.moveDown();

    // ➕ Add barcode
    const barcodePath = path.resolve(__dirname, "../assets/barcode_clean.png");
    if (fs.existsSync(barcodePath)) {
      const pageHeight = doc.page.height;
      const pageWidth = doc.page.width;
      doc.image(barcodePath, pageWidth - 130, pageHeight - 110, { width: 100 });
    }

    doc.end();

  } catch (error) {
    console.error("Error creating booking and generating PDF:", error);
    res.status(500).json({ error: "Failed to create booking and generate PDF" });
  }
};




const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAllBookings();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

const getBookingById = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.getBookingById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await Booking.deleteBooking(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  deleteBooking,
};
