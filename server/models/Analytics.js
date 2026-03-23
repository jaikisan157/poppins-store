const mongoose = require('mongoose');

const pageVisitSchema = new mongoose.Schema({
  sessionId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  page: { type: String, required: true },           // e.g. '/product/abc123'
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  // UTM tracking
  utm_source: { type: String, default: 'direct' },  // instagram, youtube, tiktok, etc.
  utm_medium: { type: String, default: '' },         // reel, video, story, etc.
  utm_campaign: { type: String, default: '' },       // campaign name
  // IP geolocation
  ip: String,
  location: {
    country: String,
    countryCode: String,
    city: String,
    region: String,
    isp: String,
    isVpn: { type: Boolean, default: false },
    isProxy: { type: Boolean, default: false },
  },
  // User agent
  userAgent: String,
  referrer: String,
  // Engagement
  duration: { type: Number, default: 0 },            // seconds on page
  scrollDepth: { type: Number, default: 0 },         // percentage
  clicked: { type: Boolean, default: false },         // did they click "add to cart" etc.
  purchased: { type: Boolean, default: false },       // did this visit lead to purchase
}, {
  timestamps: true,
});

pageVisitSchema.index({ createdAt: -1 });
pageVisitSchema.index({ utm_source: 1 });
pageVisitSchema.index({ 'location.countryCode': 1 });
pageVisitSchema.index({ productId: 1 });
pageVisitSchema.index({ sessionId: 1 });

module.exports = mongoose.model('PageVisit', pageVisitSchema);
