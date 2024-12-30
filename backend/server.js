const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./src/routes/authRoutes'); 

console.log('MONGODB_URI is:', process.env.MONGODB_URI);

const app = express();
// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json()); 

// Routes
app.use(authRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
