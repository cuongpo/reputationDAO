import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span role="img" aria-label="brain">🧠</span> AI-DAO
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/reputation" 
              className={`nav-link ${location.pathname === '/reputation' ? 'active' : ''}`}
            >
              Reputation
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/proposals" 
              className={`nav-link ${location.pathname === '/proposals' ? 'active' : ''}`}
            >
              Proposals
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
