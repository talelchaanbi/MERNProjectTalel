import client from './client';

export const fetchJobs = async (params = {}) => {
  const res = await client.get('/jobs', { params });
  return res.data;
};

export const fetchMyJobs = async () => {
  const res = await client.get('/jobs/mine');
  return res.data;
};

export const createJob = async (payload) => {
  const res = await client.post('/jobs', payload);
  return res.data;
};

export const updateJob = async (id, payload) => {
  const res = await client.put(`/jobs/${id}`, payload);
  return res.data;
};

export const deleteJob = async (id) => {
  const res = await client.delete(`/jobs/${id}`);
  return res.data;
};

export default { fetchJobs, fetchMyJobs, createJob, updateJob, deleteJob };