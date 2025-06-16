// controllers/adminController.js
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

// @desc    Get basic application statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAppStatistics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const vehicleCount = await Vehicle.countDocuments();

    // Optional: Vehicle counts by category
    const vehiclesByCategory = await Vehicle.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } } // Sort by category name
    ]);

    res.json({
      userCount,
      vehicleCount,
      vehiclesByCategory
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error getting statistics');
  }
};
