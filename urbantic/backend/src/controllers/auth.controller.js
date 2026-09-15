const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const data = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente.',
      data
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);

    res.json({
      success: true,
      message: 'Inicio de sesion correcto.',
      data
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.sub);

    res.json({
      success: true,
      message: 'Perfil obtenido correctamente.',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.sub, req.body);

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente.',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  me,
  updateProfile
};
