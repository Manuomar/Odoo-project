import express from 'express';
import SwapRequest from '../models/SwapRequest.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create swap request
router.post('/', auth, async (req, res) => {
  try {
    const { recipientId, skillOffered, skillRequested, message } = req.body;

    if (req.user._id.toString() === recipientId) {
      return res.status(400).json({ error: 'Cannot send swap request to yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const swapRequest = new SwapRequest({
      requester: req.user._id,
      recipient: recipientId,
      skillOffered,
      skillRequested,
      message
    });

    await swapRequest.save();
    await swapRequest.populate(['requester', 'recipient']);

    res.status(201).json({ swapRequest });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's swap requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const { status, type = 'all' } = req.query;
    let query = {};

    if (type === 'sent') {
      query.requester = req.user._id;
    } else if (type === 'received') {
      query.recipient = req.user._id;
    } else {
      query.$or = [
        { requester: req.user._id },
        { recipient: req.user._id }
      ];
    }

    if (status) {
      query.status = status;
    }

    const swapRequests = await SwapRequest.find(query)
      .populate('requester', 'name profilePhoto rating')
      .populate('recipient', 'name profilePhoto rating')
      .sort({ createdAt: -1 });

    res.json({ swapRequests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update swap request status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, meetingDetails } = req.body;
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    // Check permissions
    if (status === 'accepted' || status === 'rejected') {
      if (swapRequest.recipient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Only recipient can accept/reject requests' });
      }
    } else if (status === 'cancelled') {
      if (swapRequest.requester.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Only requester can cancel requests' });
      }
    }

    swapRequest.status = status;
    if (meetingDetails) {
      swapRequest.meetingDetails = meetingDetails;
    }

    await swapRequest.save();
    await swapRequest.populate(['requester', 'recipient']);

    res.json({ swapRequest });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete swap request
router.delete('/:id', auth, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only requester can delete requests' });
    }

    if (swapRequest.status !== 'pending' && swapRequest.status !== 'rejected') {
      return res.status(400).json({ error: 'Can only delete pending or rejected requests' });
    }

    await SwapRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Swap request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add feedback
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (swapRequest.status !== 'completed') {
      return res.status(400).json({ error: 'Can only add feedback to completed swaps' });
    }

    const isRequester = swapRequest.requester.toString() === req.user._id.toString();
    const isRecipient = swapRequest.recipient.toString() === req.user._id.toString();

    if (!isRequester && !isRecipient) {
      return res.status(403).json({ error: 'Not authorized to add feedback' });
    }

    const feedbackField = isRequester ? 'requesterFeedback' : 'recipientFeedback';
    swapRequest.feedback[feedbackField] = {
      rating,
      comment,
      createdAt: new Date()
    };

    await swapRequest.save();

    // Update user rating
    const targetUserId = isRequester ? swapRequest.recipient : swapRequest.requester;
    const targetUser = await User.findById(targetUserId);
    
    if (targetUser) {
      const newCount = targetUser.rating.count + 1;
      const newAverage = ((targetUser.rating.average * targetUser.rating.count) + rating) / newCount;
      
      targetUser.rating.average = Math.round(newAverage * 10) / 10;
      targetUser.rating.count = newCount;
      await targetUser.save();
    }

    res.json({ swapRequest });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;