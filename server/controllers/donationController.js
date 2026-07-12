const Donation = require('../models/Donation');
const Temple = require('../models/Temple');

// Generate unique transaction ID
const generateTransactionId = () => {
  return 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
};

// @desc    Make a donation
// @route   POST /api/donations
// @access  Private
const makeDonation = async (req, res) => {
  const { templeId, amount, purpose, donorName, isAnonymous } = req.body;

  try {
    const temple = await Temple.findById(templeId);
    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    const transactionId = generateTransactionId();
    const finalDonorName = isAnonymous ? 'Anonymous Devotee' : (donorName || req.user.name);

    const donation = await Donation.create({
      user: req.user._id,
      donorName: finalDonorName,
      temple: templeId,
      amount,
      purpose: purpose || 'General',
      transactionId
    });

    const populatedDonation = await Donation.findById(donation._id).populate('temple', 'name location');

    res.status(201).json({ success: true, data: populatedDonation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all donations (For Admin or Organizer)
// @route   GET /api/donations
// @access  Private/OrganizerOrAdmin
const getDonations = async (req, res) => {
  try {
    let donations;
    if (req.user.role === 'ADMIN') {
      donations = await Donation.find()
        .populate('user', 'name email')
        .populate('temple', 'name location')
        .sort({ createdAt: -1 });
    } else {
      const { templeId } = req.query;
      let query = {};
      if (templeId) {
        query.temple = templeId;
      }
      donations = await Donation.find(query)
        .populate('user', 'name email')
        .populate('temple', 'name location')
        .sort({ createdAt: -1 });
    }
    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's donations
// @route   GET /api/donations/my-donations
// @access  Private
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user._id })
      .populate('temple', 'name location')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  makeDonation,
  getDonations,
  getMyDonations
};
