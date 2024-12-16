const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware for token verification

const router = express.Router();

router.post('/register', register); // User registration
router.post('/login', login);       // User login
router.get('/profile', authMiddleware, getProfile); // Fetch profile (protected route)

module.exports = router;
