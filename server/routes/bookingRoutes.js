const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  cancelBooking, 
  getMyBookings, 
  getBookings, 
  confirmPayment 
} = require('../controllers/bookingController');
const { protect, organizerOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, organizerOrAdmin, getBookings)
  .post(protect, createBooking);

router.get('/my-bookings', protect, getMyBookings);
router.post('/:id/confirm-payment', protect, confirmPayment);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
