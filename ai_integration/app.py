from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model

# Initialize the Flask application
app = Flask(__name__)

# Load the Pre-trained Models
# Update the paths if needed based on your folder structure.
fuel_model = load_model('models/fuel_consumption_model.h5')
co2_model = load_model('models/co2_emissions_model.h5')

# Prediction Endpoint
@app.route('/predict', methods=['POST'])
def predict():
    """
    This endpoint expects a JSON payload with the following keys:
      - distance (float): The route's distance.
      - normalized_traffic_severity (float): Traffic severity scaled from 0 to 1.
      - combined_fuel_efficiency (float): A weighted average of city and highway fuel efficiency.
    
    It returns:
      - fuel_consumption: Estimated fuel consumption for the route.
      - co2_emissions: Estimated CO₂ emissions.
    """
    data = request.get_json(force=True)

    try:
        distance = float(data['distance'])
        normalized_traffic_severity = float(data['normalized_traffic_severity'])
        combined_fuel_efficiency = float(data['combined_fuel_efficiency'])
    except (KeyError, ValueError):
        return jsonify({
            'error': 'Invalid input. Provide distance, normalized_traffic_severity, and combined_fuel_efficiency as numbers.'
        }), 400

    # Prepare the input array for the models
    input_features = np.array([[distance, normalized_traffic_severity, combined_fuel_efficiency]])

    # Get predictions from both models
    fuel_prediction = fuel_model.predict(input_features)
    co2_prediction = co2_model.predict(input_features)

    response = {
        'fuel_consumption': float(fuel_prediction[0][0]),
        'co2_emissions': float(co2_prediction[0][0])
    }
    
    return jsonify(response)

# Run the Flask App
if __name__ == '__main__':
    app.run(debug=True)
