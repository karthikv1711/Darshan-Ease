const express = require('express');
const router = express.Router();
const { makeDonation, getDonations, getMyDonations } = require('../controllers/donationController');
const { protect, organizerOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, organizerOrAdmin, getDonations)
  .post(protect, makeDonation);

router.get('/my-donations', protect, getMyDonations);

module.exports = router;
