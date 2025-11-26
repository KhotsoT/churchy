const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: { type: String, default: 'USA' },
});

const churchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: addressSchema,
  phone: String,
  email: String,
  website: String,
  logoUrl: String,
  timezone: {
    type: String,
    default: 'America/New_York',
  },
  currency: {
    type: String,
    default: 'USD',
  },
  dateFormat: {
    type: String,
    default: 'MM/DD/YYYY',
  },
  settings: {
    donations: { type: Boolean, default: true },
    events: { type: Boolean, default: true },
    groups: { type: Boolean, default: true },
    messaging: { type: Boolean, default: true },
    prayerRequests: { type: Boolean, default: true },
    volunteers: { type: Boolean, default: true },
    servicePlanning: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
  },
  customFields: [{
    name: String,
    type: { type: String, enum: ['text', 'number', 'date', 'select', 'boolean'] },
    entity: { type: String, enum: ['member', 'event', 'group', 'donation'] },
    required: Boolean,
    options: [String],
    defaultValue: mongoose.Schema.Types.Mixed,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Church', churchSchema);

