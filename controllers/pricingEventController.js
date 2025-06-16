// controllers/pricingEventController.js
const PriceLog = require('../models/PriceLog');
const Vehicle = require('../models/Vehicle'); // To validate vehicleId if needed

// @desc    Log a pricing event
// @route   POST /api/pricing-events/log
// @access  Private (Authenticated users)
exports.logPricingEvent = async (req, res) => {
  const {
    vehicleId,
    calculatedPrice,
    basePriceSnapshot,
    categorySnapshot,
    yearSnapshot,
    vehicleDemandSnapshot,
    vehicleInventorySnapshot,
    realTimeFactorsSnapshot, // Should be an object: { demandMultiplier, seasonalAdjustment, ... }
    pricingStrategyUsed
  } = req.body;

  // Basic validation for required fields
  if (!vehicleId || calculatedPrice === undefined || basePriceSnapshot === undefined || !categorySnapshot || yearSnapshot === undefined || vehicleDemandSnapshot === undefined || vehicleInventorySnapshot === undefined || !realTimeFactorsSnapshot || !pricingStrategyUsed) {
    return res.status(400).json({ msg: 'Missing required fields for price log.' });
  }

  // Optional: Validate that vehicleId exists (can be skipped for performance if frontend is trusted or if logs for deleted vehicles are acceptable)
  // const vehicleExists = await Vehicle.findById(vehicleId);
  // if (!vehicleExists) {
  //   return res.status(404).json({ msg: 'Vehicle referenced in log not found.' });
  // }

  try {
    const newPriceLog = new PriceLog({
      vehicleId,
      // timestamp is defaulted by schema
      calculatedPrice,
      basePriceSnapshot,
      categorySnapshot,
      yearSnapshot,
      vehicleDemandSnapshot,
      vehicleInventorySnapshot,
      realTimeFactorsSnapshot, // Ensure this is passed as an object from frontend
      pricingStrategyUsed
    });

    await newPriceLog.save();
    // Respond with a minimal success message, no need to send the full log back usually
    res.status(201).json({ msg: 'Pricing event logged successfully.' });

  } catch (err) {
    console.error('Error logging pricing event:', err.message);
    // Check for specific errors, e.g., validation errors from Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({ msg: 'Validation error for price log data.', errors: err.errors });
    }
    res.status(500).send('Server Error while logging pricing event.');
  }
};
