import { useEffect, useState, useMemo, useRef } from 'react';
import { fetchMessages, markMessageRead, fetchMessageCounts } from '../api/messages';
import { CheckCircle, Mail, Phone, Search, X, Trash2 } from 'lucide-react';

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [counts, setCounts] = useState({ total: 0, urgent: 0, unread: 0 });
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all | 1 | 7 | 30
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

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

  // debounce search input to avoid filtering on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // load recent searches from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('messagesRecentSearches');
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const saveRecent = (q) => {
    if (!q || !q.trim()) return;
    try {
      const arr = [q, ...(recentSearches || [])].filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 6);
      setRecentSearches(arr);
      localStorage.setItem('messagesRecentSearches', JSON.stringify(arr));
    } catch (e) {}
  };

  const initials = (firstName, lastName) => {
    const a = (firstName || '').trim().charAt(0) || '';
    const b = (lastName || '').trim().charAt(0) || '';
    return (a + b).toUpperCase() || '?';
  };

  const colorFrom = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    const hue = Math.abs(h) % 360;
    return `hsl(${hue} 60% 60%)`;
  };

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  };

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const highlightText = (text, q) => {
    if (!q) return text;
    try {
      const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, 'gi'));
      return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <span key={i} className="search-highlight">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    } catch (e) {
      return text;
    }
  };

  const visibleMessages = useMemo(() => {
    let list = messages;
    if (showUnreadOnly) list = list.filter((m) => !m.read);
    if (showUrgentOnly) list = list.filter((m) => (m.priority || 'normal').toString().toLowerCase() === 'urgent');
    // apply debounced search for better UX
    if (debouncedSearch && debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((m) => (`${m.firstName} ${m.lastName} ${m.email} ${m.message}`.toLowerCase().indexOf(q) !== -1));
    }
    // apply date filter (days)
    if (dateFilter && dateFilter !== 'all') {
      const days = Number(dateFilter);
      if (!Number.isNaN(days) && days > 0) {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        list = list.filter((m) => new Date(m.createdAt).getTime() >= cutoff);
      }
      if (dateFilter === '1') {
        // today: messages with same calendar day
        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        list = list.filter((m) => new Date(m.createdAt).getTime() >= startOfToday.getTime());
      }
    }
    return list;
  }, [messages, showUnreadOnly, showUrgentOnly, debouncedSearch, dateFilter]);

  // live suggestions (not debounced) for typeahead dropdown
  const suggestions = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return [];
    return messages
      .map((m) => ({
        id: m._id,
        label: `${m.firstName} ${m.lastName}`,
        snippet: m.message || '',
        score: (`${m.firstName} ${m.lastName} ${m.email} ${m.message}`.toLowerCase().indexOf(q)),
      }))
      .filter((s) => s.score !== -1)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6);
  }, [messages, search]);

  const onInputKeyDown = (e) => {
    if (!suggestionsOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((i) => Math.min((suggestions || []).length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((i) => Math.max(-1, i - 1));
    } else if (e.key === 'Enter') {
      if (activeSuggestion >= 0) {
        const s = suggestions[activeSuggestion];
        if (s) {
          setExpandedId(s.id);
          setSearch(s.label);
          setDebouncedSearch(s.label);
          saveRecent(s.label);
          setSuggestionsOpen(false);
          setActiveSuggestion(-1);
          e.preventDefault();
        }
      } else {
        // commit free text search
        saveRecent(search);
        setSuggestionsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false);
      setActiveSuggestion(-1);
    }
  };

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

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0 }}>Messages reçus</h2>
          {counts.unread > 0 && <span style={{ marginLeft: 8 }} className="chip chip-accent">{counts.unread} non lu{counts.unread > 1 ? 's' : ''}</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
            <button className="btn-ghost" onClick={async () => {
              // mark all visible unread messages as read
              const toMark = visibleMessages.filter(m => !m.read).map(m => m._id);
              if (toMark.length === 0) return;
              // optimistic
              setMessages(prev => prev.map(p => toMark.includes(p._id) ? { ...p, read: true } : p));
              setCounts(c => ({ ...c, unread: 0 }));
              for (const id of toMark) {
                try { await markMessageRead(id); } catch (e) { /* ignore per-item errors */ }
              }
            }}>Marquer tout lu</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div className="messages-search" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} />
              <input
                ref={inputRef}
                placeholder="Rechercher (nom, email, message)"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSuggestionsOpen(true); setActiveSuggestion(-1); }}
                onKeyDown={onInputKeyDown}
                onFocus={() => { if (search) setSuggestionsOpen(true); }}
                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
              />
              {search && <button className="btn-ghost" onClick={() => { setSearch(''); setDebouncedSearch(''); setSuggestionsOpen(false); }}><X size={14} /></button>}
            </div>

            {/* suggestions dropdown */}
            {suggestionsOpen && suggestions && suggestions.length > 0 && (
              <div className="suggestions-box card" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 40, padding: 8 }}>
                {suggestions.map((s, idx) => (
                  <div key={s.id} className={`suggestion-item ${idx === activeSuggestion ? 'active' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '8px', borderRadius: 8, cursor: 'pointer' }} onMouseDown={(ev) => { ev.preventDefault(); setExpandedId(s.id); setSearch(s.label); setDebouncedSearch(s.label); saveRecent(s.label); setSuggestionsOpen(false); }} onMouseEnter={() => setActiveSuggestion(idx)}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div className="avatar-small" style={{ width: 36, height: 36, borderRadius: 8 }}>{s.label.split(' ').map(p=>p.charAt(0)).join('').slice(0,2).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{highlightText(s.label, search)}</div>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>{highlightText(s.snippet.slice(0, 80), search)}</div>
                      </div>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>voir</div>
                  </div>
                ))}
              </div>
            )}

            {/* recent searches chips */}
            {recentSearches && recentSearches.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {recentSearches.map((r) => (
                  <button key={r} className="btn-ghost" onClick={() => { setSearch(r); setDebouncedSearch(r); setSuggestionsOpen(false); }}>{r}</button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="chip">Filtrer par jours :</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className={`btn-ghost ${dateFilter === 'all' ? 'active' : ''}`} onClick={() => setDateFilter('all')}>Tous</button>
              <button className={`btn-ghost ${dateFilter === '1' ? 'active' : ''}`} onClick={() => setDateFilter('1')}>Aujourd'hui</button>
              <button className={`btn-ghost ${dateFilter === '7' ? 'active' : ''}`} onClick={() => setDateFilter('7')}>7j</button>
              <button className={`btn-ghost ${dateFilter === '30' ? 'active' : ''}`} onClick={() => setDateFilter('30')}>30j</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 8 }}>
        <button className={`btn-ghost ${!showUnreadOnly && !showUrgentOnly ? 'active' : ''}`} onClick={() => { setShowUnreadOnly(false); setShowUrgentOnly(false); }}>Tous ({counts.total})</button>
        <button className={`btn-ghost ${showUnreadOnly ? 'active' : ''}`} onClick={() => { setShowUnreadOnly(true); setShowUrgentOnly(false); }}>Non lus ({counts.unread})</button>
        <button className={`btn-ghost ${showUrgentOnly ? 'active' : ''}`} onClick={() => { setShowUrgentOnly(true); setShowUnreadOnly(false); }}>Urgents ({counts.urgent})</button>
      </div>

      {visibleMessages.length === 0 && <p>Aucun message.</p>}
      <div className="messages-list" style={{ display: 'grid', gap: 10 }}>
        {visibleMessages.map((m) => {
          const isExpanded = expandedId === m._id;
          const avatarColor = colorFrom((m.email || m.firstName || m.lastName || '').toString());
          return (
            <div key={m._id} className={`message-item ${m.read ? 'read' : ''} ${m.priority === 'urgent' ? 'urgent' : ''}`} style={{ padding: 12, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', background: m.read ? '#fff' : '#fbfbff' }}>
              <div className="message-head" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {initials(m.firstName, m.lastName)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong className="message-sender">{debouncedSearch ? <>{highlightText(`${m.firstName} ${m.lastName}`, debouncedSearch)}</> : `${m.firstName} ${m.lastName}`}</strong>
                      {m.priority === 'urgent' && <span style={{ background: '#ffdddd', color: '#b30000', padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>URGENT</span>}
                      {!m.read && <span style={{ background: '#eef2ff', color: '#3730a3', padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>NOUVEAU</span>}
                    </div>
                    <div style={{ marginTop: 4, color: '#6b7280', fontSize: 13 }}>
                      <span style={{ marginRight: 8 }}><Mail size={14} /> {debouncedSearch ? highlightText(m.email || '', debouncedSearch) : m.email}</span>
                      {m.phone && <span style={{ marginLeft: 8 }}><Phone size={14} /> {m.phone}</span>}
                      <small style={{ marginLeft: 12 }}>{timeAgo(m.createdAt)} ago</small>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="btn-ghost" onClick={() => { setExpandedId(isExpanded ? null : m._id); }}>{isExpanded ? 'Réduire' : 'Voir'}</button>
                  <button className="btn-ghost" onClick={() => handleMarkRead(m._id)} disabled={m.read}><CheckCircle size={16} /> {m.read ? 'Lu' : ''}</button>
                </div>
              </div>

              <div className={`message-body ${isExpanded ? 'expanded' : 'collapsed'}`} style={{ marginTop: 10, color: '#111827' }}>
                {isExpanded ? (
                  <>
                    <p style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>{debouncedSearch ? highlightText(m.message || '', debouncedSearch) : m.message}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-outline" onClick={() => { navigator.clipboard?.writeText(m.message); }}>Copier</button>
                      <button className="btn-ghost btn-danger" onClick={async () => { if (confirm('Supprimer ce message ?')) { try { await fetch(`/api/messages/${m._id}`, { method: 'DELETE' }); setMessages(prev => prev.filter(p => p._id !== m._id)); } catch (e) { alert('Erreur suppression'); } } }}><Trash2 size={14} /> Supprimer</button>
                    </div>
                  </>
                ) : (
                  <p style={{ margin: 0, color: '#374151' }}>{debouncedSearch ? highlightText(m.message.length > 160 ? m.message.slice(0, 160) + '…' : m.message, debouncedSearch) : (m.message.length > 160 ? m.message.slice(0, 160) + '…' : m.message)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
