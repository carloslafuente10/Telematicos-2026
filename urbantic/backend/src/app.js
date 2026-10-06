const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const reportRoutes = require('./routes/report.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors({
  origin: env.frontendUrl,
  credentials: true
}));
app.use(express.json({ limit: '8mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'URBANTIC API funcionando.',
    data: {
      status: 'ok'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada.',
    errors: []
  });
});

app.use(errorHandler);

module.exports = app;
