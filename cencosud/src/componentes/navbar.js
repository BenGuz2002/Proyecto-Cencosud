import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <h1>Cencosud</h1>
        </div>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Inicio</Link>
          </li>
          <li className="navbar-item">
            <Link to="/total" className="navbar-link">Total</Link>
          </li>
          <li className="navbar-item">
            <Link to="/usuarios" className="navbar-link">Usuarios</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
