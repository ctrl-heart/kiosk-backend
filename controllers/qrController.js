const QRCode = require('qrcode');

const generateQRCode = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const qrImageData = await QRCode.toDataURL(text); // base64 image
    res.status(200).json({ qrCode: qrImageData }); // return image as base64
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

module.exports = { generateQRCode };
