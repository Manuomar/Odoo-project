import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillOffered: {
    name: { type: String, required: true },
    level: { type: String, required: true }
  },
  skillRequested: {
    name: { type: String, required: true },
    level: { type: String, required: true }
  },
  message: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  meetingDetails: {
    type: String
  },
  feedback: {
    requesterFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: Date
    },
    recipientFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: Date
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('SwapRequest', swapRequestSchema);