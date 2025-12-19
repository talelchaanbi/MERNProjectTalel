import client from '../api/client';

export async function login(payload) {
  const { data } = await client.post('/auth/login', payload);
  return data;
}

export async function logout() {
  await client.post('/auth/logout');
}

export async function registerUser(formData) {
  const { data } = await client.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchCurrentUser() {
  // Use the public status endpoint to avoid 401 network errors when user is not authenticated
  const { data } = await client.get('/auth/status');
  return data;
}

export async function fetchAllUsers() {
  const { data } = await client.get('/auth/users');
  return data;
}

export async function updateProfile(formData) {
  const { data } = await client.put('/auth/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateUserStatus(userId, isActive) {
  const { data } = await client.put(`/auth/users/${userId}/status`, { isActive });
  return data;
}

export async function deleteUser(userId) {
  const { data } = await client.delete(`/auth/users/${userId}`);
  return data;
}

export async function updateUserByAdmin(userId, formData) {
  const { data } = await client.put(`/auth/users/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getUserById(userId) {
  const { data } = await client.get(`/auth/users/${userId}`);
  return data;
}

export async function verifyEmail({ token, id }) {
  const { data } = await client.get(`/auth/verify?token=${encodeURIComponent(token)}&id=${encodeURIComponent(id)}`);
  return data;
}

export async function resendVerification(email) {
  const { data } = await client.post('/auth/resend-verification', { email });
  return data;
}
