import api from './client.js';

export async function list() {
  const response = await api.get('/users');
  return response.data.data.users;
}

export async function listTechnicians() {
  const response = await api.get('/users/technicians');
  return response.data.data.users;
}

export async function create(payload) {
  const response = await api.post('/users', payload);
  return response.data.data.user;
}

export async function setStatus(id, active) {
  const response = await api.patch(`/users/${id}/status`, { active });
  return response.data.data.user;
}
