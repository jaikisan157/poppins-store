const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const PageVisit = require('../models/Analytics');
const { protect, adminOnly, generateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for image uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
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
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Revenue
    const revenueToday = await Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]);
    const revenueWeek = await Order.aggregate([
      { $match: { createdAt: { $gte: weekStart }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]);
    const revenueMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: monthStart }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]);

    // Orders
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    // Profit calculator
    const profitData = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
      { $unwind: '$items' },
      { $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        totalCost: { $sum: { $multiply: ['$items.cost', '$items.quantity'] } },
        totalShipping: { $sum: '$pricing.shipping' },
      }},
    ]);

    // Low stock alerts
    const lowStockProducts = await Product.find({
      'inventory.trackQuantity': true,
      $expr: { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] },
    }).select('name inventory.quantity inventory.lowStockThreshold').limit(10);

    // New signups today
    const newSignupsToday = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: todayStart },
    });

    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.json({
      revenue: {
        today: revenueToday[0]?.total || 0,
        week: revenueWeek[0]?.total || 0,
        month: revenueMonth[0]?.total || 0,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
      },
      profit: {
        revenue: profitData[0]?.totalRevenue || 0,
        cost: profitData[0]?.totalCost || 0,
        shipping: profitData[0]?.totalShipping || 0,
        profit: (profitData[0]?.totalRevenue || 0) - (profitData[0]?.totalCost || 0) - (profitData[0]?.totalShipping || 0),
      },
      lowStockProducts,
      newSignupsToday,
      totalCustomers,
      recentOrders,
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

    // Customer locations
    const customerLocations = await PageVisit.aggregate([
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

    // Most viewed products
    const mostViewed = await Product.find({ isVisible: true })
      .sort({ viewCount: -1 })
      .limit(10)
      .select('name viewCount clickCount purchaseCount price.current images');

    // Conversion rates per product
    const conversionData = await Product.find({ viewCount: { $gt: 0 } })
      .select('name viewCount purchaseCount')
      .sort({ viewCount: -1 })
      .limit(10);

    const conversionRates = conversionData.map(p => ({
      name: p.name,
      views: p.viewCount,
      purchases: p.purchaseCount,
      rate: p.viewCount > 0 ? ((p.purchaseCount / p.viewCount) * 100).toFixed(2) : '0.00',
    }));

    // Average order value
    const avgOrderValue = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
      { $group: { _id: null, avg: { $avg: '$pricing.total' } } },
    ]);

    // Orders by country
    const ordersByCountry = await Order.aggregate([
      { $match: { 'customerLocation.country': { $exists: true } } },
      { $group: { _id: '$customerLocation.country', count: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } },
      { $sort: { count: -1 } },
    ]);

    // Orders by source
    const ordersBySource = await Order.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } },
      { $sort: { count: -1 } },
    ]);

    // Daily orders (last 30 days)
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$pricing.total' },
      }},
      { $sort: { _id: 1 } },
    ]);

    res.json({
      trafficSources,
      customerLocations,
      vpnUsage: vpnUsage[0] || { total: 0, vpnCount: 0 },
      mostViewed,
      conversionRates,
      averageOrderValue: avgOrderValue[0]?.avg || 0,
      ordersByCountry,
      ordersBySource,
      dailyOrders,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
});

// ──────────── PRODUCT MANAGEMENT ────────────

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
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// POST /api/admin/products — create product
router.post('/products', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');

    let images = (req.files || []).map((file, index) => ({
      url: `/uploads/${file.filename}`,
      alt: data.name || '',
      isMain: index === 0,
    }));

    // If no files uploaded but image URLs provided in data
    if (images.length === 0 && data.images && Array.isArray(data.images)) {
      // Filter out empty/placeholder image entries
      images = data.images.filter(img => img.url && img.url.trim() !== '');
    }

    // Remove images from data to avoid conflict
    delete data.images;

    // If still no images, add a placeholder
    if (images.length === 0) {
      images = [{ url: 'https://placehold.co/400x400?text=No+Image', alt: data.name || 'Product', isMain: true }];
    }

    const product = new Product({
      ...data,
      images,
    });

    await product.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) io.emit('productAdded', product);

    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error.message, error.errors ? JSON.stringify(error.errors) : '');
    res.status(500).json({ message: error.message || 'Failed to create product' });
  }
});

// PUT /api/admin/products/:id — update product
router.put('/products/:id', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || req.body || '{}');
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        alt: data.name || product.name,
        isMain: false,
      }));
      data.images = [...(data.images || product.images), ...newImages];
    }

    Object.assign(product, data);
    await product.save();

    // Emit real-time price/stock update
    const io = req.app.get('io');
    if (io) {
      io.to(`product:${product._id}`).emit('productUpdated', {
        _id: product._id,
        price: product.price,
        inventory: product.inventory,
      });
    }

    res.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// DELETE /api/admin/products/:id — delete product
router.delete('/products/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
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

// ──────────── ORDER MANAGEMENT ────────────

// GET /api/admin/orders
router.get('/orders', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('user', 'name email');

    res.json({ orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// PUT /api/admin/orders/:id/status — update order status
router.put('/orders/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

    if (status === 'refunded') {
      order.payment.status = 'refunded';
      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 'inventory.quantity': item.quantity },
        });
      }
    }

    await order.save();

    const io = req.app.get('io');
    if (io) io.emit('orderStatusUpdated', { orderId: order._id, status });

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// PUT /api/admin/orders/:id/tracking — update tracking info
router.put('/orders/:id/tracking', protect, adminOnly, async (req, res) => {
  try {
    const { number, carrier, url } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.tracking = { number, carrier, url: url || `https://17track.net/en/track?nums=${number}` };
    if (order.status === 'pending' || order.status === 'processing') {
      order.status = 'shipped';
      order.statusHistory.push({ status: 'shipped', note: `Tracking added: ${number}` });
    }

    await order.save();
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update tracking' });
  }
});

// ──────────── CUSTOMER MANAGEMENT ────────────

// GET /api/admin/customers
router.get('/customers', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, source } = req.query;
    const query = { role: 'customer' };
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'name.first': { $regex: search, $options: 'i' } },
        { 'name.last': { $regex: search, $options: 'i' } },
      ];
    }
    if (source) query.source = source;

    const total = await User.countDocuments(query);
    const customers = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-password');

    res.json({ customers, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

// PUT /api/admin/customers/:id/flag — flag/unflag customer
router.put('/customers/:id/flag', protect, adminOnly, async (req, res) => {
  try {
    const { isFlagged, flagReason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isFlagged, flagReason },
      { new: true }
    );
    res.json({ customer: user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

// ──────────── SETTINGS ────────────

// GET /api/admin/settings
router.get('/settings', protect, adminOnly, async (req, res) => {
  try {
    // For now, return env-based settings
    res.json({
      storeName: 'Poppins',
      currency: 'USD',
      freeShippingThreshold: 50,
      taxRate: 10,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load settings' });
  }
});

module.exports = router;
