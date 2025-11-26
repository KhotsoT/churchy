const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  churchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['tithe', 'offering', 'building', 'mission', 'other'],
    required: true,
  },
  method: {
    type: String,
    enum: ['cash', 'check', 'card', 'online', 'bank_transfer', 'eft'],
    required: true,
  },
  fund: String,
  notes: String,
  receiptSent: {
    type: Boolean,
    default: false,
  },
  transactionId: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Donation', donationSchema);

