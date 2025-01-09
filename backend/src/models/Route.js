const mongoose = require('mongoose');

// Define the Route schema
const RouteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stops: { type: Array, required: true }, // List of stops
  regularRoute: { type: Object, required: true }, // Regular route data
  optimizedRoute: { type: Object, required: true }, // Optimized route data
  optimizedFuelConsumption: { type: Number, required: true }, // Fuel consumption for optimized route
});

module.exports = mongoose.model('Route', RouteSchema);
