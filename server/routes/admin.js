import express from 'express';
import User from '../models/User.js';
import SwapRequest from '../models/SwapRequest.js';
import AdminMessage from '../models/AdminMessage.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ban/unban user
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all swap requests
router.get('/swaps', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const swapRequests = await SwapRequest.find(query)
      .populate('requester', 'name email')
      .populate('recipient', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await SwapRequest.countDocuments(query);

    res.json({
      swapRequests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create admin message
router.post('/messages', adminAuth, async (req, res) => {
  try {
    const { title, content, type } = req.body;
    
    const message = new AdminMessage({
      title,
      content,
      type,
      createdBy: req.user._id
    });

    await message.save();
    res.status(201).json({ message });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get platform stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalSwaps = await SwapRequest.countDocuments();
    const completedSwaps = await SwapRequest.countDocuments({ status: 'completed' });
    const pendingSwaps = await SwapRequest.countDocuments({ status: 'pending' });

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentSwaps = await SwapRequest.find()
      .populate('requester', 'name')
      .populate('recipient', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalSwaps,
        completedSwaps,
        pendingSwaps
      },
      recentActivity: {
        users: recentUsers,
        swaps: recentSwaps
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export data
router.get('/export/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    let data;

    switch (type) {
      case 'users':
        data = await User.find().select('-password');
        break;
      case 'swaps':
        data = await SwapRequest.find()
          .populate('requester', 'name email')
          .populate('recipient', 'name email');
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;