const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const {
  validate,
  registerSchema,
  loginSchema,
  profileSchema
} = require('../middleware/validate.middleware');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, validate(profileSchema), authController.updateProfile);

module.exports = router;
