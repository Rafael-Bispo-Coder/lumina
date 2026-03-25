const router = require('express').Router();
const classController = require('../controllers/classController');
const authenticate = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(authenticate);

router.get('/', classController.listClasses);
router.post('/', authorize('coordenacao'), classController.createClass);
router.put('/:id', authorize('coordenacao'), classController.updateClass);
router.delete('/:id', authorize('coordenacao'), classController.deleteClass);
router.get('/:id/students', authorize('coordenacao', 'professor'), classController.getClassStudents);

module.exports = router;
