import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, logoutUser } from './store/authSlice';
import './App.css';
import CurrentUserCard from './components/CurrentUserCard';
import LoginForm from './components/LoginForm';
import RegisterUserForm from './components/RegisterUserForm';
import Navbar from './components/Navbar';
import UserList from './components/UserList';
import LandingPage from './components/LandingPage';

function App() {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(user);
  const [view, setView] = useState('dashboard');
  const [unauthView, setUnauthView] = useState('home');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    dispatch(fetchUser()).finally(() => setIsInitialLoad(false));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setView('dashboard');
    setUnauthView('home');
  };

  if (isInitialLoad) {
    return (
      <div className="app loading">
        <p>Chargement…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        {unauthView === 'home' && (
          <header className="app-header">
            <h1>MERN Project</h1>
          </header>
        )}
        <main className="app-main">
          {unauthView === 'home' ? (
            <LandingPage onGoToLogin={() => setUnauthView('login')} />
          ) : (
            <LoginForm onBackToHome={() => setUnauthView('home')} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar user={user} logout={handleLogout} setView={setView} currentView={view} />
      
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
