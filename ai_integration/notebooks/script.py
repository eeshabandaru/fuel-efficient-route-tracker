# %%
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam

# ================================
# 🚗 Load and Prepare Datasets
# ================================

# Load vehicle data containing fuel efficiency and CO₂ emissions info
vehicle_data = pd.read_csv('../data/vehicle data/vehicles.csv')

# Load traffic volume data (historical traffic patterns)
traffic_volumes = pd.read_csv('../data/traffic data/Traffic_Volumes.csv')

# Load bottleneck data (high-traffic congestion areas)
bottlenecks = pd.read_csv('../data/traffic data/Bottlenecks.csv')

# Print first few rows to confirm dataset structure
print("Vehicle Data Sample:")
print(vehicle_data.head())

print("Traffic Volumes Sample:")
print(traffic_volumes.head())

print("Bottlenecks Sample:")
print(bottlenecks.head())

# ================================
# 🛠 Data Cleaning and Processing
# ================================

# Remove any rows with missing values
vehicle_data.dropna(inplace=True)
traffic_volumes.dropna(inplace=True)
bottlenecks.dropna(inplace=True)

# Rename columns for consistency and readability
vehicle_data.rename(columns={
    'Fuel_Consumption_City': 'city_fuel_efficiency',
    'Fuel_Consumption_Hwy': 'highway_fuel_efficiency',
    'CO2_Emissions': 'co2_emissions'
}, inplace=True)

# Compute **combined fuel efficiency** using a weighted average 
# (55% city driving, 45% highway driving)
vehicle_data['combined_fuel_efficiency'] = (
    vehicle_data['city_fuel_efficiency'] * 0.55 +
    vehicle_data['highway_fuel_efficiency'] * 0.45
)

# Normalize traffic congestion severity (scale from 0 to 1)
bottlenecks['normalized_traffic_severity'] = (
    bottlenecks['traffic_severity'] / bottlenecks['traffic_severity'].max()
)

# ================================
# 🔗 Merge Datasets for Model Training
# ================================

# Merge traffic volume data with bottleneck congestion severity
traffic_data = pd.merge(
    traffic_volumes,
    bottlenecks[['location', 'normalized_traffic_severity']],
    on='location',
    how='left'  # Use "left" join to retain all traffic data even if bottlenecks are missing
)

# 🚨 FIX: Merge vehicle data using fuel type, NOT location
# Vehicles typically do not have specific location-based data, so we link based on fuel type.
merged_data = traffic_data.merge(
    vehicle_data, 
    on='Fuel_Type',  # Make sure "Fuel_Type" exists in both datasets
    how='left'  # Keep all traffic records and merge vehicle details where possible
)

# Compute **estimated fuel consumption** using the formula:
# Fuel Consumption = Distance / Fuel Efficiency
merged_data['fuel_consumption'] = merged_data['distance'] / merged_data['combined_fuel_efficiency']

# ================================
# 📊 Prepare Features for Model Training
# ================================

# Select relevant input features (X) and target variables (y)
X = merged_data[['distance', 'normalized_traffic_severity', 'combined_fuel_efficiency']]
y_fuel = merged_data['fuel_consumption']   # Target variable for fuel consumption
y_co2 = merged_data['co2_emissions']       # Target variable for CO₂ emissions

# ================================
# 🔀 Split Data into Training & Testing Sets
# ================================

# 80% training, 20% testing split for **fuel consumption**
X_train, X_test, y_fuel_train, y_fuel_test = train_test_split(
    X, y_fuel, test_size=0.2, random_state=42
)

# 80% training, 20% testing split for **CO₂ emissions**
_, _, y_co2_train, y_co2_test = train_test_split(
    X, y_co2, test_size=0.2, random_state=42
)

# ================================
# 📏 Normalize Data (Feature Scaling)
# ================================

# Use **separate scalers** for fuel consumption and CO₂ emissions
scaler_fuel = StandardScaler()
X_train_fuel = scaler_fuel.fit_transform(X_train)
X_test_fuel = scaler_fuel.transform(X_test)

scaler_co2 = StandardScaler()
X_train_co2 = scaler_co2.fit_transform(X_train)
X_test_co2 = scaler_co2.transform(X_test)

# ================================
# 🤖 Define a Reusable Model Structure
# ================================

def build_model():
    """Creates a neural network model for fuel & CO₂ prediction"""
    model = Sequential([
        Dense(64, activation='relu', input_shape=(X_train.shape[1],)),  # First hidden layer
        Dropout(0.3),  # Prevent overfitting
        Dense(32, activation='relu'),  # Second hidden layer
        Dropout(0.3),
        Dense(1)  # Output layer for regression (single numerical value)
    ])
    model.compile(
        optimizer=Adam(learning_rate=0.001), 
        loss='mse',  # Mean Squared Error (MSE) for regression problems
        metrics=['mse']
    )
    return model

# ================================
# 🚀 Train Fuel Consumption Model
# ================================

print("Training Fuel Consumption Model...")
model_fuel = build_model()
history_fuel = model_fuel.fit(
    X_train_fuel, y_fuel_train, 
    epochs=50, batch_size=32, 
    validation_split=0.2
)

# ================================
# 🌍 Train CO₂ Emissions Model
# ================================

print("Training CO₂ Emissions Model...")
model_co2 = build_model()
history_co2 = model_co2.fit(
    X_train_co2, y_co2_train, 
    epochs=50, batch_size=32, 
    validation_split=0.2
)

# ================================
# 🏁 Evaluate Model Performance
# ================================

fuel_mse = model_fuel.evaluate(X_test_fuel, y_fuel_test, verbose=0)[1]
print(f"🚗 Fuel Consumption Model MSE: {fuel_mse}")

co2_mse = model_co2.evaluate(X_test_co2, y_co2_test, verbose=0)[1]
print(f"🌍 CO₂ Emissions Model MSE: {co2_mse}")

# ================================
# 💾 Save Trained Models
# ================================

# Save the trained models for later use in API integration
model_fuel.save('../models/fuel_consumption_model.h5')
model_co2.save('../models/co2_emissions_model.h5')

print("✅ Models saved successfully!")
