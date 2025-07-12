import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import SwapRequest from './models/SwapRequest.js';
//  import { MongoMemoryServer } from 'mongoose-memory-server';

const seedDatabase = async () => {
  try {
    // Connect to in-memory MongoDB
    // const mongod = await MongoMemoryServer.create();
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await SwapRequest.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@skillswap.com',
      password: 'admin123',
      role: 'admin',
      skillsOffered: [
        { name: 'Project Management', level: 'Advanced', description: 'Expert in Agile and Scrum methodologies' },
        { name: 'Leadership', level: 'Advanced', description: 'Team leadership and management' }
      ],
      skillsWanted: [
        { name: 'Data Science', level: 'Beginner', description: 'Want to learn Python and ML' }
      ],
      location: 'San Francisco, CA',
      availability: {
        weekdays: true,
        weekends: true,
        evenings: true,
        mornings: false
      },
      isPublic: true
    });

    // Create demo user
    const demoUser = new User({
      name: 'Demo User',
      email: 'user@skillswap.com',
      password: 'user123',
      role: 'user',
      skillsOffered: [
        { name: 'JavaScript', level: 'Advanced', description: 'Full-stack JavaScript development' },
        { name: 'React', level: 'Advanced', description: 'Modern React with hooks and context' },
        { name: 'Node.js', level: 'Intermediate', description: 'Backend development with Express' }
      ],
      skillsWanted: [
        { name: 'Python', level: 'Beginner', description: 'Want to learn Python for data analysis' },
        { name: 'Design', level: 'Beginner', description: 'UI/UX design principles' }
      ],
      location: 'New York, NY',
      availability: {
        weekdays: false,
        weekends: true,
        evenings: true,
        mornings: false
      },
      isPublic: true,
      rating: { average: 4.5, count: 12 }
    });

    // Create additional demo users
    const users = [
      {
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        password: 'password123',
        skillsOffered: [
          { name: 'Graphic Design', level: 'Advanced', description: 'Brand design and visual identity' },
          { name: 'Adobe Photoshop', level: 'Advanced', description: 'Photo editing and manipulation' }
        ],
        skillsWanted: [
          { name: 'Web Development', level: 'Beginner', description: 'Want to build my own website' }
        ],
        location: 'Los Angeles, CA',
        availability: { weekdays: true, weekends: false, evenings: true, mornings: true },
        rating: { average: 4.8, count: 25 }
      },
      {
        name: 'Michael Rodriguez',
        email: 'michael@example.com',
        password: 'password123',
        skillsOffered: [
          { name: 'Photography', level: 'Advanced', description: 'Portrait and landscape photography' },
          { name: 'Video Editing', level: 'Intermediate', description: 'Premiere Pro and After Effects' }
        ],
        skillsWanted: [
          { name: 'Marketing', level: 'Beginner', description: 'Digital marketing strategies' }
        ],
        location: 'Austin, TX',
        availability: { weekdays: false, weekends: true, evenings: true, mornings: false },
        rating: { average: 4.6, count: 18 }
      },
      {
        name: 'Emily Johnson',
        email: 'emily@example.com',
        password: 'password123',
        skillsOffered: [
          { name: 'Content Writing', level: 'Advanced', description: 'Blog posts and copywriting' },
          { name: 'SEO', level: 'Intermediate', description: 'Search engine optimization' }
        ],
        skillsWanted: [
          { name: 'Social Media Management', level: 'Intermediate', description: 'Growing social presence' }
        ],
        location: 'Seattle, WA',
        availability: { weekdays: true, weekends: true, evenings: false, mornings: true },
        rating: { average: 4.7, count: 32 }
      },
      {
        name: 'David Kim',
        email: 'david@example.com',
        password: 'password123',
        skillsOffered: [
          { name: 'Python', level: 'Advanced', description: 'Data science and machine learning' },
          { name: 'Machine Learning', level: 'Intermediate', description: 'TensorFlow and scikit-learn' }
        ],
        skillsWanted: [
          { name: 'Frontend Development', level: 'Beginner', description: 'React and modern CSS' }
        ],
        location: 'Boston, MA',
        availability: { weekdays: true, weekends: false, evenings: true, mornings: false },
        rating: { average: 4.9, count: 15 }
      },
      {
        name: 'Lisa Wang',
        email: 'lisa@example.com',
        password: 'password123',
        skillsOffered: [
          { name: 'Digital Marketing', level: 'Advanced', description: 'Google Ads and Facebook marketing' },
          { name: 'Analytics', level: 'Intermediate', description: 'Google Analytics and data interpretation' }
        ],
        skillsWanted: [
          { name: 'Graphic Design', level: 'Beginner', description: 'Creating marketing materials' }
        ],
        location: 'Chicago, IL',
        availability: { weekdays: true, weekends: true, evenings: false, mornings: true },
        rating: { average: 4.4, count: 28 }
      }
    ];

    // Save all users
    await adminUser.save();
    await demoUser.save();
    
    const savedUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      savedUsers.push(user);
    }

    // Create some sample swap requests
    const swapRequests = [
      {
        requester: demoUser._id,
        recipient: savedUsers[0]._id, // Sarah
        skillOffered: { name: 'JavaScript', level: 'Advanced' },
        skillRequested: { name: 'Graphic Design', level: 'Advanced' },
        message: 'Hi Sarah! I\'d love to learn graphic design from you. I can teach you JavaScript in return.',
        status: 'pending'
      },
      {
        requester: savedUsers[1]._id, // Michael
        recipient: demoUser._id,
        skillOffered: { name: 'Photography', level: 'Advanced' },
        skillRequested: { name: 'React', level: 'Advanced' },
        message: 'Hey! I\'m interested in learning React. I can teach you photography techniques.',
        status: 'accepted',
        meetingDetails: 'Let\'s meet this Saturday at 2 PM via Zoom for our first session.'
      },
      {
        requester: savedUsers[2]._id, // Emily
        recipient: savedUsers[3]._id, // David
        skillOffered: { name: 'Content Writing', level: 'Advanced' },
        skillRequested: { name: 'Python', level: 'Advanced' },
        message: 'I\'d like to learn Python for data analysis. I can help you with content writing.',
        status: 'completed'
      },
      {
        requester: adminUser._id,
        recipient: savedUsers[4]._id, // Lisa
        skillOffered: { name: 'Project Management', level: 'Advanced' },
        skillRequested: { name: 'Digital Marketing', level: 'Advanced' },
        message: 'Interested in learning digital marketing strategies. I can share project management expertise.',
        status: 'pending'
      }
    ];

    for (const swapData of swapRequests) {
      const swap = new SwapRequest(swapData);
      await swap.save();
    }

    // console.log('Seed data created successfully!');
    // console.log('\n=== ADMIN CREDENTIALS ===');
    // console.log('Email: admin@skillswap.com');
    // console.log('Password: admin123');
    // console.log('Role: admin');
    // console.log('\n=== DEMO USER CREDENTIALS ===');
    // console.log('Email: user@skillswap.com');
    // console.log('Password: user123');
    // console.log('Role: user');
    // console.log('\n=== OTHER TEST USERS ===');
    // users.forEach(user => {
    //   console.log(`${user.name}: ${user.email} / password123`);
    // });
    
    await mongoose.disconnect();
    // await mongod.stop();
    console.log('\nDatabase seeded and disconnected successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Only run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;