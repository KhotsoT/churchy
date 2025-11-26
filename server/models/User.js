const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
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
  role: {
    type: String,
    enum: [
      'senior_pastor',  // Head of church, full access
      'pastor',         // Pastoral staff
      'elder',          // Church elder/deacon
      'admin',          // Church administrator
      'secretary',      // Office admin
      'treasurer',      // Financial oversight
      'ministry_leader', // Ministry/group leader
      'volunteer_coordinator', // Manages volunteers
      'member',         // Regular member
      'visitor'         // Guest/visitor
    ],
    default: 'member',
  },
  profileImage: String,
  phone: String,
  churchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

