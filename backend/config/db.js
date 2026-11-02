const mongoose = require('mongoose');
const dns = require('dns');

// Apply Google DNS workaround on Windows where SRV records are sometimes blocked by local router DNS
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (e) {
    // Ignore
  }
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(` MongoDB Connected to Atlas: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Atlas Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
