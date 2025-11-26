const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  churchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipientIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push', 'in_app', 'announcement'],
    default: 'in_app',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isAnnouncement: {
    type: Boolean,
    default: false,
  },
  expiresAt: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', messageSchema);
