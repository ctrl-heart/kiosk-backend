const Booking = require("../models/bookingModel");
const pool = require("../database.js");
// controllers/bookingController.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const createBooking = async (req, res) => {
  try {
    const { event_id, user_id } = req.body;
    // --- VALIDATIONS (keep your existing validation code) ---
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );
    if (userCheck.rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: "user_id does not exist",
      });
    }

    const eventCheck = await pool.query(
      "SELECT * FROM events WHERE event_id = $1",
      [event_id]
    );
    if (eventCheck.rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: "event_id does not exist",
      });
    }

    const existing = await pool.query(
      "SELECT * FROM bookings WHERE event_id = $1 AND user_id = $2",
      [event_id, user_id]
    );
    if (existing.rows.length > 0) {
      return res.status(200).json({
        success: false,
        message: "User already registered for this event",
      });
    }

    const booking = await Booking.createBooking(event_id, user_id);

    const userResult = await pool.query(
      "SELECT name, email FROM users WHERE user_id = $1",
      [user_id]
    );
    const user = userResult.rows[0];

    const eventResult = await pool.query(
      `SELECT title, description, location, time, capacity, price, category_id 
       FROM events WHERE event_id = $1`,
      [event_id]
    );
    const event = eventResult.rows[0];

    const categoryResult = await pool.query(
      "SELECT name FROM categories WHERE category_id = $1",
      [event.category_id]
    );
    const category = categoryResult.rows[0];

    // --- START PDF GENERATION ---
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, left: 30, right: 30, bottom: 40 },
      autoFirstPage: false,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=booking_confirmation.pdf"
    );
    doc.pipe(res);

    doc.addPage();

    // 1. TOP PURPLE BANNER
    const bannerHeight = 110;
    doc.rect(0, 0, doc.page.width, bannerHeight).fill("#A259FF");
    doc
      .font("Helvetica-Bold")
      .fontSize(26)
      .fillColor("#fff")
      .text(event.title || "Event Title", 45, 35, { align: "left" });
    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("#fff")
      .text(
        `${new Date(event.time).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })} • ${event.location}`,
        45,
        75,
        { align: "left" }
      );

    // 2. RECEIPT NUMBER
    const ticketCode = `TIS${event_id}-${booking.booking_id || "1234"}-${
      user.name?.split(" ")[0]?.charAt(0).toUpperCase() || "X"
    }${user.name?.split(" ")[1]?.charAt(0).toUpperCase() || "D"}`;
    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#7D8790")
      .text(`Receipt #${ticketCode}`, 0, bannerHeight + 18, { align: "right" });

    // 3. ATTENDEE INFO BOX
    const boxTop = bannerHeight + 40;
    const boxLeft = 40;
    const boxWidth = doc.page.width - 80;
    const boxHeight = 150;
    doc
      .roundedRect(boxLeft, boxTop, boxWidth, boxHeight, 16)
      .fillAndStroke("#F5F7FA", "#E5E9F2");
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#232E38")
      .text("Attendee Information", boxLeft + 14, boxTop + 14);

    const infoStartY = boxTop + 42;
    doc.font("Helvetica").fontSize(12).fillColor("#596573");
    doc.text("Name", boxLeft + 20, infoStartY);
    doc.text("Email", boxLeft + 20, infoStartY + 22);
    doc.text("Date", boxLeft + 20, infoStartY + 44);
    doc.text("Location", boxLeft + 20, infoStartY + 66);
    doc.text("Time", boxLeft + 20, infoStartY + 88);

    doc
      .font("Helvetica-Bold")
      .fillColor("#232E38")
      .text(user.name, boxLeft + 110, infoStartY)
      .text(user.email, boxLeft + 110, infoStartY + 22)
      .text(
        new Date(event.time).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        boxLeft + 110,
        infoStartY + 44
      )
      .text(event.location, boxLeft + 110, infoStartY + 66, {
        width: boxWidth - 150,
      });
    // .text('09:00 - 17:00', boxLeft + 110, infoStartY + 88);
    // Start time from DB
    const startTime = new Date(event.time);

    // End time = startTime + 4 hours
    const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);

    // Format both times in UK timezone (Europe/London)
    const startTimeStr = startTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/London",
    });

    const endTimeStr = endTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/London",
    });

    // Print in PDF
    doc.text(`${startTimeStr} - ${endTimeStr}`, boxLeft + 110, infoStartY + 88);

    // 4. PRICE DETAILS
    const priceTop = boxTop + boxHeight + 30;
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#232E38")
      .text("Price Details", boxLeft, priceTop);

    doc
      .font("Helvetica")
      .fontSize(13)
      .fillColor("#596573")
      .text("Ticket Price", boxLeft, priceTop + 22)
      .font("Helvetica-Bold")
      .fillColor("#232E38")
      .text(
        `$${Number(event.price).toFixed(2)}`,
        doc.page.width - boxLeft - 90,
        priceTop + 22
      );

    // 5. BARCODE
    const barcodeY = priceTop + 60;
    const barcodePath = path.resolve(__dirname, "../assets/barcode_clean.png");
    if (fs.existsSync(barcodePath)) {
      doc.image(barcodePath, doc.page.width / 2 - 50, barcodeY, { width: 100 });
    } else {
      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor("#7D8790")
        .text("Barcode", doc.page.width / 2 - 30, barcodeY + 40);
    }

    // 6. FOOTER TICKET CODE
    doc
      .font("Helvetica")
      .fontSize(13)
      .fillColor("#A4AAB3")
      .text(ticketCode, 0, doc.page.height - 55, { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error creating booking and generating PDF:", error);
    res
      .status(500)
      .json({ error: "Failed to create booking and generate PDF" });
  }
};

module.exports = { createBooking };

//

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAllBookings();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

const getBookingsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Check if user exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Join bookings with events and get registration count
    const result = await pool.query(
      `
      SELECT 
        e.event_id,
        e.title,
        e.description,
        e.location,
        e.time,
        e.price,
        e.capacity,
        e.image_url,
        b.created_at AS booking_time,
        (
          SELECT COUNT(*) 
          FROM bookings b2 
          WHERE b2.event_id = e.event_id
        ) AS registered
      FROM bookings b
      JOIN events e ON b.event_id = e.event_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      `,
      [user_id]
    );

    res.status(200).json({
      success: true,
      user_id,
      total_events: result.rows.length,
      events: result.rows,
    });
  } catch (error) {
    console.error("Error fetching bookings by user:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user bookings" });
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

const getBookingByUserAndEvent = async (req, res) => {
  try {
    const { user_id, event_id } = req.body;

    // Validate inputs
    if (!user_id || !event_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and event_id are required",
      });
    }

    const existingBooking = await pool.query(
      "SELECT * FROM bookings WHERE user_id = $1 AND event_id = $2",
      [user_id, event_id]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(200).json({
        success: true,
        booking: existingBooking.rows[0],
      });
    } else {
      return res.status(200).json({
        success: false,
        booking: null,
        message: "No booking found for this user and event",
      });
    }
  } catch (error) {
    console.error("Error checking booking existence:", error);
    res.status(500).json({ error: "Failed to check booking" });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingsByUserId,
  deleteBooking,
  getBookingByUserAndEvent,
};
