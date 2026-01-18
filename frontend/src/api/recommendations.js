import client from './client';

export const fetchRecommendedJobs = async () => {
  const res = await client.get('/recommendations/jobs');
  return res.data;
};

export const fetchRecommendedConsultants = async () => {
  const res = await client.get('/recommendations/consultants');
  return res.data;
};

export default { fetchRecommendedJobs, fetchRecommendedConsultants };