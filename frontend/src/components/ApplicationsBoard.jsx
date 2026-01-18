import { useEffect, useState } from 'react';
import { fetchMyApplications } from '../api/applications';

const statusLabel = (status) => {
  const v = String(status || '').toUpperCase();
  if (v === 'PENDING') return 'En attente';
  if (v === 'IN_REVIEW') return 'En cours';
  if (v === 'INTERVIEW') return 'Entretien';
  if (v === 'ACCEPTED') return 'Accepté';
  if (v === 'REJECTED') return 'Refusé';
  return status || '—';
};

export default function ApplicationsBoard() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyApplications();
      setApps(data || []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="card">Chargement…</div>;
  if (error) return <div className="card error-message">{error}</div>;

  return (
    <div className="card full-width">
      <h2>Mes candidatures</h2>
      {apps.length === 0 ? (
        <p>Aucune candidature pour le moment.</p>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Offre</th>
                <th>Entreprise</th>
                <th>Localisation</th>
                <th>Statut</th>
                <th>Postulé le</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app._id}>
                  <td>{app.job?.title || '—'}</td>
                  <td>{app.job?.companyName || '—'}</td>
                  <td>{app.job?.location || '—'}</td>
                  <td>
                    <span className={`status-badge ${String(app.status || '').toLowerCase()}`}>
                      {statusLabel(app.status)}
                    </span>
                  </td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}