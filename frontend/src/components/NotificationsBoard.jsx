import { useEffect, useState } from 'react';
import { fetchNotifications, markRead, markAllRead } from '../api/notifications';
import { getSocket } from '../services/socket';

export default function NotificationsBoard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await fetchNotifications();
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    const onNotif = (payload) => {
      if (!payload) return;
      setItems((prev) => [payload, ...prev]);
    };
    socket.on('notification', onNotif);
    return () => socket.off('notification', onNotif);
  }, []);

  const onRead = async (id) => {
    await markRead(id);
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  const onReadAll = async () => {
    await markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) return <div className="card">Chargement…</div>;

  return (
    <div className="card">
      <div className="notifications-header">
        <h2>Notifications</h2>
        <button className="btn-ghost" onClick={onReadAll}>Tout marquer lu</button>
      </div>
      <div className="simple-list">
        {items.map((n) => (
          <div key={n._id} className={`simple-list-row ${n.read ? '' : 'unread'}`}>
            <div>
              <strong>{n.title}</strong>
              <div className="text-muted">{n.body}</div>
            </div>
            {!n.read && (
              <button className="btn-ghost" onClick={() => onRead(n._id)}>Lu</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}