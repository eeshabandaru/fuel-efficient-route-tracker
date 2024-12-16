const User = require('../models/User'); // Import User model
const bcrypt = require('bcrypt');       // For password hashing
const jwt = require('jsonwebtoken');    // For token generation

// POST /register: Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save a new user
    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

// POST /login: Authenticate the user and return a token
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

// GET /profile: Fetch the user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); // Exclude password
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};
