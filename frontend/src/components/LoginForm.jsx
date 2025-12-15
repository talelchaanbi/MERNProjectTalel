import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const INITIAL_FORM = {
  email: '',
  password: '',
};

export default function LoginForm() {
  const { login, status } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState([]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors([]);
    try {
      await login(form);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length) {
        setErrors(serverErrors.map((item) => item.message || 'Erreur de validation'));
      } else if (err.message) {
        setErrors([err.message]);
      } else {
        setErrors(['Une erreur est survenue']);
      }
    }
  };

  return (
    <div className="card">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit} className="form">
        <label className="form-label">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="admin@example.com"
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
            autoComplete="current-password"
          />
        </label>
        {errors.length > 0 && (
          <div className="form-error">
            {errors.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </div>
        )}
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
