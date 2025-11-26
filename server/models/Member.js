const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: { type: String, default: 'USA' },
});

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  churchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: String,
  phone: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  address: addressSchema,
  profileImage: String,
  membershipStatus: {
    type: String,
    enum: ['active', 'inactive', 'visitor', 'member'],
    default: 'visitor',
  },
  joinDate: Date,
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
  },
  familyRole: {
    type: String,
    enum: ['head', 'spouse', 'child', 'other'],
  },
  customFields: mongoose.Schema.Types.Mixed,
  tags: [String],
  notes: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Member', memberSchema);

