const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/darshanease';
    console.log(`Attempting to connect to MongoDB: ${uri}`);
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed initial data if empty
    try {
      const { seedData } = require('./seeder');
      await seedData();
    } catch (seedErr) {
      console.error('Data seeding failed:', seedErr.message);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('--------------------------------------------------');
    console.log('WARNING: The application database is offline.');
    console.log('Please ensure MongoDB is installed and running on your local machine.');
    console.log('You can start it on Windows using: net start MongoDB');
    console.log('--------------------------------------------------');
    isConnected = false;
  }
};

// Middleware to check database connectivity
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is offline. Please make sure MongoDB is running on the host system.'
    });
  }
  next();
};

module.exports = { connectDB, checkDbConnection };
