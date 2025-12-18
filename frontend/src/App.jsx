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
import VerifyPage from './components/VerifyPage';
import MessagesList from './components/MessagesList';
import ContactModal from './components/ContactModal';
import Footer from './components/Footer';

function App() {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(user);
  // Persist current views so a browser refresh keeps the user on the same page
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem('app:view') || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });
  const [unauthView, setUnauthView] = useState(() => {
    try {
      return localStorage.getItem('app:unauthView') || 'home';
    } catch (e) {
      return 'home';
    }
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    dispatch(fetchUser()).finally(() => setIsInitialLoad(false));
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setView('dashboard');
    setUnauthView('home');
    try {
      localStorage.setItem('app:view', 'dashboard');
      localStorage.setItem('app:unauthView', 'home');
    } catch (e) {}
  };

  // keep persisted view in sync with in-memory state
  useEffect(() => {
    try {
      localStorage.setItem('app:view', view);
    } catch (e) {}
  }, [view]);

  useEffect(() => {
    try {
      localStorage.setItem('app:unauthView', unauthView);
    } catch (e) {}
  }, [unauthView]);

  if (isInitialLoad) {
    return (
      <div className="app loading">
        <p>Chargement…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Support direct verify URL like /verify?token=...&id=...
    if (typeof window !== 'undefined' && window.location.pathname === '/verify') {
      return (
        <div className="app">
          <main className="app-main">
            <VerifyPage />
          </main>
        </div>
      );
    }
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
          ) : unauthView === 'login' ? (
            <LoginForm onBackToHome={() => setUnauthView('home')} onGoToRegister={() => setUnauthView('register')} />
          ) : unauthView === 'register' ? (
            <RegisterUserForm excludeAdmin={true} onCreated={() => setUnauthView('login')} onBack={() => setUnauthView('login')} />
          ) : (
            <LandingPage onGoToLogin={() => setUnauthView('login')} />
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

        {view === 'messages' && user.role === 'ADMIN' && (
          <MessagesList />
        )}

        {view === 'register' && user.role === 'ADMIN' && (
          <RegisterUserForm onCreated={() => setView('users')} onBack={() => setView('users')} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App
 
