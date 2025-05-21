const UserModel = require("../models/UserModel");
const BookingModel = require("../models/BookingModel");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const guestBookingController = {
  bookEventForGuest: async (req, res) => {
    const { name, email, event_id } = req.body;
    console.log("event_id received:", event_id);

    try {
      // 1. Check if guest user already exists by email
      let user = await UserModel.findUserByEmail(email);

      // 2. If not found, create new guest user with role 'guest'
      if (!user) {
        user = await UserModel.createGuestUser(name, email);
      }

      // 3. Check if user already booked this event
      const existingBooking = await BookingModel.findBookingByUserAndEvent(
        user.user_id,
        event_id
      );
      if (existingBooking) {
        return res.status(200).json({
          success: false,
          message: "User already registered for this event",
        });
      }

      // 4. Get event details
      const event = await BookingModel.getEventById(event_id);
      if (!event) {
        return res.status(200).json({
          success: false,
          message: "event_id does not exist",
        });
      }
      // 5. Create booking for the user
      const booking = await BookingModel.createBooking(event_id, user.user_id);

      // 6. PDF Generate
      const doc = new PDFDocument();
      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        let pdfData = Buffer.concat(buffers);
        res
          .writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=booking_${booking.booking_id}.pdf`,
            "Content-Length": pdfData.length,
          })
          .end(pdfData);
      });

      // ✅ Add logo at top-left
      const logoPath = path.resolve(__dirname, "../assets/logo_clean.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 30, { width: 100 });
      }

      doc.moveDown(5);

      // PDF content
      doc.fontSize(20).text("Booking Confirmation", { underline: true });
      doc.moveDown();

      const bookingDate = new Date();
      doc.fontSize(12).text(
        `Booking Date: ${bookingDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}`
      );
      doc.text(
        `Booking Time: ${bookingDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
      doc.moveDown();

      doc.fontSize(14).text("User Info", { underline: true });
      doc.text(`Name: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.moveDown();

      doc.fontSize(14).text("Event Info", { underline: true });
      doc.text(`Title: ${event.title}`);
      doc.text(`Description: ${event.description}`);
      doc.text(`Location: ${event.location}`);

      const eventDate = new Date(event.time);
      const formattedEventDate = `${eventDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })} ${eventDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
      doc.text(`Time: ${formattedEventDate}`);
      doc.text(`Capacity: ${event.capacity}`);

      const price =
        typeof event.price === "number"
          ? event.price
          : parseFloat(event.price) || 0;
      doc.text(`Price: $${price.toFixed(2)}`);
      doc.moveDown();

      doc.fontSize(14).text("Category Info", { underline: true });
      doc.text(`Category name: ${event.category_name}`);

      // ✅ Add barcode image at bottom-right
      const barcodePath = path.resolve(
        __dirname,
        "../assets/barcode_clean.png"
      );
      if (fs.existsSync(barcodePath)) {
        const pageHeight = doc.page.height;
        const pageWidth = doc.page.width;
        doc.image(barcodePath, pageWidth - 130, pageHeight - 110, {
          width: 100,
        });
      }

      doc.end();
    } catch (error) {
      console.error("Guest booking error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};

module.exports = guestBookingController;
