const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load environment variables

const User = require('./src/models/User'); // Update the path if needed

async function initializeDB() {
  try {
    // Use the MONGODB_URI from the environment variables
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in the environment variables');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB for initialization.');

    // Check if an admin user exists
    const adminExists = await User.findOne({ adminFlag: true });
    if (!adminExists) {
      const adminUser = new User({
        name: 'Admin User',
        username: 'admin',
        password: await bcrypt.hash('adminpassword', 10), // Replace with secure password
        adminFlag: true,
      });

      await adminUser.save();
      console.log('Admin user created with default credentials.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Execute initialization
initializeDB().then(() => console.log('Database initialization complete.'));
