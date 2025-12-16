import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateUserByAdmin } from '../store/authSlice';
import { X, Save, User, Mail, Phone, Shield, Camera, Edit2, Power, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const ROLES = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'RECRUT', label: 'Recruteur' },
  { value: 'CONSULTANT', label: 'Consultant' },
];

export default function UserModal({ user, onClose, mode = 'view' }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [errors, setErrors] = useState([]);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'RECRUT',
    profilePicture: null
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        profilePicture: null
      });
    }
  }, [user]);

  useEffect(() => {
    setIsEditing(mode === 'edit');
  }, [mode]);

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
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    formData.append('role', form.role);
    if (form.profilePicture) {
      formData.append('profilePicture', form.profilePicture);
    }
    try {
      await dispatch(updateUserByAdmin({ id: user._id, formData })).unwrap();
      onClose(true); // true indicates success/refresh needed
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

  if (!user) return null;

  const kickerLabel = isEditing ? 'Mode édition' : 'Profil utilisateur';
  const titleText = isEditing ? `Modifier ${user.username}` : user.username;
  const emailSubtitle = user.email || '—';
  const initials = user.username?.[0]?.toUpperCase() || '?';
  const activeChipClass = user.isActive ? 'chip chip-success' : 'chip chip-danger';
  const activeChipLabel = user.isActive ? 'Compte actif' : 'Compte désactivé';
  const onlineChipClass = user.isOnline ? 'chip chip-online' : 'chip chip-muted';
  const onlineChipLabel = user.isOnline ? 'En ligne' : 'Hors ligne';
  const onlineIcon = user.isOnline ? <Wifi size={14} /> : <WifiOff size={14} />;

  return (
    <div className="modal-overlay">
      <div className="modal-content card modal-full-layout">
        <div className="modal-header user-modal-header">
          <div className="user-modal-meta">
            <div className="user-modal-avatar">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="user-modal-heading">
              <p className="modal-kicker">{kickerLabel}</p>
              <h2>{titleText}</h2>
              <div className="user-modal-subtitle">
                <Mail size={14} />
                <span>{emailSubtitle}</span>
              </div>
              <div className="user-modal-chips">
                <span className={`badge role-${user.role?.toLowerCase()}`}>{user.role}</span>
                <span className={activeChipClass}>
                  <Power size={14} />
                  {activeChipLabel}
                </span>
                <span className={onlineChipClass}>
                  {onlineIcon}
                  {onlineChipLabel}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => onClose(false)} className="btn-icon-small" type="button" aria-label="Fermer">
            <X size={24} />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="form modal-body modal-form">
            <div className="modal-scroll-area">
              {errors.length > 0 && (
                <div className="form-error-container" style={{ margin: '0 1.5rem 1rem 1.5rem' }}>
                  {errors.map((message, index) => (
                    <div key={index} className="form-error-item">
                      <AlertTriangle size={16} />
                      <span>{message}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="form-sections">
                <section className="form-section">
                  <div className="form-section-header">
                    <h3>Informations générales</h3>
                    <p>Mettez à jour l'identité et les accès principaux du compte.</p>
                  </div>
                  <div className="form-grid">
                    <label className="form-label">
                      <div className="label-with-icon"><User size={16} /> Nom d'utilisateur</div>
                      <input type="text" name="username" value={form.username} onChange={handleChange} required />
                    </label>
                    <label className="form-label">
                      <div className="label-with-icon"><Mail size={16} /> Email</div>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required />
                    </label>
                  </div>
                </section>

                <section className="form-section">
                  <div className="form-section-header">
                    <h3>Coordonnées & rôle</h3>
                    <p>Ajustez les informations de contact ou les responsabilités.</p>
                  </div>
                  <div className="form-grid">
                    <label className="form-label">
                      <div className="label-with-icon"><Phone size={16} /> Téléphone</div>
                      <input type="text" name="phone" value={form.phone} onChange={handleChange} />
                    </label>
                    <label className="form-label">
                      <div className="label-with-icon"><Shield size={16} /> Rôle</div>
                      <select name="role" value={form.role} onChange={handleChange}>
                        {ROLES.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="form-label span-2">
                      <div className="label-with-icon"><Camera size={16} /> Photo de profil</div>
                      <input type="file" name="profilePicture" onChange={handleChange} accept="image/*" />
                    </label>
                  </div>
                </section>
              </div>
            </div>
            <div className="modal-actions modal-fixed-actions">
              <button type="submit" className="btn-primary">
                <Save size={18} className="icon-left" /> Enregistrer
              </button>
              <button type="button" onClick={() => onClose(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        ) : (
          <div className="user-details modal-body">
            <div className="modal-scroll-area">
              <div className="info-grid">
                <div className="info-item">
                  <label><Shield size={14} /> Rôle</label>
                  <span className={`badge role-${user.role?.toLowerCase()}`}>{user.role}</span>
                </div>
                <div className="info-item">
                  <label><Mail size={14} /> Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-item">
                  <label><Phone size={14} /> Téléphone</label>
                  <p>{user.phone || 'Non renseigné'}</p>
                </div>
                <div className="info-item">
                  <label><Power size={14} /> Statut</label>
                  <span className={activeChipClass}>{activeChipLabel}</span>
                </div>
                <div className="info-item">
                  <label>{user.isOnline ? <Wifi size={14} /> : <WifiOff size={14} />} Activité</label>
                  <span className={onlineChipClass}>{onlineChipLabel}</span>
                </div>
              </div>
            </div>
            <div className="modal-actions modal-fixed-actions">
              <button onClick={() => setIsEditing(true)} className="btn-primary">
                <Edit2 size={18} className="icon-left" /> Modifier
              </button>
              <button onClick={() => onClose(false)} className="btn-secondary">Fermer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
