import client from './client';

export const fetchSummary = async () => {
  const res = await client.get('/stats/summary');
  return res.data;
};

export default { fetchSummary };