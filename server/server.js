import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
// import { MongoMemoryServer } from 'mongoose-memory-server';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import swapRoutes from './routes/swaps.js';
import adminRoutes from './routes/admin.js';
import seedDatabase from './seedData.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (using in-memory server for development)
async function connectToDatabase() {
  try {
    let mongoUri;
    mongoUri = process.env.MONGODB_URI;
    // if (process.env.MONGODB_URI) {
    //   // Use provided MongoDB URI if available
    //   mongoUri = process.env.MONGODB_URI;
    // } else {
    //   // Use in-memory MongoDB server for development
    //   const mongod = await MongoMemoryServer.create();
    //   mongoUri = mongod.getUri();
    //   console.log('Using in-memory MongoDB server for development');
    // }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Auto-seed database with admin credentials if no users exist
    const User = (await import('./models/User.js')).default;
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found, seeding database with initial data...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Initialize database connection
connectToDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});