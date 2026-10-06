const userService = require('../services/user.service');

async function list(_req, res, next) {
  try {
    const users = await userService.list();
    res.json({ success: true, message: 'Usuarios obtenidos correctamente.', data: { users } });
  } catch (error) { next(error); }
}

async function technicians(_req, res, next) {
  try {
    const users = await userService.technicians();
    res.json({ success: true, message: 'Técnicos obtenidos correctamente.', data: { users } });
  } catch (error) { next(error); }
}

async function create(req, res, next) {
  try {
    const user = await userService.create(req.body);
    res.status(201).json({ success: true, message: 'Usuario creado correctamente.', data: { user } });
  } catch (error) { next(error); }
}

async function setStatus(req, res, next) {
  try {
    const user = await userService.setStatus(req.user.sub, req.params.id, req.body.active);
    res.json({ success: true, message: 'Estado del usuario actualizado.', data: { user } });
  } catch (error) { next(error); }
}

module.exports = { list, technicians, create, setStatus };
