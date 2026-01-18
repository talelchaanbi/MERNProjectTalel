import { useEffect, useState } from 'react';
import { Search, UserPlus, UserMinus } from 'lucide-react';
import { searchUsers, toggleFollow, fetchFollowing } from '../api/social';
import { getOrCreateThread } from '../api/chat';

export default function ConnectionsBoard() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [following, setFollowing] = useState(new Set());

  const loadFollowing = async () => {
    const data = await fetchFollowing();
    setFollowing(new Set((data || []).map((u) => u._id)));
  };

  const search = async () => {
    const data = await searchUsers(query);
    setResults(data || []);
  };

  useEffect(() => {
    loadFollowing();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(), 350);
    return () => clearTimeout(t);
  }, [query]);

  const toggle = async (id) => {
    const res = await toggleFollow(id);
    setFollowing((prev) => {
      const next = new Set(prev);
      if (res.following) next.add(id); else next.delete(id);
      return next;
    });
  };

  const openChat = async (id) => {
    const thread = await getOrCreateThread(id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat:open', { detail: { threadId: thread._id } }));
    }
  };

  return (
    <div className="card">
      <h2>Réseau</h2>
      <div className="filter-field" style={{ marginBottom: 12 }}>
        <Search size={16} />
        <input placeholder="Rechercher des personnes" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="simple-list">
        {results.map((u) => (
          <div key={u._id} className="simple-list-row">
            <div className="post-author">
              <img className="avatar-small" src={u.profilePicture} alt="" />
              <div>
                <strong>{u.username}</strong>
                <div className="text-muted">{u.role}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost" onClick={() => openChat(u._id)}>
                Message
              </button>
              <button className="btn-ghost" onClick={() => toggle(u._id)}>
                {following.has(u._id) ? <UserMinus size={16} /> : <UserPlus size={16} />}
                {following.has(u._id) ? 'Se désabonner' : 'Se connecter'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}