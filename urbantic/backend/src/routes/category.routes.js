const { Router } = require('express');
const controller = require('../controllers/category.controller');
const authenticate = require('../middleware/auth.middleware');

const router = Router();
router.get('/', authenticate, controller.list);

module.exports = router;
