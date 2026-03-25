const router = require('express').Router();
const videoController = require('../controllers/videoController');
const authenticate = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(authenticate);

router.get('/', videoController.listVideos);
router.post('/', authorize('professor', 'coordenacao'), videoController.createVideo);
router.put('/:id', authorize('professor', 'coordenacao'), videoController.updateVideo);
router.delete('/:id', authorize('professor', 'coordenacao'), videoController.deleteVideo);
router.get('/:id/views', authorize('professor', 'coordenacao'), videoController.getViews);
router.post('/:id/views', authorize('aluno'), videoController.recordView);

module.exports = router;
