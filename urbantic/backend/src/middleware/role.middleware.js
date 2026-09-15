const AppError = require('../utils/AppError');

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('No tiene permisos para acceder a este recurso.', 403));
    }

    return next();
  };
}

module.exports = authorize;
