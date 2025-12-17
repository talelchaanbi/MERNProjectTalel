import { useEffect, useState } from 'react';
import { fetchMessages, markMessageRead } from '../api/messages';
import { CheckCircle, Mail, Phone } from 'lucide-react';

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchMessages();
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
      setMessages((m) => m.map((it) => (it._id === id ? { ...it, read: true } : it)));
    } catch (err) {
      setError(err.message || 'Erreur');
    }
  };

  if (loading) return <div className="card">Chargement…</div>;
  if (error) return <div className="card error-message">{error}</div>;

  return (
    <div className="card">
      <h2>Messages reçus</h2>
      {messages.length === 0 && <p>Aucun message.</p>}
      <div className="messages-list">
        {messages.map((m) => (
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
