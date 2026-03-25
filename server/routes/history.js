const router = require('express').Router();
const historyController = require('../controllers/historyController');
const authenticate = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(authenticate);
router.get('/', authorize('aluno'), historyController.listHistory);

module.exports = router;
