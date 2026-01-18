import client from './client';

export const getOrCreateThread = async (userId) => {
  const res = await client.post('/chat/threads', { userId });
  return res.data;
};

export const fetchThreads = async () => {
  const res = await client.get('/chat/threads');
  return res.data;
};

export const fetchMessages = async (threadId) => {
  const res = await client.get(`/chat/threads/${threadId}/messages`);
  return res.data;
};

export const sendMessage = async (threadId, content) => {
  const res = await client.post(`/chat/threads/${threadId}/messages`, { content });
  return res.data;
};

export default { getOrCreateThread, fetchThreads, fetchMessages, sendMessage };