// models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., Electric, Sedan, SUV, Hybrid, Convertible
  inventory: { type: Number, required: true, min: 0 },
  demand: { type: Number, required: true, min: 0, max: 100 }, // Percentage
  location: { type: String },
  // We can add a unique ID if needed, but MongoDB provides _id by default
  // customId: { type: Number, required: true, unique: true } // If we want to maintain existing numeric IDs
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model('Vehicle', vehicleSchema);
