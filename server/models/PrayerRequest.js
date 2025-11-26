const mongoose = require('mongoose');

const prayerRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  churchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: String,
  isPublic: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'answered', 'archived'],
    default: 'active',
  },
  prayedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);

