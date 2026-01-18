import { useEffect, useState } from 'react';
import { fetchMyJobs } from '../api/jobs';
import { fetchApplicationsForJob, updateApplicationStatus } from '../api/applications';

const statusOptions = ['PENDING', 'IN_REVIEW', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];
const statusLabel = (s) => {
  const v = String(s || '').toUpperCase();
  if (v === 'PENDING') return 'En attente';
  if (v === 'IN_REVIEW') return 'En cours';
  if (v === 'INTERVIEW') return 'Entretien';
  if (v === 'ACCEPTED') return 'Accepté';
  if (v === 'REJECTED') return 'Refusé';
  return s || '—';
};

export default function JobApplicationsBoard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list | update
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [saving, setSaving] = useState(false);

  const loadJobs = async () => {
    try {
      const data = await fetchMyJobs();
      setJobs(data || []);
      if (data?.length && !selectedJobId) setSelectedJobId(data[0]._id);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des offres');
    }
  };

  const loadApps = async (jobId) => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplicationsForJob(jobId);
      setApps(data || []);
      setPendingUpdates({});
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) loadApps(selectedJobId);
  }, [selectedJobId]);

  const onStatusChange = (id, status) => {
    setPendingUpdates((prev) => ({ ...prev, [id]: status }));
  };

  const discardChanges = () => {
    setPendingUpdates({});
  };

  const saveChanges = async () => {
    const entries = Object.entries(pendingUpdates);
    if (entries.length === 0) return;
    setSaving(true);
    try {
      for (const [id, status] of entries) {
        await updateApplicationStatus(id, status);
      }
      setApps((prev) =>
        prev.map((a) => (pendingUpdates[a._id] ? { ...a, status: pendingUpdates[a._id] } : a))
      );
      setPendingUpdates({});
    } catch (err) {
      alert(err.message || 'Impossible de mettre à jour le statut');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card full-width">
      <div className="recruiter-panel-header">
        <h2>Candidatures reçues</h2>
        <div className="segmented">
          <button
            className={`segmented-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            Affichage
          </button>
          <button
            className={`segmented-btn ${viewMode === 'update' ? 'active' : ''}`}
            onClick={() => setViewMode('update')}
          >
            Mise à jour
          </button>
        </div>
      </div>
      {jobs.length === 0 ? (
        <p>Vous n'avez pas encore publié d'offres.</p>
      ) : (
        <div className="form-grid">
          <label className="form-label">
            Offre
            <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>{j.title}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {loading && <div className="card">Chargement…</div>}
      {error && <div className="error-message">{error}</div>}

      {apps.length > 0 && viewMode === 'list' && (
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table className="users-table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app._id}>
                  <td>{app.consultant?.username || '—'}</td>
                  <td>{app.consultant?.email || '—'}</td>
                  <td>{app.consultant?.phone || '—'}</td>
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

      {apps.length > 0 && viewMode === 'update' && (
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn-ghost" onClick={discardChanges} disabled={saving}>
              Annuler
            </button>
            <button className="btn-primary" onClick={saveChanges} disabled={saving || Object.keys(pendingUpdates).length === 0}>
              {saving ? 'Validation…' : 'Valider'}
            </button>
          </div>
          <table className="users-table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app._id}>
                  <td>{app.consultant?.username || '—'}</td>
                  <td>{app.consultant?.email || '—'}</td>
                  <td>{app.consultant?.phone || '—'}</td>
                  <td>
                    <select
                      value={pendingUpdates[app._id] || app.status}
                      onChange={(e) => onStatusChange(app._id, e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{statusLabel(s)}</option>
                      ))}
                    </select>
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