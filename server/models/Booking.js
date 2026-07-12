const mongoose = require('mongoose');

const devoteeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  }
});

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  temple: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Temple',
    required: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DarshanSlot',
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  numberOfDevotees: {
    type: Number,
    required: true,
    default: 1
  },
  devotees: [devoteeSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Booked', 'Cancelled', 'Expired'],
    default: 'Pending'
  },
  expiresAt: {
    type: Date
  },
  ticketCode: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
