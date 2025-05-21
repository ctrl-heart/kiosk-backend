const express = require('express');
const router = express.Router();
const {guestBookingController} = require('../controllers/guestController');

router.post('/', guestBookingController.bookEventForGuest); 


module.exports = router;
