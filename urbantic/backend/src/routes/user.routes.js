const { Router } = require('express');
const controller = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { validate, managedUserSchema, userStatusSchema } = require('../middleware/validate.middleware');

const router = Router();
router.use(authenticate, authorize('ADMINISTRADOR'));

router.get('/', controller.list);
router.get('/technicians', controller.technicians);
router.post('/', validate(managedUserSchema), controller.create);
router.patch('/:id/status', validate(userStatusSchema), controller.setStatus);

module.exports = router;
