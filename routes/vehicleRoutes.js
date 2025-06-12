// routes/vehicleRoutes.js
const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');
const { protect, admin } = require('../middleware/authMiddleware'); // Import both

// Import auth middleware (to be created in a later step)
// const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getVehicles) // Public
  .post(protect, admin, createVehicle); // Protected by auth & admin role

router.route('/:id')
  .get(getVehicleById) // Public
  .put(protect, admin, updateVehicle) // Protected by auth & admin role
  .delete(protect, admin, deleteVehicle); // Protected by auth & admin role

module.exports = router;
