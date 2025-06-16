// models/PriceLog.js
const mongoose = require('mongoose');

const priceLogSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle', // Reference to the Vehicle model
    required: true,
    index: true // Index for faster queries on vehicleId
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true // Index for time-series based queries
  },
  calculatedPrice: {
    type: Number,
    required: true
  },
  // Snapshot of key vehicle details at the time of logging
  basePriceSnapshot: {
    type: Number,
    required: true
  },
  categorySnapshot: {
    type: String,
    required: true
  },
  yearSnapshot: {
    type: Number,
    required: true
  },
  vehicleDemandSnapshot: { // Demand specific to this vehicle model
    type: Number,
    required: true
  },
  vehicleInventorySnapshot: { // Inventory specific to this vehicle model
    type: Number,
    required: true
  },
  // Snapshot of real-time market factors at the time of logging
  realTimeFactorsSnapshot: {
    demandMultiplier: { type: Number, required: true },
    seasonalAdjustment: { type: Number, required: true },
    competitorPricing: { type: Number, required: true },
    inventoryLevel: { type: Number, required: true } // Global inventory level factor
  },
  pricingStrategyUsed: {
    type: String,
    enum: ['dynamic', 'competitive', 'fixed'],
    required: true
  }
  // Potential future additions:
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If tied to a specific user action
  // userFeedback: { type: String }, // e.g., 'clicked', 'favorited', 'purchased_inquiry'
  // sessionId: { type: String }
}, {
  timestamps: { createdAt: 'loggedAt', updatedAt: false } // Use 'loggedAt' for creation, disable 'updatedAt'
});

// Compound index example if frequently querying by vehicle and time
// priceLogSchema.index({ vehicleId: 1, timestamp: -1 });

module.exports = mongoose.model('PriceLog', priceLogSchema);
