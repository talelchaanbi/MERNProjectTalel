import client from './client';

export const sendMessage = async (payload) => {
  const res = await client.post('/messages', payload);
  return res.data;
};

export const fetchMessages = async () => {
  const res = await client.get('/messages');
  return res.data;
};

export const fetchMessageCounts = async () => {
  const res = await client.get('/messages/counts');
  return res.data;
};

export const markMessageRead = async (id) => {
  const res = await client.patch(`/messages/${id}/read`);
  return res.data;
};

export default { sendMessage, fetchMessages, markMessageRead };
