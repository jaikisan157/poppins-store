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
  price: {
    current: { type: Number, required: true, min: 0 },
    compareAt: { type: Number, default: null },   // "was" price for showing discount
    cost: { type: Number, default: 0 },           // actual cost from supplier (for profit calc)
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isMain: { type: Boolean, default: false },
  }],
  inventory: {
    quantity: { type: Number, default: 0, min: 0 },
    trackQuantity: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5 },
  },
  shipping: {
    weight: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },               // shipping cost from supplier
    countries: [{ type: String }],                      // ISO country codes where it ships
    freeShippingThreshold: { type: Number, default: 50 },
  },
  isVisible: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [{ type: String }],
  videoUrl: { type: String, default: '' },
  // Analytics
  viewCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  // Computed
  discountPercentage: { type: Number, default: 0 },
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
  // Calculate discount percentage
  if (this.price.compareAt && this.price.compareAt > this.price.current) {
    this.discountPercentage = Math.round(
      ((this.price.compareAt - this.price.current) / this.price.compareAt) * 100
    );
  } else {
    this.discountPercentage = 0;
  }
  next();
});

// Index for search
productSchema.index({ name: 'text', shortDescription: 'text', description: 'text' });
productSchema.index({ category: 1, 'price.current': 1 });
productSchema.index({ isVisible: 1, isFeatured: 1 });

module.exports = mongoose.model('Product', productSchema);
