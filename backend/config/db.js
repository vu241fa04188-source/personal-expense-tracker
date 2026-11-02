const mongoose = require('mongoose');
const dns = require('dns');

// Apply DNS workaround on Windows if needed
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (e) {
    // Ignore if not supported
  }
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Wait 5 seconds for Atlas
    });
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(` Cloud MongoDB Atlas connection failed (${error.message}).`);
    
    // If running locally, automatically fall back to local MongoDB
    if (process.env.NODE_ENV !== 'production' || process.platform === 'win32') {
      try {
        console.log(' Connecting to local MongoDB on your laptop...');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/expense_tracker');
        console.log(` Successfully connected to Local MongoDB: ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.error(' Local MongoDB connection also failed:', localErr.message);
      }
    }
    
    console.error(' Tip: Ensure 0.0.0.0/0 (Allow from anywhere) is active in MongoDB Atlas Network Access');
  }
};

module.exports = connectDB;
