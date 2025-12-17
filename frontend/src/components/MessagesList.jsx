import { useEffect, useState } from 'react';
import { fetchMessages, markMessageRead, fetchMessageCounts } from '../api/messages';
import { CheckCircle, Mail, Phone } from 'lucide-react';

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [counts, setCounts] = useState({ total: 0, urgent: 0, unread: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchMessages();
      // sort: urgent first, unread next, then newest
      res.sort((a, b) => {
        const pa = ((a.priority || 'normal').toString().toLowerCase() === 'urgent') ? 0 : 1;
        const pb = ((b.priority || 'normal').toString().toLowerCase() === 'urgent') ? 0 : 1;
        if (pa !== pb) return pa - pb;
        if (a.read === b.read) return new Date(b.createdAt) - new Date(a.createdAt);
        return a.read - b.read; // false (0) before true (1)
      });
      setMessages(res);
      try {
        const c = await fetchMessageCounts();
        setCounts(c || { total: 0, urgent: 0, unread: 0 });
        // notify navbar or other listeners that counts may have changed
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('messages:updated', { detail: c }));
      } catch (e) {
        // ignore counts error
      }
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
    // optimistic update: mark locally and update counts without reloading
    let didChange = false;
    setMessages((prev) => {
      const next = prev.map((m) => {
        if (m._id === id && !m.read) {
          didChange = true;
          return { ...m, read: true };
        }
        return m;
      });
      // re-sort with same comparator so order remains consistent
      next.sort((a, b) => {
        const pa = ((a.priority || 'normal').toString().toLowerCase() === 'urgent') ? 0 : 1;
        const pb = ((b.priority || 'normal').toString().toLowerCase() === 'urgent') ? 0 : 1;
        if (pa !== pb) return pa - pb;
        if (a.read === b.read) return new Date(b.createdAt) - new Date(a.createdAt);
        return a.read - b.read;
      });
      return next;
    });

    if (didChange) {
      setCounts((c) => {
        const unread = Math.max(0, (c.unread || 0) - 1);
        const updated = { ...c, unread };
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('messages:updated', { detail: updated }));
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('message:read', { detail: { id } }));
        return updated;
      });
    }

    try {
      await markMessageRead(id);
      // success - fetch authoritative counts and notify listeners
      try {
        const c = await fetchMessageCounts();
        setCounts(c || { total: 0, urgent: 0, unread: 0 });
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('messages:updated', { detail: c }));
      } catch (e) {
        // ignore counts error
      }
    } catch (err) {
      // rollback to authoritative state on error
      await load();
      setError(err.message || 'Erreur');
    }
  };

  if (loading) return <div className="card">Chargement…</div>;
  if (error) return <div className="card error-message">{error}</div>;

  let visible = messages;
  if (showUnreadOnly) visible = visible.filter((m) => !m.read);
  if (showUrgentOnly) visible = visible.filter((m) => (m.priority || 'normal').toString().toLowerCase() === 'urgent');

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Messages reçus {counts.unread > 0 && <span style={{ marginLeft: 8 }} className="chip chip-accent">{counts.unread} non lu{counts.unread > 1 ? 's' : ''}</span>}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn-ghost ${!showUnreadOnly && !showUrgentOnly ? 'active' : ''}`} onClick={() => { setShowUnreadOnly(false); setShowUrgentOnly(false); }}>Tous</button>
          <button className={`btn-ghost ${showUnreadOnly ? 'active' : ''}`} onClick={() => { setShowUnreadOnly(true); setShowUrgentOnly(false); }}>Non lus</button>
          <button className={`btn-ghost ${showUrgentOnly ? 'active' : ''}`} onClick={() => { setShowUrgentOnly(true); setShowUnreadOnly(false); }}>Urgents</button>
        </div>
      </div>

      {visible.length === 0 && <p>Aucun message.</p>}
      <div className="messages-list">
        {visible.map((m) => (
          <div key={m._id} className={`message-item ${m.read ? 'read' : ''} ${m.priority === 'urgent' ? 'urgent' : ''}`}>
            <div className="message-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <strong>{m.firstName} {m.lastName}</strong>
                {m.priority === 'urgent' && <span className="priority-badge">URGENT</span>}
              </div>
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
