// server.js
require('dotenv').config(); // For loading environment variables from a .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Ensure mongoose is required

// Import models (optional here, but good for clarity if routes are also in server.js)
// const Vehicle = require('./models/Vehicle');
// const User = require('./models/User');

const vehicleRoutes = require('./routes/vehicleRoutes');
const authRoutes = require('./routes/authRoutes'); // Add this

const app = express();
const PORT = process.env.PORT || 5000; // Backend server port

// --- Middleware ---
// Enable CORS for all routes and origins (adjust for production)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Basic Routes (Placeholders) ---
app.get('/', (req, res) => {
  res.send('Vehicle Pricing System API Running!');
});

// --- API Routes ---
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/auth', authRoutes); // Add this

// --- Global Error Handler (Basic Example) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
