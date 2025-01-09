const express = require('express');
const { planRoutes, getRouteById } = require('../controllers/routeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Endpoint to plan and compare routes
router.post('/plan', authMiddleware, planRoutes);

// Endpoint to fetch a saved route by its ID
router.get('/:id', authMiddleware, getRouteById);

module.exports = router;
