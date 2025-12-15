import { useEffect, useState } from 'react';
import { fetchAllUsers } from '../services/auth';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="loading">Chargement des utilisateurs...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
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
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="user-cell">
                  <div className="avatar-wrapper">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="" className="avatar-small" />
                    ) : (
                      <div className="avatar-small placeholder">{user.username?.[0]?.toUpperCase()}</div>
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
                  <span className={`badge ${user.isOnline ? 'status-online' : 'status-offline'}`}>
                    {user.isOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
