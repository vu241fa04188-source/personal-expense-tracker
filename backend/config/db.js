const mongoose = require('mongoose');
const dns = require('dns');

// Only apply DNS workaround on Windows where SRV records are sometimes blocked by local router DNS
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
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of hanging
    });
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` Error connecting to MongoDB: ${error.message}`);
    console.error(' Tip: Ensure 0.0.0.0/0 (Allow from anywhere) is active in MongoDB Atlas Network Access');
    // Do not call process.exit(1) on Render so the web server stays healthy and can retry
  }
};

module.exports = connectDB;
