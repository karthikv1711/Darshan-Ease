const express = require('express');
const router = express.Router();
const { getSlots, getSlotById, createSlot, updateSlot, deleteSlot } = require('../controllers/slotController');
const { protect, organizerOrAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getSlots)
  .post(protect, organizerOrAdmin, createSlot);

router.route('/:id')
  .get(getSlotById)
  .put(protect, organizerOrAdmin, updateSlot)
  .delete(protect, organizerOrAdmin, deleteSlot);

module.exports = router;
