const axios = require('axios');
const Route = require('../models/Route');

// POST /route/plan: Plan and compare routes
exports.planRoutes = async (req, res) => {
  try {
    const { stops, fuelEfficiency } = req.body;

    // Fetch the regular route from Geoapify
    const regularResponse = await axios.post(
      `https://api.geoapify.com/v1/routeplanner?apiKey=${process.env.GEOAPIFY_API_KEY}`,
      { mode: 'drive', waypoints: stops }
    );
    const regularRoute = regularResponse.data.features[0].properties;

    // Fetch alternative routes from Geoapify
    const alternativesResponse = await axios.post(
      `https://api.geoapify.com/v1/routeplanner?apiKey=${process.env.GEOAPIFY_API_KEY}`,
      { mode: 'drive', waypoints: stops, alternatives: true }
    );
    const alternativeRoutes = alternativesResponse.data.features.map((route) => route.properties);

    // Evaluate routes using AI predictions
    let optimizedRoute = null;
    let lowestFuelConsumption = Infinity;

    for (const route of alternativeRoutes) {
      const { distance } = route; // Distance in meters
      const trafficSeverity = route.traffic_severity || 0.5; // Assume default if missing

      // Predict fuel consumption using AI
      const aiResponse = await axios.post('http://localhost:8000/predict', {
        distance: distance / 1000, // Convert to kilometers
        traffic_severity: trafficSeverity,
        fuel_efficiency: fuelEfficiency,
      });

      const fuelConsumption = aiResponse.data.fuel_consumed;

      // Track the most fuel-efficient route
      if (fuelConsumption < lowestFuelConsumption) {
        optimizedRoute = route;
        lowestFuelConsumption = fuelConsumption;
      }
    }

    // Save both routes to the database
    const savedRoute = await Route.create({
      userId: req.user.userId,
      stops,
      regularRoute,
      optimizedRoute,
      optimizedFuelConsumption: lowestFuelConsumption,
    });

    // Respond with both routes and their fuel consumption
    res.status(200).json({
      regularRoute: {
        ...regularRoute,
        fuelConsumption: regularRoute.distance / fuelEfficiency,
      },
      optimizedRoute: {
        ...optimizedRoute,
        fuelConsumption: lowestFuelConsumption,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to plan routes', details: error.message });
  }
};
