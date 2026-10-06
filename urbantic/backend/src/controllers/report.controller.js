const reportService = require('../services/report.service');

async function list(req, res, next) {
  try {
    const reports = await reportService.list(req.user, req.query);
    res.json({ success: true, message: 'Reportes obtenidos correctamente.', data: { reports } });
  } catch (error) { next(error); }
}

async function getById(req, res, next) {
  try {
    const report = await reportService.getById(req.user, req.params.id);
    res.json({ success: true, message: 'Reporte obtenido correctamente.', data: { report } });
  } catch (error) { next(error); }
}

async function create(req, res, next) {
  try {
    const report = await reportService.create(req.user, req.body);
    res.status(201).json({ success: true, message: 'Reporte creado correctamente.', data: { report } });
  } catch (error) { next(error); }
}

async function assign(req, res, next) {
  try {
    const report = await reportService.assign(req.user, req.params.id, req.body.technicianId);
    res.json({ success: true, message: 'Técnico asignado correctamente.', data: { report } });
  } catch (error) { next(error); }
}

async function updateStatus(req, res, next) {
  try {
    const report = await reportService.updateStatus(req.user, req.params.id, req.body);
    res.json({ success: true, message: 'Estado actualizado correctamente.', data: { report } });
  } catch (error) { next(error); }
}

module.exports = { list, getById, create, assign, updateStatus };
