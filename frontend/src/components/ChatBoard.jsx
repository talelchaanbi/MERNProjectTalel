import { useEffect, useState } from 'react';
import { fetchThreads, fetchMessages, sendMessage } from '../api/chat';

export default function ChatBoard() {
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');

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

  const onSend = async () => {
    if (!content.trim() || !selected?._id) return;
    const msg = await sendMessage(selected._id, content.trim());
    setMessages((prev) => [...prev, msg]);
    setContent('');
  };

  return (
    <div className="card chat-board">
      <div className="chat-sidebar">
        <h2>Messages</h2>
        <div className="simple-list">
          {threads.map((t) => (
            <button key={t._id} className={`chat-thread ${selected?._id === t._id ? 'active' : ''}`} onClick={() => setSelected(t)}>
              {t.participants?.map((p) => p.username).join(' • ')}
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