const Booking = require('../models/Booking');
const DarshanSlot = require('../models/DarshanSlot');
const Temple = require('../models/Temple');

// Generate unique ticket code
const generateTicketCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'DE-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper: Release expired pending bookings and restore seats
const releaseExpiredHoldBookings = async () => {
  try {
    const now = new Date();
    const expiredBookings = await Booking.find({
      status: 'Pending',
      expiresAt: { $lte: now }
    });

    for (let booking of expiredBookings) {
      const slot = await DarshanSlot.findById(booking.slot);
      if (slot) {
        slot.availableSeats += booking.numberOfDevotees;
        // Cap seats at totalSeats just in case
        slot.availableSeats = Math.min(slot.availableSeats, slot.totalSeats);
        await slot.save();
      }
      booking.status = 'Expired';
      await booking.save();
      console.log(`Hold expired and seats released for booking ${booking.ticketCode}`);
    }
  } catch (error) {
    console.error('Error releasing expired bookings:', error);
  }
};

// @desc    Create a booking hold (Pending payment)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { slotId, devotees } = req.body;

  if (!devotees || !Array.isArray(devotees) || devotees.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide at least one devotee details' });
  }

  try {
    // Release any expired holds first to get accurate availability count
    await releaseExpiredHoldBookings();

    const slot = await DarshanSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Darshan slot not found' });
    }

    const requestedSeats = devotees.length;
    if (slot.availableSeats < requestedSeats) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${slot.availableSeats} seats are available for this slot.` 
      });
    }

    // Deduct seats temporarily for the hold
    slot.availableSeats -= requestedSeats;
    await slot.save();

    const totalAmount = requestedSeats * slot.price;
    const ticketCode = generateTicketCode();
    
    // Hold expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const booking = await Booking.create({
      user: req.user._id,
      temple: slot.temple,
      slot: slot._id,
      numberOfDevotees: requestedSeats,
      devotees,
      totalAmount,
      ticketCode,
      status: 'Pending',
      expiresAt
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('temple', 'name location image')
      .populate('slot', 'date startTime endTime price');

    res.status(201).json({ 
      success: true, 
      data: populatedBooking,
      expiresAt: expiresAt.toISOString(),
      holdTimeSeconds: 300 // 5 minutes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm payment & finalize booking
// @route   POST /api/bookings/:id/confirm-payment
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    await releaseExpiredHoldBookings();

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.user.toString() !== req.user._id.toString() && req.user.role === 'USER') {
      return res.status(403).json({ success: false, message: 'Not authorized to confirm this booking' });
    }

    if (booking.status === 'Expired') {
      return res.status(400).json({ 
        success: false, 
        message: 'The seat reservation window has expired. Please try booking a different slot.' 
      });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Booking has already been finalized: ${booking.status}` 
      });
    }

    // Confirm booking
    booking.status = 'Booked';
    booking.expiresAt = undefined;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('temple', 'name location image')
      .populate('slot', 'date startTime endTime price');

    res.json({ 
      success: true, 
      data: populatedBooking, 
      message: 'Payment confirmed successfully. Your darshan ticket is secured.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    await releaseExpiredHoldBookings();

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString() && req.user.role === 'USER') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Restore seats (if it was booked)
    if (booking.status === 'Booked') {
      const slot = await DarshanSlot.findById(booking.slot);
      if (slot) {
        slot.availableSeats += booking.numberOfDevotees;
        slot.availableSeats = Math.min(slot.availableSeats, slot.totalSeats);
        await slot.save();
      }
    }

    booking.status = 'Cancelled';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('temple', 'name location image')
      .populate('slot', 'date startTime endTime price');

    res.json({ success: true, data: populatedBooking, message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    await releaseExpiredHoldBookings();

    const bookings = await Booking.find({ user: req.user._id })
      .populate('temple', 'name location image')
      .populate('slot', 'date startTime endTime price')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (For Admin or Organizer)
// @route   GET /api/bookings
// @access  Private/OrganizerOrAdmin
const getBookings = async (req, res) => {
  try {
    await releaseExpiredHoldBookings();

    let bookings;
    if (req.user.role === 'ADMIN') {
      bookings = await Booking.find()
        .populate('user', 'name email phone')
        .populate('temple', 'name location')
        .populate('slot', 'date startTime endTime')
        .sort({ createdAt: -1 });
    } else {
      const { templeId } = req.query;
      let query = {};
      if (templeId) {
        query.temple = templeId;
      }
      bookings = await Booking.find(query)
        .populate('user', 'name email phone')
        .populate('temple', 'name location')
        .populate('slot', 'date startTime endTime')
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  cancelBooking,
  getMyBookings,
  getBookings,
  confirmPayment,
  releaseExpiredHoldBookings
};
