import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Send, Search } from 'lucide-react';
import { fetchFeed, createPost, toggleLike, fetchComments, addComment } from '../api/social';

export default function SocialFeed({ user }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  const [query, setQuery] = useState('');
  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeed(query ? { q: query } : {});
      const normalized = (data || []).map((p) => ({
        ...p,
        likesCount: typeof p.likesCount === 'number' ? p.likesCount : (p.likes?.length || 0),
      }));
      setFeed(normalized);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement du feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(), 350);
    return () => clearTimeout(t);
  }, [query]);

  const submitPost = async () => {
    if (!content.trim()) return;
    try {
      const post = await createPost(content.trim());
      setContent('');
      setFeed((prev) => [{ ...post, likesCount: post.likes?.length || 0 }, ...prev]);
    } catch (err) {
      setError(err.message || 'Erreur lors de la publication');
    }
  };

  const onToggleLike = async (id) => {
    try {
      const res = await toggleLike(id);
      setFeed((prev) => prev.map((p) => (p._id === id ? { ...p, likesCount: res.likesCount } : p)));
    } catch (err) {
      // ignore
    }
  };

  const openComments = async (id) => {
    setCommentsOpen((p) => ({ ...p, [id]: !p[id] }));
    if (!commentsMap[id]) {
      const data = await fetchComments(id);
      setCommentsMap((prev) => ({ ...prev, [id]: data }));
    }
  };

  const sendComment = async (id) => {
    const text = (commentDrafts[id] || '').trim();
    if (!text) return;
    const comment = await addComment(id, text);
    setCommentsMap((prev) => ({ ...prev, [id]: [comment, ...(prev[id] || [])] }));
    setCommentDrafts((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="dashboard-container">
      <div className="card">
        <div className="filter-bar">
          <div className="filter-field">
            <Search size={16} />
            <input placeholder="Rechercher" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Publier</h2>
        <textarea
          rows={3}
          placeholder={`Quoi de neuf, ${user?.username || 'membre'} ?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={submitPost}>Publier</button>
        </div>
      </div>

      {loading && <div className="card">Chargement…</div>}
      {error && <div className="card error-message">{error}</div>}

      {feed.map((post) => (
        <div key={post._id} className="card post-card">
          <div className="post-header">
            <div className="post-author">
              {post.author?.profilePicture ? (
                <img className="avatar-small" src={post.author.profilePicture} alt="" />
              ) : (
                <div className="avatar-small placeholder">{(post.author?.username || '?')[0]}</div>
              )}
              <div>
                <strong>{post.author?.username || 'Utilisateur'}</strong>
                <div className="text-muted">{new Date(post.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
          <p className="post-content">{post.content}</p>
          <div className="post-actions">
            <button className="btn-ghost" onClick={() => onToggleLike(post._id)}>
              <Heart size={16} /> {(post.likesCount ?? post.likes?.length) || 0}
            </button>
            <button className="btn-ghost" onClick={() => openComments(post._id)}>
              <MessageCircle size={16} /> Commentaires
            </button>
          </div>

          {commentsOpen[post._id] && (
            <div className="post-comments">
              <div className="comment-input">
                <input
                  placeholder="Écrire un commentaire"
                  value={commentDrafts[post._id] || ''}
                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                />
                <button className="btn-primary" onClick={() => sendComment(post._id)}>
                  <Send size={16} />
                </button>
              </div>
              {(commentsMap[post._id] || []).map((c) => (
                <div key={c._id} className="comment-row">
                  <strong>{c.author?.username || 'Utilisateur'}</strong>
                  <span>{c.content}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}