const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ['service', 'meeting', 'class', 'social', 'outreach', 'other'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  location: String,
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  churchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true,
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
  }],
  capacity: Number,
  registrationRequired: {
    type: Boolean,
    default: false,
  },
  imageUrl: String,
  recurring: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    interval: Number,
    endDate: Date,
    daysOfWeek: [Number],
  },
  customFields: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);

