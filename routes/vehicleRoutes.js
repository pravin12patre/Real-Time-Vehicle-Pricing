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
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// Import auth middleware (to be created in a later step)
// const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getVehicles) // Publicly accessible
  .post(protect, createVehicle); // Protected: only authenticated users can create

router.route('/:id')
  .get(getVehicleById) // Publicly accessible
  .put(protect, updateVehicle) // Protected: only authenticated users can update
  .delete(protect, deleteVehicle); // Protected: only authenticated users can delete

module.exports = router;
