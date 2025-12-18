import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAllUsers, updateUserStatus, deleteUser } from '../services/auth';
import UserModal from './UserModal';
import ConfirmModal from './ConfirmModal';
import { Eye, Edit2, Trash2, Power, Wifi, WifiOff, User } from 'lucide-react';

export default function UserList() {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  
  // State for confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const initiateDelete = (user) => {
    setUserToDelete(user);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete._id);
        setUsers(users.filter(u => u._id !== userToDelete._id));
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const openModal = (user, mode) => {
    setSelectedUser(user);
    setModalMode(mode);
  };

  const closeModal = (refresh = false) => {
    setSelectedUser(null);
    if (refresh) loadUsers();
  };

  if (loading) return <div className="loading">Chargement des utilisateurs...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      <div className="card full-width">
        <h2>Gestion des utilisateurs</h2>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Connexion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="user-cell">
                    <div className="avatar-wrapper">
                      <div className="avatar-small placeholder">
                        <User size={16} />
                      </div>
                      {user.profilePicture && (
                        <img
                          src={`${user.profilePicture}${user.profilePicture.includes('?') ? '&' : '?'}_=${user._id || Date.now()}`}
                          alt={user.username}
                          className="avatar-small avatar-on-top"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <span className={`status-dot ${user.isOnline ? 'online' : 'offline'}`}></span>
                    </div>
                    <span>{user.username}</span>
                  </td>
                  <td>{user.email}</td>
                  <td><span className={`badge role-${user.role?.toLowerCase()}`}>{user.role}</span></td>
                  <td>
                    <span className={`badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <div className="status-icon-wrapper">
                      {user.isOnline ? <Wifi size={16} className="text-success" /> : <WifiOff size={16} className="text-muted" />}
                      <span className="status-text">{user.isOnline ? 'En ligne' : 'Hors ligne'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="actions-group">
                      <button 
                        className="btn-icon-small" 
                        title="Voir"
                        onClick={() => openModal(user, 'view')}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="btn-icon-small" 
                        title="Modifier"
                        onClick={() => openModal(user, 'edit')}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className={`btn-icon-small ${user.isActive ? 'text-danger' : 'text-success'}`}
                        title={user.isActive ? 'Désactiver' : 'Activer'}
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                      >
                        <Power size={18} />
                      </button>
                      <button 
                        className="btn-icon-small btn-delete" 
                        title="Supprimer"
                        onClick={() => initiateDelete(user)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedUser && (
        <UserModal user={selectedUser} onClose={closeModal} mode={modalMode} />
      )}

      <ConfirmModal 
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${userToDelete?.username}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        isDanger={true}
      />
    </>
  );
}
