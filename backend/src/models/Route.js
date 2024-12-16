const mongoose = require('mongoose');

// Define the Route schema
const RouteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stops: { type: Array, required: true }, // List of stops
  distance: { type: Number, required: true }, // Total route distance
  geoapifyData: { type: Object }, // Raw Geoapify response
});

module.exports = mongoose.model('Route', RouteSchema);
