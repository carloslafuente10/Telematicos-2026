const AppError = require('../utils/AppError');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function validate(schema) {
  return (req, _res, next) => {
    const errors = [];

    Object.entries(schema).forEach(([field, rules]) => {
      const value = normalizeString(req.body[field]);
      req.body[field] = value;

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: 'Este campo es obligatorio.' });
        return;
      }

      if (value === undefined || value === null || value === '') {
        return;
      }

      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push({ field, message: 'Debe ser texto.' });
      }

      if (rules.email && !emailRegex.test(value)) {
        errors.push({ field, message: 'Debe ser un correo valido.' });
      }

      if (rules.min && value.length < rules.min) {
        errors.push({ field, message: `Debe tener al menos ${rules.min} caracteres.` });
      }

      if (rules.max && value.length > rules.max) {
        errors.push({ field, message: `Debe tener como maximo ${rules.max} caracteres.` });
      }
    });

    if (errors.length > 0) {
      return next(new AppError('Datos de entrada invalidos.', 400, errors));
    }

    return next();
  };
}

const registerSchema = {
  email: { required: true, type: 'string', email: true, max: 180 },
  password: { required: true, type: 'string', min: 8, max: 100 },
  firstName: { required: true, type: 'string', min: 2, max: 100 },
  lastName: { required: true, type: 'string', min: 2, max: 100 },
  phone: { required: false, type: 'string', max: 30 }
};

const loginSchema = {
  email: { required: true, type: 'string', email: true, max: 180 },
  password: { required: true, type: 'string', min: 1, max: 100 }
};

const profileSchema = {
  firstName: { required: false, type: 'string', min: 2, max: 100 },
  lastName: { required: false, type: 'string', min: 2, max: 100 },
  phone: { required: false, type: 'string', max: 30 }
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  profileSchema
};
