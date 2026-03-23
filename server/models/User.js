const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  country: String,
  zipCode: String,
  isDefault: { type: Boolean, default: false },
});

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
    minlength: 6,
    select: false,
  },
  name: {
    first: { type: String, required: true, trim: true },
    last: { type: String, required: true, trim: true },
  },
  phone: { type: String, default: '' },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  googleId: String,
  avatar: String,
  addresses: [addressSchema],
  isActive: { type: Boolean, default: true },
  isFlagged: { type: Boolean, default: false },
  flagReason: String,
  // Analytics
  source: { type: String, default: 'direct' },    // utm_source
  medium: { type: String, default: '' },           // utm_medium
  campaign: { type: String, default: '' },         // utm_campaign
  location: {
    country: String,
    city: String,
    region: String,
    ip: String,
    isVpn: Boolean,
  },
  lastActive: { type: Date, default: Date.now },
  totalSpent: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.name.first} ${this.name.last}`;
});

// Ensure virtuals appear in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
