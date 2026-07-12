const DarshanSlot = require('../models/DarshanSlot');
const { releaseExpiredHoldBookings } = require('./bookingController');

// @desc    Get all slots (with optional filters)
// @route   GET /api/slots
// @access  Public
const getSlots = async (req, res) => {
  const { templeId, date } = req.query;
  let query = {};

  if (templeId) {
    query.temple = templeId;
  }

  if (date) {
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }

  try {
    await releaseExpiredHoldBookings();
    const slots = await DarshanSlot.find(query).populate('temple', 'name location');
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single slot
// @route   GET /api/slots/:id
// @access  Public
const getSlotById = async (req, res) => {
  try {
    await releaseExpiredHoldBookings();
    const slot = await DarshanSlot.findById(req.params.id).populate('temple', 'name location');
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    res.json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a slot
// @route   POST /api/slots
// @access  Private/OrganizerOrAdmin
const createSlot = async (req, res) => {
  const { temple, date, startTime, endTime, availableSeats, price } = req.body;

  try {
    const slot = await DarshanSlot.create({
      temple,
      date,
      startTime,
      endTime,
      availableSeats,
      totalSeats: availableSeats,
      price: price || 0
    });

    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a slot
// @route   PUT /api/slots/:id
// @access  Private/OrganizerOrAdmin
const updateSlot = async (req, res) => {
  try {
    const slot = await DarshanSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    slot.date = req.body.date || slot.date;
    slot.startTime = req.body.startTime || slot.startTime;
    slot.endTime = req.body.endTime || slot.endTime;
    slot.availableSeats = req.body.availableSeats !== undefined ? req.body.availableSeats : slot.availableSeats;
    if (req.body.availableSeats !== undefined) {
      slot.totalSeats = Math.max(slot.totalSeats, req.body.availableSeats);
    }
    slot.price = req.body.price !== undefined ? req.body.price : slot.price;

    const updatedSlot = await slot.save();
    res.json({ success: true, data: updatedSlot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a slot
// @route   DELETE /api/slots/:id
// @access  Private/OrganizerOrAdmin
const deleteSlot = async (req, res) => {
  try {
    const slot = await DarshanSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    await slot.deleteOne();
    res.json({ success: true, message: 'Slot removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSlots,
  getSlotById,
  createSlot,
  updateSlot,
  deleteSlot
};
