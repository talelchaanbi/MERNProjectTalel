import { useEffect, useState } from 'react';
import { fetchSummary } from '../api/stats';

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary().then(setStats).catch((err) => setError(err.message || 'Erreur stats'));
  }, []);

  if (error) return <div className="card error-message">{error}</div>;
  if (!stats) return <div className="card">Chargement des stats…</div>;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">{stats.users}</div>
        <div className="stat-label">Utilisateurs</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.consultants}</div>
        <div className="stat-label">Consultants</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.recruiters}</div>
        <div className="stat-label">Recruteurs</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.jobs}</div>
        <div className="stat-label">Offres</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.applications}</div>
        <div className="stat-label">Candidatures</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.posts}</div>
        <div className="stat-label">Publications</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.messages}</div>
        <div className="stat-label">Messages contact</div>
      </div>
    </div>
  );
}