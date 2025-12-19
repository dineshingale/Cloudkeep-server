const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import DB Configuration
const connectDB = require('./config/db');

// Import Routes
const recordRoutes = require('./routes/record.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data

// Routes
app.use('/api/records', recordRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('CloudKeep Server is Running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});