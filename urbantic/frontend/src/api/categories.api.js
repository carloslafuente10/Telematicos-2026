import api from './client.js';

export async function list() {
  const response = await api.get('/categories');
  return response.data.data.categories;
}
