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
  const { data } = await client.get('/auth/me');
  return data;
}

export async function fetchAllUsers() {
  const { data } = await client.get('/auth/users');
  return data;
}
