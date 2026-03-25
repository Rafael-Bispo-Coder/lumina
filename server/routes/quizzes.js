const router = require('express').Router();
const quizController = require('../controllers/quizController');
const authenticate = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(authenticate);

router.get('/', quizController.listQuizzes);
router.post('/', authorize('professor', 'coordenacao'), quizController.createQuiz);
router.put('/:id', authorize('professor', 'coordenacao'), quizController.updateQuiz);
router.delete('/:id', authorize('professor', 'coordenacao'), quizController.deleteQuiz);
router.get('/:id/attempts', authorize('professor', 'coordenacao'), quizController.getAttempts);
router.post('/:id/attempts', authorize('aluno'), quizController.submitAttempt);

module.exports = router;
