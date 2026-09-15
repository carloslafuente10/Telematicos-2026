import api from './client';

export async function register(payload) {
  const response = await api.post('/auth/register', payload);
  return response.data;
}

export async function login(payload) {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export async function me() {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function updateProfile(payload) {
  const response = await api.put('/auth/profile', payload);
  return response.data;
}
