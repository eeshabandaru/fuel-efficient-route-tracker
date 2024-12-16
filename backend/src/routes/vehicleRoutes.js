const express = require('express');
const { addVehicle, getVehicles } = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, addVehicle); // Add a vehicle
router.get('/', authMiddleware, getVehicles); // Get all vehicles

module.exports = router;
