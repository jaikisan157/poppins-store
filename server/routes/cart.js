const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// GET /api/cart — get user's cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images inventory shortDescription discountPercentage',
    });

    if (!cart) {
      cart = { items: [], itemCount: 0, subtotal: 0 };
    } else {
      // Filter out removed products
      cart.items = cart.items.filter(item => item.product != null);
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = cart.items.reduce((sum, item) => {
        return sum + (item.product.price.current * item.quantity);
      }, 0);
      cart = { ...cart.toObject(), itemCount, subtotal };
    }

    res.json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// POST /api/cart/add — add item to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.inventory.trackQuantity && product.inventory.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item =>
      item.product.toString() === productId &&
      (!variant || (item.variant?.value === variant?.value))
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, variant });
    }

    await cart.save();

    // Populate and return
    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images inventory shortDescription discountPercentage',
    });

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.product.price.current * item.quantity);
    }, 0);

    res.json({ cart: { ...cart.toObject(), itemCount, subtotal } });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// PUT /api/cart/update — update item quantity
router.put('/update', protect, async (req, res) => {
  try {
    const { productId, quantity, variant } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(item =>
      item.product.toString() === productId &&
      (!variant || (item.variant?.value === variant?.value))
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(item =>
        !(item.product.toString() === productId &&
          (!variant || (item.variant?.value === variant?.value)))
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images inventory shortDescription discountPercentage',
    });

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.product.price.current * item.quantity);
    }, 0);

    res.json({ cart: { ...cart.toObject(), itemCount, subtotal } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

// DELETE /api/cart/remove — remove item from cart
router.delete('/remove', protect, async (req, res) => {
  try {
    const { productId, variant } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item =>
      !(item.product.toString() === productId &&
        (!variant || (item.variant?.value === variant?.value)))
    );

    await cart.save();

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price images inventory shortDescription discountPercentage',
    });

    const items = cart?.items || [];
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.product.price.current * item.quantity);
    }, 0);

    res.json({ cart: { items, itemCount, subtotal } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

// DELETE /api/cart/clear — clear cart
router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ cart: { items: [], itemCount: 0, subtotal: 0 } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

module.exports = router;
