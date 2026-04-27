const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Middleware to check admin role
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create order
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('USER:', req.user);
    console.log('BODY:', req.body);

    const order = await Order.create({
      ...req.body,
      userId: req.user.userId
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get user orders
router.get('/', verifyToken, async (req, res) => {
  console.log('GET ORDERS USER:', req.user.userId);

  try {
    const orders = await Order.findByUserId(req.user.userId);
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all orders (admin)
router.get('/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update order status (admin)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.updateStatus(req.params.id, status);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete order (admin)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Order.delete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;