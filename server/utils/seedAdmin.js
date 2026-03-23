require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    const admin = new User({
      email: 'admin@poppins.com',
      password: 'admin123456',
      name: { first: 'Admin', last: 'User' },
      role: 'admin',
      isActive: true,
    });

    await admin.save();
    console.log('✅ Admin user created!');
    console.log('   Email: admin@poppins.com');
    console.log('   Password: admin123456');
    console.log('   ⚠️  Please change the password after first login!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedAdmin();
