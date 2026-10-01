import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">ðŸ“š</span>
          <span className="brand-text">LexiLearn</span>
        </Link>
        <div className="navbar-links">
          {user ? (
            <button onClick={logout} className="btn-logout">Cerrar SesiÃ³n</button>
          ) : (
            <Link to="/login" className="btn-nav">Iniciar SesiÃ³n</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
