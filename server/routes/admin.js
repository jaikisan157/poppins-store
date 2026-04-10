const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const PageVisit = require('../models/Analytics');
const { protect, adminOnly, generateToken } = require('../middleware/auth');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary (will use .env variables if present)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Check to see if they provided cloudinary envs
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;

let storage;
if (useCloudinary) {
  // Use Cloudinary Storage for production on Render
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'sourcelabs_projects',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      unique_filename: true,
    },
  });
} else {
  // Fallback to local disk storage for local development
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ──────────── ADMIN AUTH ────────────

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: { _id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Admin login failed' });
  }
});

// ──────────── DASHBOARD ────────────

// GET /api/admin/dashboard
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    // Total projects
    const totalProjects = await Product.countDocuments();
    const visibleProjects = await Product.countDocuments({ isVisible: true });
    const featuredProjects = await Product.countDocuments({ isFeatured: true });

    // Total views & clicks across all projects
    const stats = await Product.aggregate([
      { $group: {
        _id: null,
        totalViews: { $sum: '$viewCount' },
        totalClicks: { $sum: '$clickCount' },
      }},
    ]);

    const totalViews = stats[0]?.totalViews || 0;
    const totalClicks = stats[0]?.totalClicks || 0;
    const clickThroughRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

    // Top projects by views
    const topByViews = await Product.find({ isVisible: true })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('name viewCount clickCount images category');

    // Top projects by clicks
    const topByClicks = await Product.find({ isVisible: true })
      .sort({ clickCount: -1 })
      .limit(5)
      .select('name viewCount clickCount images category');

    // Recent projects
    const recentProjects = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name category isVisible isFeatured viewCount clickCount createdAt images');

    // Traffic (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weeklyVisits = await PageVisit.countDocuments({ createdAt: { $gte: weekStart } });

    res.json({
      projects: {
        total: totalProjects,
        visible: visibleProjects,
        featured: featuredProjects,
      },
      engagement: {
        totalViews,
        totalClicks,
        clickThroughRate,
        weeklyVisits,
      },
      topByViews,
      topByClicks,
      recentProjects,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

// ──────────── ANALYTICS ────────────

// GET /api/admin/analytics
router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    // Traffic sources
    const trafficSources = await PageVisit.aggregate([
      { $group: { _id: '$utm_source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Visitor locations
    const visitorLocations = await PageVisit.aggregate([
      { $match: { 'location.countryCode': { $exists: true, $ne: 'XX' } } },
      { $group: { _id: '$location.countryCode', country: { $first: '$location.country' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // VPN usage
    const vpnUsage = await PageVisit.aggregate([
      { $group: {
        _id: null,
        total: { $sum: 1 },
        vpnCount: { $sum: { $cond: ['$location.isVpn', 1, 0] } },
      }},
    ]);

    // Most viewed projects
    const mostViewed = await Product.find({ isVisible: true })
      .sort({ viewCount: -1 })
      .limit(10)
      .select('name viewCount clickCount images category');

    // Click-through rates per project
    const conversionData = await Product.find({ viewCount: { $gt: 0 } })
      .select('name viewCount clickCount')
      .sort({ viewCount: -1 })
      .limit(10);

    const clickRates = conversionData.map(p => ({
      name: p.name,
      views: p.viewCount,
      clicks: p.clickCount,
      rate: p.viewCount > 0 ? ((p.clickCount / p.viewCount) * 100).toFixed(2) : '0.00',
    }));

    // Daily visits (last 30 days)
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyVisits = await PageVisit.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    res.json({
      trafficSources,
      visitorLocations,
      vpnUsage: vpnUsage[0] || { total: 0, vpnCount: 0 },
      mostViewed,
      clickRates,
      dailyVisits,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
});

// ──────────── PROJECT MANAGEMENT ────────────

// GET /api/admin/products — list all (including hidden)
router.get('/products', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (category && category !== 'All') query.category = category;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// POST /api/admin/products — create project
router.post('/products', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');

    let images = (req.files || []).map((file, index) => ({
      url: useCloudinary ? file.path : `/uploads/${file.filename}`,
      alt: data.name || '',
      isMain: index === 0,
    }));

    // If no files uploaded but image URLs provided in data
    if (images.length === 0 && data.images && Array.isArray(data.images)) {
      images = data.images.filter(img => img.url && img.url.trim() !== '');
    }

    // Remove images from data to avoid conflict
    delete data.images;

    // If still no images, add a placeholder
    if (images.length === 0) {
      images = [{ url: 'https://placehold.co/400x400?text=No+Image', alt: data.name || 'Project', isMain: true }];
    }

    const product = new Product({
      ...data,
      images,
    });

    await product.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) io.emit('projectAdded', product);

    res.status(201).json({ product });
  } catch (error) {
    console.error('Create project error:', error.message, error.errors ? JSON.stringify(error.errors) : '');
    res.status(500).json({ message: error.message || 'Failed to create project' });
  }
});

// PUT /api/admin/products/:id — update project
router.put('/products/:id', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || req.body || '{}');
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: useCloudinary ? file.path : `/uploads/${file.filename}`,
        alt: data.name || product.name,
        isMain: false,
      }));
      data.images = [...(data.images || product.images), ...newImages];
    }

    Object.assign(product, data);
    await product.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`product:${product._id}`).emit('projectUpdated', {
        _id: product._id,
        name: product.name,
      });
    }

    res.json({ product });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// DELETE /api/admin/products/:id — delete project
router.delete('/products/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// POST /api/admin/upload — upload images
router.post('/upload', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    const urls = (req.files || []).map(f => `/uploads/${f.filename}`);
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
});

// ──────────── SETTINGS ────────────

// GET /api/admin/settings
router.get('/settings', protect, adminOnly, async (req, res) => {
  try {
    res.json({
      storeName: 'sourceLabs',
      currency: 'USD',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load settings' });
  }
});

module.exports = router;
