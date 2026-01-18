import client from './client';

export const applyToJob = async ({ jobId, coverLetter, cvUrl }) => {
  const res = await client.post('/applications', { jobId, coverLetter, cvUrl });
  return res.data;
};

export const fetchMyApplications = async () => {
  const res = await client.get('/applications/me');
  return res.data;
};

export const fetchApplicationsForJob = async (jobId) => {
  const res = await client.get(`/applications/job/${jobId}`);
  return res.data;
};

export const updateApplicationStatus = async (id, status) => {
  const res = await client.patch(`/applications/${id}/status`, { status });
  return res.data;
};

export default { applyToJob, fetchMyApplications, fetchApplicationsForJob, updateApplicationStatus };