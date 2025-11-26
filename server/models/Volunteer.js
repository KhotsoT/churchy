const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  churchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  ministryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active',
  },
  notes: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Volunteer', volunteerSchema);

