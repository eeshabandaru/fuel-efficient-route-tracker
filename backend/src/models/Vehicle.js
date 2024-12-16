const mongoose = require('mongoose');

// Define the Vehicle schema
const VehicleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  fuelEfficiency: { type: Number, required: true }, // Fuel efficiency in km/L or MPG
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
