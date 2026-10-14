const { Router } = require('express');
const controller = require('../controllers/report.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  validate,
  reportSchema,
  assignmentSchema,
  classificationSchema,
  statusSchema,
  decisionSchema
} = require('../middleware/validate.middleware');

const router = Router();
router.use(authenticate);

router.get('/', controller.list);
router.get('/stats', authorize('ADMINISTRADOR'), controller.stats);
router.get('/:id', controller.getById);
router.post('/', authorize('CIUDADANO'), validate(reportSchema), controller.create);
router.patch('/:id/classification', authorize('ADMINISTRADOR'), validate(classificationSchema), controller.updateClassification);
router.patch('/:id/assignment', authorize('ADMINISTRADOR'), validate(assignmentSchema), controller.assign);
router.patch('/:id/status', authorize('TECNICO'), validate(statusSchema), controller.updateStatus);
router.patch('/:id/decision', authorize('ADMINISTRADOR'), validate(decisionSchema), controller.decide);

module.exports = router;
