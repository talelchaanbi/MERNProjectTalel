import { useEffect, useState } from 'react';
import { fetchMessages, markMessageRead } from '../api/messages';
import { CheckCircle, Mail, Phone } from 'lucide-react';

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchMessages();
      // sort: unread first, then newest
      res.sort((a, b) => {
        if (a.read === b.read) return new Date(b.createdAt) - new Date(a.createdAt);
        return a.read - b.read; // false (0) before true (1)
      });
      setMessages(res);
    } catch (err) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markMessageRead(id);
      // refresh from server to keep authoritative state
      await load();
    } catch (err) {
      setError(err.message || 'Erreur');
    }
  };

  if (loading) return <div className="card">Chargement…</div>;
  if (error) return <div className="card error-message">{error}</div>;

  const visible = showUnreadOnly ? messages.filter((m) => !m.read) : messages;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Messages reçus</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn-ghost ${!showUnreadOnly ? 'active' : ''}`} onClick={() => setShowUnreadOnly(false)}>Tous</button>
          <button className={`btn-ghost ${showUnreadOnly ? 'active' : ''}`} onClick={() => setShowUnreadOnly(true)}>Non lus</button>
        </div>
      </div>

      {visible.length === 0 && <p>Aucun message.</p>}
      <div className="messages-list">
        {visible.map((m) => (
          <div key={m._id} className={`message-item ${m.read ? 'read' : ''}`}>
            <div className="message-head">
              <strong>{m.firstName} {m.lastName}</strong>
              <div className="message-meta">
                <span><Mail size={14} /> {m.email}</span>
                {m.phone && <span><Phone size={14} /> {m.phone}</span>}
                <small>{new Date(m.createdAt).toLocaleString()}</small>
              </div>
            </div>
            <p className="message-body">{m.message}</p>
            <div className="message-actions">
              <button className="btn-secondary" onClick={() => handleMarkRead(m._id)} disabled={m.read}><CheckCircle size={16} /> {m.read ? 'Lu' : 'Marquer comme lu'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
