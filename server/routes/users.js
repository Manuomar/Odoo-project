import express from 'express';
import User from '../models/User.js';
import SwapRequest from '../models/SwapRequest.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'location', 'skillsOffered', 'skillsWanted', 'availability', 'isPublic'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, filteredUpdates, { new: true });
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Browse users
router.get('/browse', auth, async (req, res) => {
  try {
    const { skill, location, page = 1, limit = 10 } = req.query;
    const query = { isPublic: true, isActive: true, _id: { $ne: req.user._id } };

    if (skill) {
      query.$or = [
        { 'skillsOffered.name': { $regex: skill, $options: 'i' } },
        { 'skillsWanted.name': { $regex: skill, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastActive: -1 });

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

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-email');

    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isPublic && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Profile is private' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;