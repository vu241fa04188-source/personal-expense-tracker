const mongoose = require('mongoose');
const dns = require('dns');

// If using MongoDB Atlas SRV URI, set DNS servers to Google DNS to avoid querySrv ECONNREFUSED on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if not supported in environment
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` Error connecting to MongoDB: ${error.message}`);
    console.error(' Tip: Ensure your MONGO_URI in .env is correct and IP 0.0.0.0/0 is whitelisted in MongoDB Atlas');
    process.exit(1);
  }
};

module.exports = connectDB;
