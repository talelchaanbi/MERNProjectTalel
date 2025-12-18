import { useMemo, useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, resetRegisterStatus } from '../store/authSlice';
import { AlertTriangle } from 'lucide-react';

const ROLES = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'RECRUT', label: 'Recruteur' },
  { value: 'CONSULTANT', label: 'Consultant' },
];

const INITIAL_FORM = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  role: ROLES[1]?.value || 'RECRUT',
  profilePicture: null,
};

export default function RegisterUserForm({ onCreated, onBack, excludeAdmin = false }) {
  const dispatch = useDispatch();
  const { registerStatus } = useSelector((state) => state.auth);
  const displayedRoles = useMemo(() => {
    return ROLES.filter((r) => !(excludeAdmin && String(r.value).trim().toUpperCase() === 'ADMIN'));
  }, [excludeAdmin]);

  const INITIAL_FORM_LOCAL = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: displayedRoles[0]?.value || (ROLES.find(r => r.value !== 'ADMIN')?.value) || 'RECRUT',
    profilePicture: null,
  };

  const [form, setForm] = useState(() => ({ ...INITIAL_FORM_LOCAL }));
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);
  const [createdEmail, setCreatedEmail] = useState(null);
  const [postCreated, setPostCreated] = useState(false);
  const fileInputRef = useRef(null);
  useEffect(() => {
    let timer;
    if (postCreated) {
      // auto-redirect to login after a short delay
      timer = setTimeout(() => {
        if (typeof onCreated === 'function') onCreated();
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [postCreated, onCreated]);

  useEffect(() => {
    return () => {
      dispatch(resetRegisterStatus());
    };
  }, [dispatch]);

  const canSubmit = useMemo(() => {
    return (
      form.username.trim() &&
      form.email.trim() &&
      form.password.trim() &&
      form.confirmPassword.trim() &&
      form.password === form.confirmPassword &&
      form.role.trim()
    );
  }, [form]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'profilePicture') {
      setForm((prev) => ({ ...prev, profilePicture: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      // Clear password mismatch error while typing
      if ((name === 'password' || name === 'confirmPassword')) {
        setErrors((prev) => prev.filter((m) => m !== 'Les mots de passe ne correspondent pas.'));
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || registerStatus === 'loading') {
      if (form.password !== form.confirmPassword) {
        setErrors(['Les mots de passe ne correspondent pas.']);
      }
      return;
    }

    const payload = new FormData();
    payload.append('username', form.username.trim());
    payload.append('email', form.email.trim());
    payload.append('password', form.password);
    // confirmPassword is for client validation only; don't send it to the server
    if (form.phone.trim()) {
      payload.append('phone', form.phone.trim());
    }
    payload.append('role', form.role);
    if (form.profilePicture) {
      payload.append('profilePicture', form.profilePicture);
    }

    setErrors([]);
    setSuccess(null);

    try {
      const user = await dispatch(registerUser(payload)).unwrap();
      setSuccess(`Utilisateur ${user.username} créé avec succès.`);
      // keep the created email so we can offer resend
      setCreatedEmail(form.email.trim());
      setPostCreated(true);
      // clear form fields but keep email saved in createdEmail
      setForm({ ...INITIAL_FORM_LOCAL });
      // ensure confirmPassword cleared as well
      setForm((prev) => ({ ...prev, confirmPassword: '' }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (errPayload) {
      if (Array.isArray(errPayload)) {
        setErrors(errPayload.map((item) => item.msg || item.message || 'Erreur de validation'));
      } else if (typeof errPayload === 'string') {
        setErrors([errPayload]);
      } else if (typeof errPayload === 'object') {
        setErrors([errPayload.msg || errPayload.message || 'Une erreur est survenue']);
      } else {
        setErrors(['Une erreur est survenue lors de la création']);
      }
    }
  };

  // resending verification removed — handled by backend / user support flow if needed

  const handleGoToLogin = () => {
    if (typeof onCreated === 'function') onCreated();
  };

  return (
    <div className="card">
      {postCreated && (
        <div className="register-popup-overlay" role="dialog" aria-modal="true">
          <div className="register-popup-card">
            <div className="register-popup-icon" aria-hidden>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <circle cx="12" cy="12" r="12" fill="url(#g)" />
                <path d="M6 12.2l3.2 3.2L18 6.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#0ea5e9" />
                    <stop offset="1" stopColor="#6d28d9" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="register-popup-content">
              <h3>Compte créé</h3>
              <p>Un email de vérification a été envoyé à <strong>{createdEmail}</strong>. Vous serez redirigé vers la connexion dans quelques secondes.</p>
              <div className="register-popup-actions">
                <button type="button" className="btn-ghost" onClick={handleGoToLogin}>Aller à la connexion</button>
              </div>
            </div>
            <div className="register-popup-timer" aria-hidden>
              <div className="register-popup-timer-bar" />
            </div>
          </div>
        </div>
      )}
      {typeof onBack === 'function' && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.9rem',
              padding: 0
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#e2e8f0')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            ← Retour
          </button>
        </div>
      )}
      <h2>Créer un utilisateur</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label className="form-label">
          Nom d&apos;utilisateur
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            placeholder="Nom complet"
          />
        </label>
        <label className="form-label">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="utilisateur@example.com"
          />
        </label>
        <label className="form-label">
          Mot de passe
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <label className="form-label">
          Confirmer le mot de passe
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          {form.confirmPassword && form.password !== form.confirmPassword && (
            <div className="field-error">Les mots de passe ne correspondent pas.</div>
          )}
        </label>
        <label className="form-label">
          Téléphone (optionnel)
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+216…"
          />
        </label>
        <label className="form-label">
          Rôle
          <select name="role" value={form.role} onChange={handleChange} required>
            {displayedRoles.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Photo de profil (optionnel)
          <input
            ref={fileInputRef}
            type="file"
            name="profilePicture"
            accept="image/*"
            onChange={handleChange}
          />
        </label>
        {errors.length > 0 && (
          <div className="form-error-container">
            {errors.map((message, index) => (
              <div key={index} className="form-error-item">
                <AlertTriangle size={16} />
                <span>{message}</span>
              </div>
            ))}
          </div>
        )}
        {success && <p className="form-success">{success}</p>}
        {postCreated && (
          <div style={{ marginTop: '1rem' }}>
            <p>Un email de vérification a été envoyé à <strong>{createdEmail}</strong>. Veuillez vérifier votre boîte de réception.</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={handleGoToLogin}>Aller à la connexion</button>
            </div>
          </div>
        )}
        <button type="submit" disabled={!canSubmit || registerStatus === 'loading'}>
          {registerStatus === 'loading' ? 'Création…' : 'Créer'}
        </button>
      </form>
    </div>
  );
}
