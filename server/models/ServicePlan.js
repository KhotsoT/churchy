const mongoose = require('mongoose');

const serviceItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['song', 'prayer', 'scripture', 'sermon', 'announcement', 'offering', 'other'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  duration: Number,
  order: {
    type: Number,
    required: true,
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
  }],
  resources: [String],
}, { _id: true });

const serviceRoleSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  notes: String,
}, { _id: false });

const servicePlanSchema = new mongoose.Schema({
  churchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true,
  },
  serviceDate: {
    type: Date,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  title: String,
  orderOfService: [serviceItemSchema],
  assignedRoles: [serviceRoleSchema],
  notes: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('ServicePlan', servicePlanSchema);

