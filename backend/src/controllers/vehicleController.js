const Vehicle = require('../models/Vehicle');
const { validationResult } = require('express-validator');

// Add a new vehicle
exports.addVehicle = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Return validation errors
  }

  try {
    // Create and save a new vehicle associated with the logged-in user
    const vehicle = await Vehicle.create({ ...req.body, userId: req.user.userId });
    res.status(201).json({ message: 'Vehicle added successfully', vehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add vehicle', details: error.message });
  }
};

// Update an existing vehicle
exports.updateVehicle = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Return validation errors
  }

  try {
    const { id } = req.params; // Extract vehicle ID from request parameters
    // Find and update the vehicle in the database
    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { _id: id, userId: req.user.userId }, // Ensure the vehicle belongs to the logged-in user
      req.body, // Update fields
      { new: true } // Return the updated document
    );

    if (!updatedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' }); // Handle case where vehicle doesn't exist
    }

    res.status(200).json({ message: 'Vehicle updated successfully', vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vehicle', details: error.message });
  }
};

// Delete an existing vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params; // Extract vehicle ID from request parameters
    // Find and delete the vehicle from the database
    const deletedVehicle = await Vehicle.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!deletedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' }); // Handle case where vehicle doesn't exist
    }

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vehicle', details: error.message });
  }
};
