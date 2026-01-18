import { useEffect, useState } from 'react';
import { fetchRecommendedJobs, fetchRecommendedConsultants } from '../api/recommendations';

export default function RecommendationsBoard({ user }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'CONSULTANT') {
      fetchRecommendedJobs().then(setItems).catch((err) => setError(err.message || 'Erreur'));
    } else if (user?.role === 'RECRUT' || user?.role === 'ADMIN') {
      fetchRecommendedConsultants().then(setItems).catch((err) => setError(err.message || 'Erreur'));
    }
  }, [user?.role]);

  if (error) return <div className="card error-message">{error}</div>;

  return (
    <div className="card">
      <h2>Recommandations</h2>
      <div className="simple-list">
        {items.map((item) => (
          <div key={item._id} className="simple-list-row">
            {user?.role === 'CONSULTANT' ? (
              <div>
                <strong>{item.title}</strong>
                <div className="text-muted">{item.companyName || 'Entreprise'} • {item.location}</div>
              </div>
            ) : (
              <div>
                <strong>{item.user?.username || 'Consultant'}</strong>
                <div className="text-muted">{(item.skills || []).slice(0, 4).join(', ')}</div>
              </div>
            )}
            <span className="tag">Score {item.score || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}