import { useState } from 'react';
import './App.css';
import { useAuth } from './context/AuthContext';
import CurrentUserCard from './components/CurrentUserCard';
import LoginForm from './components/LoginForm';
import RegisterUserForm from './components/RegisterUserForm';
import Navbar from './components/Navbar';
import UserList from './components/UserList';

function App() {
  const { user, status, logout, isAuthenticated } = useAuth();
  const [view, setView] = useState('dashboard');

  if (status === 'loading' && !isAuthenticated) {
    return (
      <div className="app loading">
        <p>Chargement…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>MERN Auth</h1>
        </header>
        <main className="app-main">
          <LoginForm />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar user={user} logout={logout} setView={setView} currentView={view} />
      
      <main className="app-main">
        {view === 'dashboard' && (
          <>
            <CurrentUserCard user={user} />
            <div className="card">
              <h2>Bienvenue</h2>
              <p>Vous êtes connecté en tant que {user.role}.</p>
              <p>Utilisez la barre de navigation pour accéder aux fonctionnalités.</p>
            </div>
          </>
        )}

        {view === 'users' && user.role === 'ADMIN' && (
          <UserList />
        )}

        {view === 'register' && user.role === 'ADMIN' && (
          <RegisterUserForm />
        )}
      </main>
    </div>
  );
}

export default App
