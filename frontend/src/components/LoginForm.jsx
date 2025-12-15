import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { AlertTriangle } from 'lucide-react';

const INITIAL_FORM = {
  email: '',
  password: '',
};

export default function LoginForm() {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);
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
      await dispatch(loginUser(form)).unwrap();
    } catch (errPayload) {
      if (Array.isArray(errPayload)) {
        setErrors(errPayload.map((item) => item.msg || item.message || 'Erreur de validation'));
      } else if (typeof errPayload === 'string') {
        setErrors([errPayload]);
      } else if (errPayload?.msg) {
        setErrors([errPayload.msg]);
      } else {
        setErrors(['Une erreur est survenue lors de la connexion']);
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
          <div className="form-error-container">
            {errors.map((message, index) => (
              <div key={index} className="form-error-item">
                <AlertTriangle size={16} />
                <span>{message}</span>
              </div>
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
