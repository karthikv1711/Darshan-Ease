const User = require('../models/User');
const Temple = require('../models/Temple');
const Booking = require('../models/Booking');
const Donation = require('../models/Donation');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalOrganizers = await User.countDocuments({ role: 'ORGANIZER' });
    const totalTemples = await Temple.countDocuments();
    
    // Booking stats
    const bookings = await Booking.find({ status: 'Booked' });
    const totalBookingRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalBookingsCount = bookings.length;

    // Donation stats
    const donations = await Donation.find();
    const totalDonationRevenue = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalRevenue = totalBookingRevenue + totalDonationRevenue;

    // Temples booking statistics
    const templeStats = {};
    const temples = await Temple.find({}, 'name');
    temples.forEach(t => {
      templeStats[t._id] = { name: t.name, count: 0, revenue: 0 };
    });

    bookings.forEach(b => {
      if (templeStats[b.temple]) {
        templeStats[b.temple].count += 1;
        templeStats[b.temple].revenue += b.totalAmount;
      }
    });

    const popularTemples = Object.values(templeStats).sort((a, b) => b.count - a.count);

    // Devotee demographics
    let kids = 0;       // < 18
    let youth = 0;      // 18 - 35
    let adults = 0;     // 36 - 60
    let seniors = 0;    // > 60

    bookings.forEach(b => {
      if (b.devotees && Array.isArray(b.devotees)) {
        b.devotees.forEach(d => {
          if (d.age < 18) kids++;
          else if (d.age <= 35) youth++;
          else if (d.age <= 60) adults++;
          else seniors++;
        });
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalOrganizers,
          totalTemples,
          totalBookingsCount,
          totalBookingRevenue,
          totalDonationRevenue,
          totalRevenue
        },
        popularTemples,
        demographics: [
          { name: 'Kids (<18)', value: kids },
          { name: 'Youth (18-35)', value: youth },
          { name: 'Adults (36-60)', value: adults },
          { name: 'Seniors (60+)', value: seniors }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (with role filter)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const { role } = req.query;
  let query = {};
  if (role) {
    query.role = role;
  }
  try {
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    user.role = req.body.role || user.role;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount <= 1 && user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Cannot delete the last admin user' });
      }
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardAnalytics,
  getUsers,
  updateUser,
  deleteUser
};
