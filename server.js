// server.js
require('dotenv').config(); // For loading environment variables from a .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Ensure mongoose is required
const path = require('path'); // Import path module

// Import models (optional here, but good for clarity if routes are also in server.js)
// const Vehicle = require('./models/Vehicle');
// const User = require('./models/User');

const vehicleRoutes = require('./routes/vehicleRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Add this line

const app = express();
const PORT = process.env.PORT || 5000; // Backend server port

// --- Middleware ---
// Enable CORS for all routes and origins (adjust for production)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Now, files in ./public/ can be accessed directly.
// e.g., ./public/uploads/vehicles/image.jpg -> http://localhost:PORT/uploads/vehicles/image.jpg

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
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes); // Add this line for admin routes

// --- Global Error Handler (Basic Example) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
