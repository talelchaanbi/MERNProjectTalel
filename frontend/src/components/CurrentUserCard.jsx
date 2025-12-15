export default function CurrentUserCard({ user }) {
  if (!user) return null;

  return (
    <div className="card">
      <h2>Mon compte</h2>
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
        </div>
      </div>
    </div>
  );
}
