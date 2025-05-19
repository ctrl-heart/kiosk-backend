const QRCode = require('qrcode');

exports.generateQR = async (req, res) => {
  try {
    const { link, event_id, event_name, date, seat_left, location } = req.body;

    // 🔍 Validate basic required fields
    if (!link || typeof link !== 'string') {
      return res.status(400).json({ success: false, message: 'link is required and must be a string' });
    }

    if (!event_id || !event_name || !date || !seat_left || !location) {
      return res.status(400).json({
        success: false,
        message: 'event_id, event_name, date, seat_left, and location are all required',
      });
    }

    // ✅ Construct URL with query parameters
    const url = new URL(link);
    url.searchParams.set('event_id', event_id);
    url.searchParams.set('event_name', event_name);
    url.searchParams.set('date', date);
    url.searchParams.set('seat_left', seat_left);
    url.searchParams.set('location', location);

    const fullURL = url.toString();

    // ✅ Generate QR code as base64 image
    const qrImage = await QRCode.toDataURL(fullURL);

    res.status(200).json({
      success: true,
      full_url: fullURL,
      qr_base64: qrImage,
    });

  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({
      success: false,
      message: 'QR generation failed',
      error: error.message,
    });
  }
};