from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model

# Initialize the Flask application
app = Flask(__name__)


# Load the Pre-trained Models

# These models were saved from your training script.
# Ensure the paths are correct relative to the location of app.py.
fuel_model = load_model('../models/fuel_consumption_model.h5')
co2_model = load_model('../models/co2_emissions_model.h5')


# Prediction Endpoint

@app.route('/predict', methods=['POST'])
def predict():
    """
    This endpoint expects a JSON payload with the following keys:
      - distance (float): The route's distance.
      - normalized_traffic_severity (float): Traffic severity scaled from 0 to 1.
      - combined_fuel_efficiency (float): A weighted average of city and highway fuel efficiency.
    
    The function returns predicted values for:
      - fuel_consumption: Estimated fuel consumption for the route.
      - co2_emissions: Estimated CO₂ emissions.
    """
    # Parse the input JSON data
    data = request.get_json(force=True)

    # Validate and extract input features
    try:
        distance = float(data['distance'])
        normalized_traffic_severity = float(data['normalized_traffic_severity'])
        combined_fuel_efficiency = float(data['combined_fuel_efficiency'])
    except (KeyError, ValueError) as e:
        return jsonify({
            'error': ('Invalid input. Please provide "distance", '
                      '"normalized_traffic_severity", and "combined_fuel_efficiency" as numbers.')
        }), 400

    # Prepare the input array (shape: [1, 3]) for the model
    input_features = np.array([[distance, normalized_traffic_severity, combined_fuel_efficiency]])

    # If you used scaling during training and saved the scalers,
    # load and apply them here before prediction.
    # For this baseline, we assume the model accepts the raw input.
    
    # Get predictions from both models
    fuel_prediction = fuel_model.predict(input_features)
    co2_prediction = co2_model.predict(input_features)

    # Format the response: extract the scalar values from predictions
    response = {
        'fuel_consumption': float(fuel_prediction[0][0]),
        'co2_emissions': float(co2_prediction[0][0])
    }
    
    return jsonify(response)


# Run the Flask App

if __name__ == '__main__':
    # Running in debug mode for development.
    # For production, set debug=False and consider using a WSGI server.
    app.run(debug=True)
