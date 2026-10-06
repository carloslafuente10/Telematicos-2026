const reportModel = require('../models/report.model');
const AppError = require('../utils/AppError');

const validStatuses = ['CREADO', 'EN_REVISION', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];

function actorFromToken(user) {
  return { id: Number(user.sub), role: user.role };
}

function parseId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('Identificador de reporte inválido.', 400);
  return id;
}

async function list(user, filters) {
  const sanitized = {
    type: typeof filters.type === 'string' ? filters.type.trim() : '',
    status: typeof filters.status === 'string' ? filters.status.trim().toUpperCase() : '',
    search: typeof filters.search === 'string' ? filters.search.trim().slice(0, 100) : ''
  };
  if (sanitized.status && !validStatuses.includes(sanitized.status)) {
    throw new AppError('Estado de reporte inválido.', 400);
  }
  return reportModel.list(actorFromToken(user), sanitized);
}

async function getById(user, rawId) {
  const id = parseId(rawId);
  const report = await reportModel.findById(id, actorFromToken(user));
  if (!report) throw new AppError('Reporte no encontrado.', 404);
  report.history = await reportModel.getHistory(id);
  return report;
}

async function create(user, payload) {
  const report = await reportModel.create(Number(user.sub), payload);
  if (!report) throw new AppError('La categoría seleccionada no está disponible.', 400);
  report.history = await reportModel.getHistory(Number(report.id));
  return report;
}

async function assign(user, rawId, technicianId) {
  const id = parseId(rawId);
  const result = await reportModel.assign(id, Number(technicianId), Number(user.sub));
  if (result.reason === 'technician') throw new AppError('Técnico no encontrado o inactivo.', 400);
  if (result.reason === 'report') throw new AppError('Reporte no encontrado.', 404);
  return result.report;
}

async function updateStatus(user, rawId, payload) {
  const id = parseId(rawId);
  const normalized = { ...payload, status: payload.status.toUpperCase() };

  if (user.role === 'TECNICO' && !['ASIGNADO', 'EN_PROCESO', 'RESUELTO'].includes(normalized.status)) {
    throw new AppError('El técnico no puede establecer este estado.', 403);
  }

  const report = await reportModel.updateStatus(id, actorFromToken(user), normalized);
  if (!report) throw new AppError('Reporte no encontrado o no asignado al técnico.', 404);
  return report;
}

module.exports = { list, getById, create, assign, updateStatus };
