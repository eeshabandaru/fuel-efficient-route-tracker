const express = require('express');
const { body } =  require('express-validator');
const { register, login, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware for token verification

const router = express.Router();

// Validation checks for registration
const registerValidation = [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email')
      .isEmail().withMessage('Please enter a valid email address'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/\d/).withMessage('Password must contain a number')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
      .matches(/[!@#$%^&*]/).withMessage('Password must contain a special character'),
  ];  

router.post('/register', registerValidation, register); // User registration
router.post('/login', login);       // User login
router.get('/profile', authMiddleware, getProfile); // Fetch profile (protected route)

module.exports = router;
