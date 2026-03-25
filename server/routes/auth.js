const router = require('express').Router();
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/auth');

router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
