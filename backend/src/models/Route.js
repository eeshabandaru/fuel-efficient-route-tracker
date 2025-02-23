const mongoose = require('mongoose');

// Define the Route schema
const RouteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stops: { type: Array, required: true }, // List of stops
  regularRoute: { type: Object, required: true }, // Regular route data
  // removed required: true from these two fields for now for testing
  // just waiting for ai team to finish the model 
  optimizedRoute: { type: Object}, // Optimized route data
  optimizedFuelConsumption: { type: Number}, // Fuel consumption for optimized route
});

module.exports = mongoose.model('Route', RouteSchema);
