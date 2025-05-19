const express = require('express');
const router = express.Router();
const { generateQR } = require('../controllers/qrController');

router.post('/generate-qr', generateQR);

module.exports = router;
