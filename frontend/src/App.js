import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import placeholder components; ensure these files exist in your project.
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VehicleManagementPage from './pages/VehicleManagementPage';
import RouteInputPage from './pages/RouteInputPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    // Router wraps the entire application to enable routing.
    <Router>
      {/* Navbar will appear on every page; update its links as needed */}
      <Navbar />
      
      <div className="App">
        {/* 
          Routes: Each Route component maps a URL path to a component.
          Replace or add more routes once details are available.
        */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/vehicles" element={<VehicleManagementPage />} />
          <Route path="/route" element={<RouteInputPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Default route: redirect to dashboard or another page */}
          <Route path="/" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
