const router = require('express').Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(authenticate);
router.use(authorize('coordenacao'));

router.get('/', userController.listUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
