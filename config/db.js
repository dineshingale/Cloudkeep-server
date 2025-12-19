const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB Connection Failed:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;