const express = require('express');
const { planRoutes } = require('../controllers/routeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Plan and compare regular and optimized routes
router.post('/plan', authMiddleware, planRoutes);

module.exports = router;
