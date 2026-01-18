import { useEffect, useMemo, useState } from 'react';
import { Briefcase, MapPin, Search, Building2, BadgeCheck, Clock } from 'lucide-react';
import { fetchJobs, fetchMyJobs } from '../api/jobs';
import { applyToJob } from '../api/applications';
import JobForm from './JobForm';

const levelLabel = (level) => {
  const v = String(level || '').toUpperCase();
  if (v === 'JUNIOR') return 'Junior';
  if (v === 'MID') return 'Confirmé';
  if (v === 'SENIOR') return 'Senior';
  if (v === 'EXPERT') return 'Expert';
  return level || '—';
};

export default function JobsBoard({ user }) {
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ q: '', location: '', level: '' });
  const [appliedIds, setAppliedIds] = useState(new Set());
  const isRecruiter = user?.role === 'RECRUT' || user?.role === 'ADMIN';
  const [recruiterView, setRecruiterView] = useState('list'); // list | create

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobs({
        q: filters.q || undefined,
        location: filters.location || undefined,
        level: filters.level || undefined,
      });
      setJobs(data || []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const loadMyJobs = async () => {
    if (!isRecruiter) return;
    try {
      const data = await fetchMyJobs();
      setMyJobs(data || []);
    } catch (err) {
      // ignore; recruiter will still see global list
    }
  };

  useEffect(() => {
    loadJobs();
    loadMyJobs();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadJobs(), 350);
    return () => clearTimeout(t);
  }, [filters.q, filters.location, filters.level]);

  const onApply = async (jobId) => {
    try {
      await applyToJob({ jobId });
      setAppliedIds((prev) => new Set([...prev, jobId]));
    } catch (err) {
      alert(err.message || 'Impossible de postuler');
    }
  };

  const jobCards = useMemo(() => jobs || [], [jobs]);

  return (
    <div className="dashboard-container">
      <div className="card">
        <div className="filter-bar">
          <div className="filter-field">
            <Search size={16} />
            <input
              placeholder="Rechercher une offre"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            />
          </div>
          <div className="filter-field">
            <MapPin size={16} />
            <input
              placeholder="Localisation"
              value={filters.location}
              onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className="filter-field">
            <select
              value={filters.level}
              onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value }))}
            >
              <option value="">Niveau</option>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Confirmé</option>
              <option value="SENIOR">Senior</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {isRecruiter && (
        <div className="card recruiter-panel">
          <div className="recruiter-panel-header">
            <h2>Gestion des offres</h2>
            <div className="segmented">
              <button
                className={`segmented-btn ${recruiterView === 'list' ? 'active' : ''}`}
                onClick={() => setRecruiterView('list')}
              >
                Affichage
              </button>
              <button
                className={`segmented-btn ${recruiterView === 'create' ? 'active' : ''}`}
                onClick={() => setRecruiterView('create')}
              >
                Création
              </button>
            </div>
          </div>

          {recruiterView === 'create' ? (
            <JobForm onCreated={() => { loadJobs(); loadMyJobs(); }} />
          ) : (
            <>
              {myJobs.length === 0 ? (
                <p>Aucune offre publiée pour le moment.</p>
              ) : (
                <div className="simple-list">
                  {myJobs.map((j) => (
                    <div key={j._id} className="simple-list-row">
                      <div>
                        <strong>{j.title}</strong>
                        <div className="text-muted">{j.location} • {levelLabel(j.experienceLevel)}</div>
                      </div>
                      <span className={`status-badge ${j.status?.toLowerCase()}`}>{j.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {loading && <div className="card">Chargement des offres…</div>}
      {error && <div className="card error-message">{error}</div>}

      <div className="jobs-grid">
        {jobCards.map((job) => (
          <div key={job._id} className="card job-card">
            <div className="job-card-header">
              <div>
                <h3>{job.title}</h3>
                <div className="job-meta">
                  <span><Building2 size={14} /> {job.companyName || 'Entreprise'}</span>
                  <span><MapPin size={14} /> {job.location}</span>
                  <span><Briefcase size={14} /> {levelLabel(job.experienceLevel)}</span>
                </div>
              </div>
              {job.remote && <span className="tag">Remote</span>}
            </div>
            <p className="job-desc">{job.description}</p>
            <div className="job-tags">
              {(job.skills || []).slice(0, 6).map((s) => (
                <span key={s} className="tag">{s}</span>
              ))}
            </div>
            <div className="job-actions">
              {user?.role === 'CONSULTANT' && (
                <button
                  className="btn-primary"
                  disabled={appliedIds.has(job._id)}
                  onClick={() => onApply(job._id)}
                >
                  {appliedIds.has(job._id) ? (
                    <>
                      <BadgeCheck size={16} /> Déjà postulé
                    </>
                  ) : (
                    'Postuler'
                  )}
                </button>
              )}
              <span className="job-date"><Clock size={14} /> {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}