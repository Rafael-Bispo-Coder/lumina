import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authorize, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, authorize('COORDINATION', 'ADMIN', 'TEACHER'));

const applyFilters = (query, classId, subject, period) => {
  if (classId) query.id = classId;
  if (subject) query.subject = subject;
  if (period) query.period = period;
  return query;
};

router.get('/kpis', async (req, res) => {
  const role = req.auth.role;
  const teacherWhere = role === 'TEACHER' ? { teacherId: req.auth.userId } : undefined;

  const [classesCount, videosCount, quizzesCount, studentsCount] = await Promise.all([
    prisma.class.count({ where: teacherWhere }),
    prisma.video.count({ where: role === 'TEACHER' ? { createdById: req.auth.userId } : undefined }),
    prisma.quiz.count({ where: role === 'TEACHER' ? { createdById: req.auth.userId } : undefined }),
    prisma.classStudent.count({ where: role === 'TEACHER' ? { class: { teacherId: req.auth.userId } } : undefined }),
  ]);

  return res.json({ classesCount, videosCount, quizzesCount, studentsCount });
});

router.get('/engagement/videos/:videoId', async (req, res) => {
  const video = await prisma.video.findUnique({ where: { id: req.params.videoId }, include: { class: true } });
  if (!video) return res.status(404).json({ message: 'Vídeo não encontrado.' });
  if (req.auth.role === 'TEACHER' && video.class.teacherId !== req.auth.userId) {
    return res.status(403).json({ message: 'Sem acesso.' });
  }

  const enrollments = await prisma.classStudent.findMany({ where: { classId: video.classId }, include: { student: true } });
  const views = await prisma.videoView.findMany({ where: { videoId: video.id } });
  const viewsMap = new Map(views.map((v) => [v.studentId, v]));

  const watched = [];
  const notWatched = [];

  for (const enrollment of enrollments) {
    const view = viewsMap.get(enrollment.studentId);
    const item = {
      studentId: enrollment.studentId,
      studentName: enrollment.student.name,
      watchedAt: view?.watchedAt ?? null,
      progressPercent: view?.progressPercent ?? 0,
    };

    if (view?.watched) watched.push(item);
    else notWatched.push(item);
  }

  return res.json({ watched, notWatched });
});

router.get('/engagement/quizzes/:quizId', async (req, res) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.quizId }, include: { class: true } });
  if (!quiz) return res.status(404).json({ message: 'Quiz não encontrado.' });
  if (req.auth.role === 'TEACHER' && quiz.class.teacherId !== req.auth.userId) {
    return res.status(403).json({ message: 'Sem acesso.' });
  }

  const enrollments = await prisma.classStudent.findMany({ where: { classId: quiz.classId }, include: { student: true } });
  const attempts = await prisma.quizAttempt.findMany({ where: { quizId: quiz.id } });
  const attemptsMap = new Map(attempts.map((a) => [a.studentId, a]));

  const done = [];
  const notDone = [];

  for (const enrollment of enrollments) {
    const attempt = attemptsMap.get(enrollment.studentId);
    const item = {
      studentId: enrollment.studentId,
      studentName: enrollment.student.name,
      attemptedAt: attempt?.finishedAt ?? attempt?.startedAt ?? null,
      score: attempt?.score ?? null,
      status: attempt?.status ?? 'NOT_STARTED',
    };

    if (attempt?.status === 'SUBMITTED') done.push(item);
    else notDone.push(item);
  }

  return res.json({ done, notDone });
});

router.get('/full', async (req, res) => {
  const { classId, subject, period } = req.query;

  const classWhere = applyFilters({}, classId, subject, period);
  if (req.auth.role === 'TEACHER') classWhere.teacherId = req.auth.userId;

  const classes = await prisma.class.findMany({
    where: classWhere,
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      students: { include: { student: { select: { id: true, name: true, email: true } } } },
      videos: { include: { views: true } },
      quizzes: { include: { attempts: true } },
    },
  });

  return res.json(classes);
});

export default router;
