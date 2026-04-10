const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products — list projects with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
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

    const sortObj = {};
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : (order === 'asc' ? 1 : -1);

    if (sortField === 'name') {
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
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// GET /api/products/featured — featured projects
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isVisible: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(8);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch featured projects' });
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

// GET /api/products/:id — get single project
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    // Get related projects (same category)
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isVisible: true,
    }).limit(4);

    res.json({
      product: { ...product.toObject(), relatedProducts },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

// POST /api/products/:id/click — track "Get It" click
router.post('/:id/click', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { clickCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track click' });
  }
});

module.exports = router;
