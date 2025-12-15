import React from 'react';

export default function Navbar({ user, logout, setView, currentView }) {
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
        <span className="welcome">Bonjour {user.username}</span>
        <button onClick={logout} className="logout-btn">
          Se déconnecter
        </button>
      </div>
    </nav>
  );
}
