const { Router } = require('express');
const controller = require('../controllers/report.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { validate, reportSchema, assignmentSchema, statusSchema } = require('../middleware/validate.middleware');

const router = Router();
router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('CIUDADANO'), validate(reportSchema), controller.create);
router.patch('/:id/assignment', authorize('ADMINISTRADOR'), validate(assignmentSchema), controller.assign);
router.patch('/:id/status', authorize('ADMINISTRADOR', 'TECNICO'), validate(statusSchema), controller.updateStatus);

module.exports = router;
