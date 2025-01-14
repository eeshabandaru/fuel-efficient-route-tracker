const axios = require('axios');
const Route = require('../models/Route');

// Plan and compare routes
exports.planRoutes = async (req, res) => {
  try {
    const { stops, fuelEfficiency } = req.body; // Extract stops and fuel efficiency from the request body

    // Validate that at least two stops are provided
    if (!stops || stops.length < 2) {
      return res.status(400).json({ error: 'At least two stops are required to plan a route' });
    }

    // Build Geoapify URL with query params
    const url = `https://api.geoapify.com/v1/routing?waypoints=${stops.join('|')}&mode=drive&apiKey=${process.env.GEOAPIFY_API_KEY}`;
    
    // Make GET request
    const regularResponse = await axios.get(url);

    // Extract route details
    const regularRoute = regularResponse.data.features[0].properties;


    // Save the route to MongoDB
    const savedRoute = await Route.create({
      userId: req.user.userId, // Associate the route with the logged-in user
      stops,
      regularRoute,
    });

    res.status(201).json({ message: 'Route planned successfully', route: savedRoute });
  } catch (error) {
    res.status(500).json({ error: 'Failed to plan routes', details: error.message });
  }
};

// Fetch a saved route by its ID
exports.getRouteById = async (req, res) => {
  try {
    const { id } = req.params; // Extract route ID from request parameters
    const route = await Route.findById(id); // Retrieve the route from the database

    if (!route) {
      return res.status(404).json({ error: 'Route not found' }); // Handle case where route doesn't exist
    }

    res.status(200).json(route);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch route', details: error.message });
  }
};
