import React from 'react';

export default function Navbar({ user, logout, setView, currentView }) {
  // Prefer showing the user's last name (nom) as a friendly greeting.
  const getDisplayName = () => {
    if (!user) return '';
    const full = String(user.username || user.name || user.email || '');
    // If full name contains spaces, take the last segment as 'nom'
    const parts = full.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      const last = parts[parts.length - 1];
      return last.charAt(0).toUpperCase() + last.slice(1);
    }
    // Fallback: if email, use local-part before @
    if (full.includes('@')) return full.split('@')[0];
    return full;
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => setView('dashboard')}>
        <h1>MERN Auth</h1>
      </div>
      <div className="navbar-menu">
        <button 
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setView('dashboard')}
        >
          Tableau de bord
        </button>
        
        {user.role === 'ADMIN' && (
          <>
            <button 
              className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
              onClick={() => setView('users')}
            >
              Utilisateurs
            </button>
            <button 
              className={`nav-item ${currentView === 'register' ? 'active' : ''}`}
              onClick={() => setView('register')}
            >
              Créer un compte
            </button>
          </>
        )}
      </div>
      <div className="navbar-end">
        <span className="welcome">Bonjour {getDisplayName()}</span>
        <button onClick={logout} className="logout-btn">
          Se déconnecter
        </button>
      </div>
    </nav>
  );
}
