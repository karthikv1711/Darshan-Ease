const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const maintenanceSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const templeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  videoBg: {
    type: String,
    default: ''
  },
  deityImage: {
    type: String,
    default: ''
  },
  deityAudio: {
    type: String,
    default: ''
  },
  darshanStartTime: {
    type: String,
    required: true
  },
  darshanEndTime: {
    type: String,
    required: true
  },
  amenities: [{
    type: String
  }],
  events: [eventSchema],
  maintenanceRequests: [maintenanceSchema],
  ratings: [ratingSchema],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Temple', templeSchema);
