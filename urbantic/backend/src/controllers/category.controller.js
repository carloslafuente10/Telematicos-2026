const categoryModel = require('../models/category.model');

async function list(req, res, next) {
  try {
    const categories = await categoryModel.list(req.user.role === 'ADMINISTRADOR');
    res.json({ success: true, message: 'Categorías obtenidas correctamente.', data: { categories } });
  } catch (error) { next(error); }
}

module.exports = { list };
