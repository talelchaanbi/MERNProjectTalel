import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { AlertTriangle, Mail, Lock, Hexagon, ArrowRight } from 'lucide-react';

const INITIAL_FORM = {
  email: '',
  password: '',
};

export default function LoginForm({ onBackToHome, onGoToRegister }) {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState([]);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors([]);
    try {
      await dispatch(loginUser(form)).unwrap();
    } catch (errPayload) {
      if (Array.isArray(errPayload)) {
        setErrors(errPayload.map((item) => item.msg || item.message || 'Erreur de validation'));
      } else if (typeof errPayload === 'string') {
        setErrors([errPayload]);
      } else if (errPayload && typeof errPayload === 'object') {
        setErrors([errPayload.msg || errPayload.message || 'Une erreur est survenue']);
      } else {
        setErrors(['Une erreur est survenue lors de la connexion']);
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card-creative">
        <div className="login-header">
          {typeof onBackToHome === 'function' && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
              <button 
                type="button" 
                onClick={onBackToHome}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#94a3b8', 
                  cursor: 'pointer', 
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: 0,
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                ← Retour à l’accueil
              </button>
            </div>
          )}
          <div className="logo-container">
            <div className="logo-hexagon">
              <Hexagon size={40} strokeWidth={1.5} />
            </div>
            <div className="logo-glow"></div>
          </div>
          <h1>Bienvenue</h1>
          <p className="login-subtitle">Accédez à votre espace sécurisé</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form-creative">
          <div className={`input-group-creative ${focusedInput === 'email' ? 'focused' : ''}`}>
            <div className="input-icon">
              <Mail size={20} />
            </div>
            <div className="input-wrapper">
              <label htmlFor="email">Email professionnel</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                required
                autoComplete="email"
                placeholder="nom@entreprise.com"
              />
            </div>
          </div>

          <div className={`input-group-creative ${focusedInput === 'password' ? 'focused' : ''}`}>
            <div className="input-icon">
              <Lock size={20} />
            </div>
            <div className="input-wrapper">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="form-error-container creative-error">
              {errors.map((message, index) => (
                <div key={index} className="form-error-item">
                  <AlertTriangle size={16} />
                  <span>{message}</span>
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="btn-login-creative" disabled={status === 'loading'}>
            <span>{status === 'loading' ? 'Connexion en cours...' : 'Se connecter'}</span>
            {!status === 'loading' && <ArrowRight size={20} />}
          </button>
          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => typeof onGoToRegister === 'function' && onGoToRegister()}
              className="link-button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#60a5fa',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                fontSize: '0.95rem'
              }}
            >
              Vous n'avez pas de compte ? Créer un compte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

