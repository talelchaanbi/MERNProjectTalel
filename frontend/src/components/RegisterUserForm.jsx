import { useMemo, useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, resetRegisterStatus } from '../store/authSlice';

const ROLES = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'RECRUT', label: 'Recruteur' },
  { value: 'CONSULTANT', label: 'Consultant' },
];

const INITIAL_FORM = {
  username: '',
  email: '',
  password: '',
  phone: '',
  role: ROLES[1]?.value || 'RECRUT',
  profilePicture: null,
};

export default function RegisterUserForm() {
  const dispatch = useDispatch();
  const { registerStatus } = useSelector((state) => state.auth);
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM }));
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

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
      form.role.trim()
    );
  }, [form]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'profilePicture') {
      setForm((prev) => ({ ...prev, profilePicture: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || registerStatus === 'loading') return;

    const payload = new FormData();
    payload.append('username', form.username.trim());
    payload.append('email', form.email.trim());
    payload.append('password', form.password);
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
      setForm({ ...INITIAL_FORM });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (errPayload) {
      if (Array.isArray(errPayload)) {
        setErrors(errPayload.map((item) => item.msg || item.message || 'Erreur de validation'));
      } else {
        setErrors([errPayload]);
      }
    }
  };

  return (
    <div className="card">
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
            {ROLES.map(({ value, label }) => (
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
          <div className="form-error">
            {errors.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </div>
        )}
        {success && <p className="form-success">{success}</p>}
        <button type="submit" disabled={!canSubmit || registerStatus === 'loading'}>
          {registerStatus === 'loading' ? 'Création…' : 'Créer'}
        </button>
      </form>
    </div>
  );
}
