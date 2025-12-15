import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../store/authSlice';

export default function CurrentUserCard({ user }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
    phone: user?.phone || '',
    profilePicture: null
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('phone', form.phone);
    if (form.profilePicture) {
      formData.append('profilePicture', form.profilePicture);
    }

    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch (err) {
      alert('Erreur lors de la mise à jour');
    }
  };

  if (isEditing) {
    return (
      <div className="card">
        <h2>Modifier mon profil</h2>
        <form onSubmit={handleSubmit} className="form">
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
