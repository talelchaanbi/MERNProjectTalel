import { useEffect, useState } from 'react';
import { fetchThreads, fetchMessages, sendMessage } from '../api/chat';
import { getSocket } from '../services/socket';

export default function ChatBoard({ user }) {
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [presence, setPresence] = useState({});

  const loadThreads = async () => {
    const data = await fetchThreads();
    setThreads(data || []);
    let preferredId = null;
    try {
      preferredId = localStorage.getItem('chat:threadId');
    } catch (e) {}
    if (preferredId) {
      const found = (data || []).find((t) => t._id === preferredId);
      if (found) {
        setSelected(found);
        return;
      }
    }
    if (!selected && data?.length) setSelected(data[0]);
  };

  const loadMessages = async (threadId) => {
    const data = await fetchMessages(threadId);
    setMessages(data || []);
  };

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selected?._id) loadMessages(selected._id);
  }, [selected?._id]);

  useEffect(() => {
    const socket = getSocket();
    if (selected?._id) socket.emit('joinThread', selected._id);
    if (selected?._id) socket.emit('threadRead', selected._id);
    const onMessage = (payload) => {
      if (!payload?.message || !payload?.threadId) return;
      if (payload.threadId !== selected?._id) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === payload.message._id)) return prev;
        return [...prev, payload.message];
      });
      socket.emit('threadRead', payload.threadId);
    };
    const onPresence = (payload) => {
      if (!payload?.userId) return;
      setPresence((prev) => ({ ...prev, [payload.userId]: payload.online }));
    };
    const onRead = (payload) => {
      if (!payload?.threadId || payload.threadId !== selected?._id) return;
      const readerId = payload.userId;
      setMessages((prev) =>
        prev.map((m) =>
          m.readBy?.includes(readerId)
            ? m
            : { ...m, readBy: [...(m.readBy || []), readerId] }
        )
      );
    };
    socket.on('chat:message', onMessage);
    socket.on('presence:update', onPresence);
    socket.on('chat:read', onRead);
    return () => {
      socket.off('chat:message', onMessage);
      socket.off('presence:update', onPresence);
      socket.off('chat:read', onRead);
    };
  }, [selected?._id]);

  const onSend = async () => {
    if (!content.trim() || !selected?._id) return;
    const msg = await sendMessage(selected._id, content.trim());
    setMessages((prev) => [...prev, msg]);
    setContent('');
  };

  const otherParticipants = (thread) =>
    (thread?.participants || []).filter((p) => String(p?._id || p) !== String(user?._id));

  const isReadByOthers = (message) => {
    const others = otherParticipants(selected).map((p) => String(p?._id || p));
    if (!others.length) return false;
    return others.every((id) => (message.readBy || []).map(String).includes(id));
  };

  return (
    <div className="card chat-board">
      <div className="chat-sidebar">
        <h2>Messages</h2>
        <div className="simple-list">
          {threads.map((t) => (
            <button key={t._id} className={`chat-thread ${selected?._id === t._id ? 'active' : ''}`} onClick={() => setSelected(t)}>
              <span className="chat-thread-title">
                {t.participants?.map((p) => p.username).join(' • ')}
              </span>
              <span className="chat-thread-status">
                {otherParticipants(t).some((p) => presence[String(p?._id || p)]) ? 'En ligne' : 'Hors ligne'}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="chat-main">
        <div className="chat-messages">
          {messages.map((m) => (
            <div key={m._id} className="chat-message">
              <strong>{m.sender?.username}</strong>
              <span>{m.content}</span>
              {String(m.sender?._id || '') === String(user?._id || '') && (
                <em className="chat-read">{isReadByOthers(m) ? 'Vu' : 'Envoyé'}</em>
              )}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Écrire un message" />
          <button className="btn-primary" onClick={onSend}>Envoyer</button>
        </div>
      </div>
    </div>
  );
}