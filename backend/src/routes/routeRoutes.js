const express = require('express');
const { planRoute } = require('../controllers/routeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/plan', authMiddleware, planRoute); // Plan a route

module.exports = router;
