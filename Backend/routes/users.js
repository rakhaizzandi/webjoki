const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

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

// Get all users (admin)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user (admin)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { nickname, role } = req.body;
    const user = await User.update(req.params.id, { nickname, role });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user (admin)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Promote user to admin (admin only)
router.put('/:id/promote', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.update(req.params.id, { role: 'admin' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get dashboard stats (admin)
router.get('/stats/dashboard', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    const orders = await Order.getAll();
    
    const totalUsers = users.length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    res.json({
      totalUsers,
      totalAdmins,
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;