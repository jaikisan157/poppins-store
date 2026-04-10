const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  category: {
    type: String,
    default: 'Other',
    trim: true,
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isMain: { type: Boolean, default: false },
  }],
  videoUrl: { type: String, default: '' },
  externalUrl: { type: String, default: '' },       // Gumroad / purchase link
  techStack: [{ type: String }],                     // e.g. ['React', 'Node.js', 'MongoDB']
  tags: [{ type: String }],
  isVisible: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  // Analytics
  viewCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },          // "Get It" clicks
}, {
  timestamps: true,
});

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for search
productSchema.index({ name: 'text', shortDescription: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isVisible: 1, isFeatured: 1 });

module.exports = mongoose.model('Product', productSchema);
