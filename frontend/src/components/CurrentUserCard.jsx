import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../store/authSlice';
import { AlertTriangle } from 'lucide-react';

export default function CurrentUserCard({ user }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [form, setForm] = useState({
    username: user?.username || '',
    phone: user?.phone || '',
    profilePicture: null
  });
  const [passwordFields, setPasswordFields] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  if (!user) return null;

  const handleEdit = () => {
    setForm({
      username: user.username,
      phone: user.phone || '',
      profilePicture: null
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setForm(prev => ({ ...prev, profilePicture: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFields(prev => ({ ...prev, [name]: value }));
    setErrors((prev) => prev.filter((m) => m !== 'Les mots de passe ne correspondent pas.'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('phone', form.phone);
    if (form.profilePicture) {
      formData.append('profilePicture', form.profilePicture);
    }
    // If user wants to change password, validate client-side and include current/new password
    if (passwordFields.newPassword || passwordFields.confirmNewPassword || passwordFields.currentPassword) {
      if (!passwordFields.currentPassword) {
        setErrors(['Le mot de passe actuel est requis pour changer le mot de passe.']);
        return;
      }
      if (passwordFields.newPassword !== passwordFields.confirmNewPassword) {
        setErrors(['Les mots de passe ne correspondent pas.']);
        return;
      }
      formData.append('currentPassword', passwordFields.currentPassword);
      formData.append('newPassword', passwordFields.newPassword);
    }
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      setErrors([]);
      setPasswordFields({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (errPayload) {
      if (Array.isArray(errPayload)) {
        setErrors(errPayload.map((item) => item.msg || item.message || 'Erreur de validation'));
      } else if (typeof errPayload === 'string') {
        setErrors([errPayload]);
      } else if (typeof errPayload === 'object') {
        setErrors([errPayload.msg || errPayload.message || 'Une erreur est survenue']);
      } else {
        setErrors(['Erreur lors de la mise à jour']);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="card">
        <h2>Modifier mon profil</h2>
        <form onSubmit={handleSubmit} className="form">
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
          <label className="form-label">
            Nom d'utilisateur
            <input 
              type="text" 
              name="username" 
              value={form.username} 
              onChange={handleChange} 
              required 
            />
          </label>
          <label className="form-label">
            Téléphone
            <input 
              type="text" 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
            />
          </label>
          <label className="form-label">
            Mot de passe actuel
            <input
              type="password"
              name="currentPassword"
              value={passwordFields.currentPassword}
              onChange={handlePasswordChange}
            />
          </label>
          <label className="form-label">
            Nouveau mot de passe
            <input
              type="password"
              name="newPassword"
              value={passwordFields.newPassword}
              onChange={handlePasswordChange}
            />
          </label>
          <label className="form-label">
            Confirmer le nouveau mot de passe
            <input
              type="password"
              name="confirmNewPassword"
              value={passwordFields.confirmNewPassword}
              onChange={handlePasswordChange}
            />
            {passwordFields.confirmNewPassword && passwordFields.newPassword !== passwordFields.confirmNewPassword && (
              <div className="field-error">Les mots de passe ne correspondent pas.</div>
            )}
          </label>
          <label className="form-label">
            Photo de profil
            <input 
              type="file" 
              name="profilePicture" 
              onChange={handleChange} 
              accept="image/*"
            />
          </label>
          <div className="form-actions">
            <button type="submit">Enregistrer</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Annuler</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Mon compte</h2>
        <button onClick={handleEdit} className="btn-icon">✏️</button>
      </div>
      <div className="profile">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt={user.username} className="profile-avatar" />
        ) : (
          <div className="profile-avatar placeholder">{user.username?.[0]?.toUpperCase() || '?'}</div>
        )}
        <div className="profile-info">
          <p>
            <strong>Utilisateur:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Rôle:</strong> {user.role}
          </p>
          {user.phone && (
            <p>
              <strong>Téléphone:</strong> {user.phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
