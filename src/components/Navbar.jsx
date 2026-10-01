import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <span className="navbar-brand-icon">📚</span>
          <span>LexiLearn</span>
        </Link>

        <div className="navbar-nav">
          {user.role === 'teacher' ? (
            <Link to="/teacher" className={`navbar-link ${isActive('/teacher')}`}>
              👩‍🏫 Students
            </Link>
          ) : (
            <>
              <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard')}`}>
                🏠 Dashboard
              </Link>
              <Link to="/exercises" className={`navbar-link ${isActive('/exercises')}`}>
                📝 Exercises
              </Link>
              <Link to="/achievements" className={`navbar-link ${isActive('/achievements')}`}>
                🏆 Achievements
              </Link>
              <Link to="/profile" className={`navbar-link ${isActive('/profile')}`}>
                👤 Profile
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          {user.profile && (
            <>
              <div className="navbar-xp" title="Total XP">
                ⭐ {user.profile.totalXP || 0} XP
              </div>
              {user.profile.currentStreak > 0 && (
                <div className="navbar-streak" title="Current Streak">
                  🔥 {user.profile.currentStreak}
                </div>
              )}
            </>
          )}

          <div
            className="navbar-avatar"
            onClick={() => setShowDropdown(!showDropdown)}
            title={`${user.firstName} ${user.lastName}`}
          >
            {initials}
          </div>

          {showDropdown && (
            <div className="navbar-dropdown">
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                <div style={{ fontWeight: 700 }}>{user.firstName} {user.lastName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
              </div>
              <Link
                to="/profile"
                className="navbar-dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                👤 Profile
              </Link>
              <Link
                to="/achievements"
                className="navbar-dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                🏆 Achievements
              </Link>
              <button
                className="navbar-dropdown-item danger"
                onClick={() => { logout(); setShowDropdown(false); }}
              >
                🚪 Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
