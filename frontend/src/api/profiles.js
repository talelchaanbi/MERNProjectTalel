import client from './client';

export const fetchConsultantProfile = async () => {
  const res = await client.get('/profiles/consultant/me');
  return res.data;
};

export const updateConsultantProfile = async (formData) => {
  const res = await client.put('/profiles/consultant/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const fetchRecruiterProfile = async () => {
  const res = await client.get('/profiles/recruiter/me');
  return res.data;
};

export const updateRecruiterProfile = async (formData) => {
  const res = await client.put('/profiles/recruiter/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export default {
  fetchConsultantProfile,
  updateConsultantProfile,
  fetchRecruiterProfile,
  updateRecruiterProfile,
};