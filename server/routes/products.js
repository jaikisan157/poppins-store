const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, optionalAuth } = require('../middleware/auth');
const { getLocationFromIP } = require('../utils/ipinfo');

// GET /api/products — list products with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { isVisible: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (minPrice || maxPrice) {
      query['price.current'] = {};
      if (minPrice) query['price.current'].$gte = Number(minPrice);
      if (maxPrice) query['price.current'].$lte = Number(maxPrice);
    }

    const sortObj = {};
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : (order === 'asc' ? 1 : -1);

    if (sortField === 'price') {
      sortObj['price.current'] = sortOrder;
    } else if (sortField === 'name') {
      sortObj.name = sortOrder;
    } else {
      sortObj[sortField] = sortOrder;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortObj)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      products,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// GET /api/products/featured — featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isVisible: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(8);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch featured products' });
  }
});

// GET /api/products/categories — get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isVisible: true });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// GET /api/products/:id — get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    // Get related products (same category)
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isVisible: true,
    }).limit(4);

    res.json({
      product: { ...product.toObject(), relatedProducts },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// POST /api/products/:id/check-delivery — check delivery availability
router.post('/:id/check-delivery', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { countryCode, zipCode } = req.body;

    // Get IP info for VPN detection
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const locationData = await getLocationFromIP(ip);

    const isVpn = locationData.isVpn || locationData.isProxy;

    // Check if product ships to this country
    let available = true;
    let message = '';

    if (product.shipping.countries && product.shipping.countries.length > 0) {
      available = product.shipping.countries.includes(countryCode.toUpperCase());
      message = available
        ? `Delivery available to ${countryCode}. Estimated 7-14 business days.`
        : `Sorry, this product does not ship to ${countryCode}.`;
    } else {
      message = `Delivery available to ${countryCode}. Estimated 7-14 business days.`;
    }

    res.json({ available, message, isVpn });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check delivery' });
  }
});

// POST /api/products/:id/click — track product click
router.post('/:id/click', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { clickCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track click' });
  }
});

module.exports = router;
