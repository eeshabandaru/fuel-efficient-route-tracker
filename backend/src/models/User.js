const mongoose = require('mongoose');

// Define the User schema for MongoDB
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
});

// Export the User model
module.exports = mongoose.model('User', UserSchema);
