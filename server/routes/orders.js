const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { getLocationFromIP } = require('../utils/ipinfo');

// POST /api/orders/checkout — place an order
router.post('/checkout', protect, async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod } = req.body;

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Build order items and calculate totals
    const items = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (!product) continue;

      // Check stock
      if (product.inventory.trackQuantity && product.inventory.quantity < cartItem.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Only ${product.inventory.quantity} left.`,
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price.current,
        cost: product.price.cost || 0,
        quantity: cartItem.quantity,
        variant: cartItem.variant,
      });

      subtotal += product.price.current * cartItem.quantity;
    }

    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    // Get location
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const location = await getLocationFromIP(ip);

    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      billingAddress,
      pricing: { subtotal, shipping, tax, total },
      payment: {
        method: paymentMethod || 'cod',
        status: paymentMethod === 'cod' ? 'pending' : 'pending',
      },
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
      // Analytics
      source: req.user.source,
      medium: req.user.medium,
      campaign: req.user.campaign,
      customerIp: ip,
      customerLocation: {
        country: location.country,
        city: location.city,
      },
    });

    await order.save();

    // Update product stock and purchase count
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          'inventory.quantity': -item.quantity,
          purchaseCount: item.quantity,
        },
      });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalSpent: total, orderCount: 1 },
      lastActive: new Date(),
    });

    // Clear cart
    await Cart.findOneAndDelete({ user: req.user._id });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('newOrder', {
        orderNumber: order.orderNumber,
        total: order.pricing.total,
        status: order.status,
      });
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        pricing: order.pricing,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
});

// GET /api/orders/my — get current user's orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// GET /api/orders/track/:orderNumber — track order by number
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [
        { orderNumber: req.params.orderNumber },
        { 'tracking.number': req.params.orderNumber },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track order' });
  }
});

module.exports = router;
