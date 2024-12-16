const axios = require('axios');
const Route = require('../models/Route');

// POST /route/plan: Plan an optimized route
exports.planRoute = async (req, res) => {
  try {
    const { stops } = req.body;
    const response = await axios.post(
      `https://api.geoapify.com/v1/routeplanner?apiKey=${process.env.GEOAPIFY_API_KEY}`,
      { mode: 'drive', stops }
    );

    // Save route data to MongoDB
    const route = await Route.create({
      userId: req.user.userId,
      stops,
      distance: response.data.features[0].properties.distance,
      geoapifyData: response.data,
    });

    res.status(200).json(route);
  } catch (error) {
    res.status(500).json({ error: 'Failed to plan route', details: error.message });
  }
};
