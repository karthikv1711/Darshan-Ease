const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  donorName: {
    type: String,
    default: 'Anonymous Devotee'
  },
  temple: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Temple',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  purpose: {
    type: String,
    enum: ['General', 'Temple Maintenance', 'Anna Danam (Food Distribution)', 'Pooja/Festival', 'Prasadam Services'],
    default: 'General'
  },
  paymentMethod: {
    type: String,
    default: 'Card Payment'
  },
  transactionId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);
