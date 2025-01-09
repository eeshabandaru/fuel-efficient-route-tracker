const express = require('express');
const { body } = require('express-validator');
const { addVehicle, getVehicles, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation for vehicle input using express-validator
const vehicleValidation = [
  body('make').notEmpty().withMessage('Make is required'), // Ensure 'make' is not empty
  body('model').notEmpty().withMessage('Model is required'), // Ensure 'model' is not empty
  body('year')
    .isInt({ min: 1886, max: new Date().getFullYear() }) // Validate 'year' is between 1886 and current year
    .withMessage(`Year must be between 1886 and ${new Date().getFullYear()}`),
  body('fuelEfficiency')
    .isFloat({ min: 1 }) // Ensure 'fuelEfficiency' is a positive number
    .withMessage('Fuel efficiency must be a positive number'),
];

// Add a new vehicle
router.post('/', authMiddleware, vehicleValidation, addVehicle);

// Get all vehicles for the logged-in user
router.get('/', authMiddleware, getVehicles);

// Update an existing vehicle
router.put('/:id', authMiddleware, vehicleValidation, updateVehicle);

// Delete an existing vehicle
router.delete('/:id', authMiddleware, deleteVehicle);

module.exports = router;
