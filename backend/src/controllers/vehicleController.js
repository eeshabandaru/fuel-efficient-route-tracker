const Vehicle = require('../models/Vehicle'); // Import Vehicle model

// POST /vehicle: Add a new vehicle
exports.addVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create({ ...req.body, userId: req.user.userId });
    res.status(201).json({ message: 'Vehicle added successfully', vehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add vehicle', details: error.message });
  }
};

// GET /vehicle: Retrieve all vehicles for the logged-in user
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user.userId });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};
