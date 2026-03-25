const router = require('express').Router();
const gradeController = require('../controllers/gradeController');
const authenticate = require('../middlewares/auth');

router.use(authenticate);

router.get('/', gradeController.listGrades);
router.get('/summary', gradeController.getGradesSummary);

module.exports = router;
