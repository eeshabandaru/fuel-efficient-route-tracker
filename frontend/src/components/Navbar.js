import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import the CSS file

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">MyAppLogo</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
        {/* ... other links ... */}
      </ul>
    </nav>
  );
};

export default Navbar;