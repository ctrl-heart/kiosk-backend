const express = require('express');
const router = express.Router();
const { generateQRCode } = require('../controllers/qrController');

router.post('/generate-qr', generateQRCode);

module.exports = router;
