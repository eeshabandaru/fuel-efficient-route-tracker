
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam


# 1. Load and Inspect Datasets


# Load vehicle data containing fuel efficiency & CO₂ emissions info
vehicle_data = pd.read_csv('../data/vehicle data/vehicles.csv')

# Load traffic volume data (historical traffic patterns)
traffic_volumes = pd.read_csv('../data/traffic data/Traffic_Volumes.csv')

# Load bottleneck data (high-traffic congestion areas)
bottlenecks = pd.read_csv('../data/traffic data/Bottlenecks.csv')

# Print samples to confirm dataset structure
print("Vehicle Data Sample:")
print(vehicle_data.head())

print("\nTraffic Volumes Sample:")
print(traffic_volumes.head())

print("\nBottlenecks Sample:")
print(bottlenecks.head())


# 2. Data Cleaning and Preprocessing


# 2.1 Remove rows with missing values to avoid errors in training
vehicle_data.dropna(inplace=True)
traffic_volumes.dropna(inplace=True)
bottlenecks.dropna(inplace=True)

# 2.2 Rename vehicle_data columns for consistency
vehicle_data.rename(
    columns={
        'Fuel_Consumption_City': 'city_fuel_efficiency',
        'Fuel_Consumption_Hwy': 'highway_fuel_efficiency',
        'CO2_Emissions': 'co2_emissions'
    },
    inplace=True
)

# 2.3 Compute a "combined" fuel efficiency (weighted average of city & highway)
#     Example weighting: 55% city, 45% highway
vehicle_data['combined_fuel_efficiency'] = (
    vehicle_data['city_fuel_efficiency'] * 0.55 +
    vehicle_data['highway_fuel_efficiency'] * 0.45
)

# 2.4 Normalize traffic congestion severity (scale from 0 to 1)
bottlenecks['normalized_traffic_severity'] = (
    bottlenecks['traffic_severity'] / bottlenecks['traffic_severity'].max()
)


# 3. Merge Datasets for Model Training


# 3.1 Merge traffic volume data with bottleneck congestion severity on 'location'
traffic_data = pd.merge(
    traffic_volumes,
    bottlenecks[['location', 'normalized_traffic_severity']],
    on='location',
    how='left'  # Keep all traffic data, add severity where matched
)

# 3.2 Merge the traffic data with vehicle data on 'Fuel_Type'
#     Make sure both CSVs have 'Fuel_Type' columns to merge on.
merged_data = traffic_data.merge(
    vehicle_data,
    on='Fuel_Type',
    how='left'  # Keep traffic records, attach vehicle details where possible
)

# 3.3 Compute estimated fuel consumption
#     Fuel Consumption (L) = Distance / Fuel Efficiency (km/L) 
#     (Or adjust units as needed.)
merged_data['fuel_consumption'] = (
    merged_data['distance'] / merged_data['combined_fuel_efficiency']
)


# 4. Select Features (X) and Targets (y)


# 4.1 Features (X) - Adjust columns based on your dataset
X = merged_data[['distance', 'normalized_traffic_severity', 'combined_fuel_efficiency']]

# 4.2 Targets
y_fuel = merged_data['fuel_consumption']  # Predict fuel consumption
y_co2 = merged_data['co2_emissions']      # Predict CO₂ emissions


# 5. Split Data into Training & Testing Sets


# For Fuel Consumption
X_train, X_test, y_fuel_train, y_fuel_test = train_test_split(
    X, y_fuel, 
    test_size=0.2, 
    random_state=42
)

# For CO₂ Emissions
# Using the same random_state and test_size ensures the same split indices.
# We only need y_co2 here; the X split is the same shape but not used.
_, _, y_co2_train, y_co2_test = train_test_split(
    X, y_co2, 
    test_size=0.2, 
    random_state=42
)


# 6. Scale the Feature Data

# We use separate scalers for each model.

# 6.1 Fuel Model Scaler
scaler_fuel = StandardScaler()
X_train_fuel = scaler_fuel.fit_transform(X_train)
X_test_fuel = scaler_fuel.transform(X_test)

# 6.2 CO₂ Model Scaler
scaler_co2 = StandardScaler()
X_train_co2 = scaler_co2.fit_transform(X_train)
X_test_co2 = scaler_co2.transform(X_test)


# 7. Define a Reusable Keras Model


def build_model(input_dim):
    """
    Creates a simple feedforward neural network for regression tasks.

    Args:
        input_dim (int): Number of input features.

    Returns:
        model (Sequential): Compiled Keras model.
    """
    model = Sequential([
        Dense(64, activation='relu', input_shape=(input_dim,)),  # Hidden layer 1
        Dropout(0.3),
        Dense(32, activation='relu'),                           # Hidden layer 2
        Dropout(0.3),
        Dense(1)  # Single output for regression
    ])

    # Compile the model
    model.compile(
        optimizer=Adam(learning_rate=0.001), 
        loss='mse',      # Mean Squared Error
        metrics=['mse']  # Track MSE as a metric
    )
    return model


# 8. Train the Fuel Consumption Model


print("Training Fuel Consumption Model...")
model_fuel = build_model(input_dim=X_train_fuel.shape[1])
history_fuel = model_fuel.fit(
    X_train_fuel, y_fuel_train,
    validation_split=0.2,  # 20% of training set for validation
    epochs=50,
    batch_size=32,
    verbose=1
)


# 9. Train the CO₂ Emissions Model


print("\nTraining CO₂ Emissions Model...")
model_co2 = build_model(input_dim=X_train_co2.shape[1])
history_co2 = model_co2.fit(
    X_train_co2, y_co2_train,
    validation_split=0.2,
    epochs=50,
    batch_size=32,
    verbose=1
)


# 10. Evaluate Model Performance


# Fuel Model
fuel_loss, fuel_mse = model_fuel.evaluate(X_test_fuel, y_fuel_test, verbose=0)
print(f"\nFuel Consumption Model MSE: {fuel_mse:.4f}")

# CO₂ Model
co2_loss, co2_mse = model_co2.evaluate(X_test_co2, y_co2_test, verbose=0)
print(f"CO₂ Emissions Model MSE: {co2_mse:.4f}")


# 11. Save Trained Models


model_fuel.save('../models/fuel_consumption_model.h5')
model_co2.save('../models/co2_emissions_model.h5')

print("\n✅ Models saved successfully!")
