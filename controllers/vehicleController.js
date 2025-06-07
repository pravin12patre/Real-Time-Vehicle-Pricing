// controllers/vehicleController.js
const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get single vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Public
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vehicle not found (invalid ID format)' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private (to be protected later)
exports.createVehicle = async (req, res) => {
  const { make, model, year, basePrice, category, inventory, demand, location } = req.body;
  try {
    const newVehicle = new Vehicle({
      make, model, year, basePrice, category, inventory, demand, location
    });
    const vehicle = await newVehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (to be protected later)
exports.updateVehicle = async (req, res) => {
  const { make, model, year, basePrice, category, inventory, demand, location } = req.body;
  try {
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }

    // Update fields
    vehicle.make = make || vehicle.make;
    vehicle.model = model || vehicle.model;
    vehicle.year = year || vehicle.year;
    vehicle.basePrice = basePrice || vehicle.basePrice;
    vehicle.category = category || vehicle.category;
    vehicle.inventory = inventory === undefined ? vehicle.inventory : inventory;
    vehicle.demand = demand === undefined ? vehicle.demand : demand;
    vehicle.location = location || vehicle.location;

    vehicle = await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vehicle not found (invalid ID format)' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (to be protected later)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }

    await vehicle.deleteOne(); // Uses deleteOne available on Mongoose documents
    res.json({ msg: 'Vehicle removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vehicle not found (invalid ID format)' });
    }
    res.status(500).send('Server Error');
  }
};
