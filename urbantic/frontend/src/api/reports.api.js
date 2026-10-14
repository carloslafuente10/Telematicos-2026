import api from './client.js';

export async function list(filters = {}) {
  const response = await api.get('/reports', { params: filters });
  return response.data.data.reports;
}

export async function getById(id) {
  const response = await api.get(`/reports/${id}`);
  return response.data.data.report;
}

export async function create(payload) {
  const response = await api.post('/reports', payload);
  return response.data.data.report;
}

export async function assign(id, technicianId) {
  const response = await api.patch(`/reports/${id}/assignment`, { technicianId });
  return response.data.data.report;
}

export async function updateClassification(id, payload) {
  const response = await api.patch(`/reports/${id}/classification`, payload);
  return response.data.data.report;
}

export async function updateStatus(id, payload) {
  const response = await api.patch(`/reports/${id}/status`, payload);
  return response.data.data.report;
}

export async function decide(id, payload) {
  const response = await api.patch(`/reports/${id}/decision`, payload);
  return response.data.data.report;
}

export async function getStats() {
  const response = await api.get('/reports/stats');
  return response.data.data.stats;
}
