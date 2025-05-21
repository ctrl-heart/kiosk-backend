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
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, left: 30, right: 30, bottom: 40 },
        autoFirstPage: false,
      });
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=booking_confirmation.pdf");
      doc.pipe(res);
  
      doc.addPage();
  
      // 1. TOP PURPLE BANNER
      const bannerHeight = 110;
      doc.rect(0, 0, doc.page.width, bannerHeight).fill('#A259FF');
      doc
        .font('Helvetica-Bold')
        .fontSize(26)
        .fillColor('#fff')
        .text(event.title || 'Event Title', 45, 35, { align: 'left' });
      doc
        .font('Helvetica')
        .fontSize(14)
        .fillColor('#fff')
        .text(
          `${new Date(event.time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • ${event.location}`,
          45, 75, { align: 'left' }
        );
  
      // 2. RECEIPT NUMBER
      const ticketCode = `TIS${event_id}-${booking.booking_id || '1234'}-${user.name?.split(' ')[0]?.charAt(0).toUpperCase() || 'X'}${user.name?.split(' ')[1]?.charAt(0).toUpperCase() || 'D'}`;
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#7D8790')
        .text(`Receipt #${ticketCode}`, 0, bannerHeight + 18, { align: 'right' });
  
      // 3. ATTENDEE INFO BOX
      const boxTop = bannerHeight + 40;
      const boxLeft = 40;
      const boxWidth = doc.page.width - 80;
      const boxHeight = 150;
      doc
        .roundedRect(boxLeft, boxTop, boxWidth, boxHeight, 16)
        .fillAndStroke('#F5F7FA', '#E5E9F2');
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor('#232E38')
        .text('Attendee Information', boxLeft + 14, boxTop + 14);
  
      const infoStartY = boxTop + 42;
      doc.font('Helvetica').fontSize(12).fillColor('#596573');
      doc.text('Name', boxLeft + 20, infoStartY);
      doc.text('Email', boxLeft + 20, infoStartY + 22);
      doc.text('Date', boxLeft + 20, infoStartY + 44);
      doc.text('Location', boxLeft + 20, infoStartY + 66);
      doc.text('Time', boxLeft + 20, infoStartY + 88);
  
      doc.font('Helvetica-Bold').fillColor('#232E38')
        .text(user.name, boxLeft + 110, infoStartY)
        .text(user.email, boxLeft + 110, infoStartY + 22)
        .text(
          new Date(event.time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          boxLeft + 110, infoStartY + 44
        )
        .text(event.location, boxLeft + 110, infoStartY + 66, { width: boxWidth - 150 })
        // Start time from DB
const startTime = new Date(event.time);

// End time = startTime + 4 hours
const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);

// Format both times in UK timezone (Europe/London)
const startTimeStr = startTime.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/London'
});

const endTimeStr = endTime.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/London'
});

// Print in PDF
doc.text(`${startTimeStr} - ${endTimeStr}`, boxLeft + 110, infoStartY + 88);
  
      // 4. PRICE DETAILS
      const priceTop = boxTop + boxHeight + 30;
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor('#232E38')
        .text('Price Details', boxLeft, priceTop);
  
      doc
        .font('Helvetica')
        .fontSize(13)
        .fillColor('#596573')
        .text('Ticket Price', boxLeft, priceTop + 22)
        .font('Helvetica-Bold')
        .fillColor('#232E38')
        .text(`$${Number(event.price).toFixed(2)}`, doc.page.width - boxLeft - 90, priceTop + 22);
  
      // 5. BARCODE
      const barcodeY = priceTop + 60;
      const barcodePath = path.resolve(__dirname, "../assets/barcode_clean.png");
      if (fs.existsSync(barcodePath)) {
        doc.image(barcodePath, doc.page.width / 2 - 50, barcodeY, { width: 100 });
      } else {
        doc.font('Helvetica').fontSize(12).fillColor('#7D8790')
          .text('Barcode', doc.page.width / 2 - 30, barcodeY + 40);
      }
  
      // 6. FOOTER TICKET CODE
      doc.font('Helvetica').fontSize(13).fillColor('#A4AAB3')
        .text(ticketCode, 0, doc.page.height - 55, { align: 'center' });
  
      doc.end();
    } catch (error) {
      console.error("Error creating booking and generating PDF:", error);
      res
        .status(500)
        .json({ error: "Failed to create booking and generate PDF" });
    }
  }
}
  
module.exports = {guestBookingController };
