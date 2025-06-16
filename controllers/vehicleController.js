// controllers/vehicleController.js
const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
exports.getVehicles = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice, maxPrice,
      minYear, maxYear,
      sortBy, sortOrder // 'asc' or 'desc'
    } = req.query;

    let filter = {};
    let priceFilter = {};
    let yearFilter = {};

    if (keyword) {
      const regex = new RegExp(keyword, 'i'); // 'i' for case-insensitive
      filter.$or = [
        { make: regex },
        { model: regex }
      ];
    }

    if (category) {
      filter.category = category;
    }

    // Price filtering
    if (minPrice) {
      const parsedMinPrice = parseFloat(minPrice);
      if (!isNaN(parsedMinPrice)) {
        priceFilter.$gte = parsedMinPrice;
      }
    }
    if (maxPrice) {
      const parsedMaxPrice = parseFloat(maxPrice);
      if (!isNaN(parsedMaxPrice)) {
        priceFilter.$lte = parsedMaxPrice;
      }
    }
    if (Object.keys(priceFilter).length > 0) {
      filter.basePrice = priceFilter;
    }

    // Year filtering
    if (minYear) {
      const parsedMinYear = parseInt(minYear, 10);
      if (!isNaN(parsedMinYear)) {
        yearFilter.$gte = parsedMinYear;
      }
    }
    if (maxYear) {
      const parsedMaxYear = parseInt(maxYear, 10);
      if (!isNaN(parsedMaxYear)) {
        yearFilter.$lte = parsedMaxYear;
      }
    }
    if (Object.keys(yearFilter).length > 0) {
      filter.year = yearFilter;
    }

    let sort = {};
    if (sortBy) {
      // Ensure sortBy is a valid field to prevent injection, though Mongoose typically handles this.
      // For enhanced security, one might validate sortBy against a list of allowed fields.
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    const vehicles = await Vehicle.find(filter).sort(sort);

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
  const { make, model, year, basePrice, category, inventory, demand, location, imageUrl } = req.body; // Add imageUrl
  try {
    const newVehicle = new Vehicle({
      make, model, year, basePrice, category, inventory, demand, location, imageUrl // Add imageUrl
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
  const { make, model, year, basePrice, category, inventory, demand, location, imageUrl } = req.body; // Add imageUrl
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
    if (imageUrl !== undefined) { // Allows clearing imageUrl by sending "" or null, or updating it
       vehicle.imageUrl = imageUrl;
    }

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
