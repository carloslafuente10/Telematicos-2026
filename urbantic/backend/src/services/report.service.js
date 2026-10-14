const reportModel = require('../models/report.model');
const AppError = require('../utils/AppError');

const validStatuses = ['CREADO', 'EN_REVISION', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO', 'RECHAZADO'];
const validPriorities = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

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
    priority: typeof filters.priority === 'string' ? filters.priority.trim().toUpperCase() : '',
    search: typeof filters.search === 'string' ? filters.search.trim().slice(0, 100) : ''
  };
  if (sanitized.status && !validStatuses.includes(sanitized.status)) {
    throw new AppError('Estado de reporte inválido.', 400);
  }
  if (sanitized.priority && !validPriorities.includes(sanitized.priority)) {
    throw new AppError('Prioridad de reporte inválida.', 400);
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
  if (result.reason === 'state') throw new AppError('Solo se puede asignar un reporte creado, en revisión o ya asignado.', 409);
  return result.report;
}

async function updateClassification(user, rawId, payload) {
  const id = parseId(rawId);
  const result = await reportModel.updateClassification(id, {
    categoryId: Number(payload.categoryId),
    priority: payload.priority.toUpperCase()
  }, Number(user.sub));

  if (result.reason === 'category') throw new AppError('Categoría no encontrada o inactiva.', 400);
  if (result.reason === 'state') throw new AppError('Solo se puede clasificar un reporte antes de asignarlo.', 409);
  return result.report;
}

async function updateStatus(user, rawId, payload) {
  const id = parseId(rawId);
  const normalized = { ...payload, status: payload.status.toUpperCase() };
  const current = await reportModel.findById(id, actorFromToken(user));
  if (!current) throw new AppError('Reporte no encontrado o no asignado al técnico.', 404);

  const technicianTransitions = {
    ASIGNADO: ['EN_PROCESO'],
    EN_PROCESO: ['RESUELTO']
  };
  if (!technicianTransitions[current.status]?.includes(normalized.status)) {
    throw new AppError('La transición de estado no está permitida.', 409);
  }

  if (normalized.status === 'RESUELTO') {
    const observations = typeof normalized.observations === 'string' ? normalized.observations.trim() : '';
    const evidenceImages = Array.isArray(normalized.evidenceImages) ? normalized.evidenceImages : [];
    if (observations.length < 10) {
      throw new AppError('La observación técnica es obligatoria y debe tener al menos 10 caracteres.', 400);
    }
    if (evidenceImages.length === 0) {
      throw new AppError('Debes adjuntar al menos una foto de la solución.', 400);
    }
    if (evidenceImages.length > 5) {
      throw new AppError('Solo se permiten hasta 5 fotos de la solución.', 400);
    }
    normalized.observations = observations;
    normalized.evidenceImages = evidenceImages;
  }

  const report = await reportModel.updateStatus(id, actorFromToken(user), normalized);
  if (!report) throw new AppError('Reporte no encontrado o no asignado al técnico.', 404);
  return report;
}

async function decide(user, rawId, payload) {
  const id = parseId(rawId);
  const decision = payload.decision.toUpperCase();
  const reason = typeof payload.reason === 'string' ? payload.reason.trim() : '';
  const current = await reportModel.findById(id, actorFromToken(user));
  if (!current) throw new AppError('Reporte no encontrado.', 404);

  if (decision === 'CERRADO' && current.status !== 'RESUELTO') {
    throw new AppError('Solo se puede cerrar un reporte que ya fue resuelto.', 409);
  }
  if (decision === 'RECHAZADO' && !['CREADO', 'EN_REVISION'].includes(current.status)) {
    throw new AppError('Solo se puede rechazar un reporte que esté en revisión.', 409);
  }
  if (decision === 'RECHAZADO' && reason.length < 5) {
    throw new AppError('Debes indicar el motivo del rechazo.', 400);
  }

  return reportModel.updateStatus(id, actorFromToken(user), {
    status: decision,
    observations: reason || 'Solución validada por el administrador',
    rejectionReason: decision === 'RECHAZADO' ? reason : null
  });
}

async function stats() {
  return reportModel.getStats();
}

module.exports = { list, getById, create, assign, updateClassification, updateStatus, decide, stats };
