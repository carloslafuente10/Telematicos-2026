const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userModel = require('../models/user.model');
const AppError = require('../utils/AppError');

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );
}

async function register(payload) {
  const existingUser = await userModel.findByEmail(payload.email);

  if (existingUser) {
    throw new AppError('El correo ya esta registrado.', 409, [
      { field: 'email', message: 'Ya existe un usuario con este correo.' }
    ]);
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await userModel.createCitizen({
    email: payload.email,
    passwordHash,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone
  });

  const token = signToken(user);

  return {
    user: sanitizeUser(user),
    token
  };
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);

  if (!user) {
    throw new AppError('Credenciales invalidas.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError('Credenciales invalidas.', 401);
  }

  if (!user.is_active) {
    throw new AppError('Usuario inactivo.', 403);
  }

  return {
    user: sanitizeUser(user),
    token: signToken(user)
  };
}

async function getMe(userId) {
  const user = await userModel.findById(userId);

  if (!user || !user.is_active) {
    throw new AppError('Usuario no autorizado.', 401);
  }

  return sanitizeUser(user);
}

async function updateProfile(userId, payload) {
  const allowedFields = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: Object.prototype.hasOwnProperty.call(payload, 'phone') ? payload.phone : undefined
  };

  const user = await userModel.updateProfile(userId, allowedFields);

  if (!user) {
    throw new AppError('Usuario no encontrado.', 404);
  }

  return sanitizeUser(user);
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
