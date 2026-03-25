import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authorize, requireAuth } from '../middleware/auth.js';
import { canAccessClassAsStudent, canManageClass } from '../services/permissions.js';
import { auditLog } from '../services/audit.js';

const router = Router();
router.use(requireAuth);

router.get('/videos', async (req, res) => {
  const { role, userId } = req.auth;

  if (role === 'COORDINATION' || role === 'ADMIN') {
    const videos = await prisma.video.findMany({ include: { class: true }, orderBy: { createdAt: 'desc' } });
    return res.json(videos);
  }

  if (role === 'TEACHER') {
    const videos = await prisma.video.findMany({ where: { createdById: userId }, include: { class: true } });
    return res.json(videos);
  }

  const enrollments = await prisma.classStudent.findMany({ where: { studentId: userId }, select: { classId: true } });
  const videos = await prisma.video.findMany({
    where: { classId: { in: enrollments.map((x) => x.classId) } },
    include: { views: { where: { studentId: userId } } },
  });

  return res.json(
    videos.map((video) => {
      const view = video.views[0];
      return {
        ...video,
        status: !view ? 'not_started' : view.watched ? 'completed' : 'in_progress',
        progressPercent: view?.progressPercent ?? 0,
      };
    }),
  );
});

router.post('/videos', authorize('COORDINATION', 'ADMIN', 'TEACHER'), async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    description: z.string().min(2),
    url: z.string().url(),
    durationSec: z.coerce.number().int().positive(),
    classId: z.string(),
  });
  const data = schema.parse(req.body);

  const canManage = await canManageClass(req.auth.userId, req.auth.role, data.classId);
  if (!canManage) return res.status(403).json({ message: 'Sem permissão para essa turma.' });

  const video = await prisma.video.create({ data: { ...data, createdById: req.auth.userId } });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'CREATE_VIDEO',
    entity: 'Video',
    entityId: video.id,
    metadata: { classId: video.classId },
  });

  return res.status(201).json(video);
});

router.patch('/videos/:id', authorize('COORDINATION', 'ADMIN', 'TEACHER'), async (req, res) => {
  const schema = z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(2).optional(),
    url: z.string().url().optional(),
    durationSec: z.coerce.number().int().positive().optional(),
  });
  const data = schema.parse(req.body);

  const existing = await prisma.video.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Vídeo não encontrado.' });

  const canManage = await canManageClass(req.auth.userId, req.auth.role, existing.classId);
  if (!canManage) return res.status(403).json({ message: 'Sem permissão para editar esse vídeo.' });

  const updated = await prisma.video.update({ where: { id: req.params.id }, data });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'UPDATE_VIDEO',
    entity: 'Video',
    entityId: updated.id,
    metadata: data,
  });

  return res.json(updated);
});

router.delete('/videos/:id', authorize('COORDINATION', 'ADMIN', 'TEACHER'), async (req, res) => {
  const existing = await prisma.video.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Vídeo não encontrado.' });

  const canManage = await canManageClass(req.auth.userId, req.auth.role, existing.classId);
  if (!canManage) return res.status(403).json({ message: 'Sem permissão para remover esse vídeo.' });

  await prisma.video.delete({ where: { id: req.params.id } });
  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'DELETE_VIDEO',
    entity: 'Video',
    entityId: req.params.id,
  });

  return res.json({ ok: true });
});

router.post('/videos/:id/view', authorize('STUDENT'), async (req, res) => {
  const schema = z.object({ progressPercent: z.coerce.number().min(0).max(100), lastPositionSeconds: z.coerce.number().min(0) });
  const { progressPercent, lastPositionSeconds } = schema.parse(req.body);

  const video = await prisma.video.findUnique({ where: { id: req.params.id } });
  if (!video) return res.status(404).json({ message: 'Vídeo não encontrado.' });

  const allowed = await canAccessClassAsStudent(req.auth.userId, video.classId);
  if (!allowed) return res.status(403).json({ message: 'Sem acesso ao vídeo.' });

  const watched = progressPercent >= 90;
  const entry = await prisma.videoView.upsert({
    where: { videoId_studentId: { videoId: video.id, studentId: req.auth.userId } },
    update: {
      progressPercent,
      lastPositionSeconds,
      watched,
      watchedAt: watched ? new Date() : null,
    },
    create: {
      videoId: video.id,
      studentId: req.auth.userId,
      progressPercent,
      lastPositionSeconds,
      watched,
      watchedAt: watched ? new Date() : null,
    },
  });

  return res.json(entry);
});

router.get('/quizzes', async (req, res) => {
  const { role, userId } = req.auth;
  if (role === 'COORDINATION' || role === 'ADMIN') {
    return res.json(await prisma.quiz.findMany({ include: { class: true }, orderBy: { createdAt: 'desc' } }));
  }

  if (role === 'TEACHER') {
    return res.json(await prisma.quiz.findMany({ where: { createdById: userId }, include: { class: true } }));
  }

  const enrollments = await prisma.classStudent.findMany({ where: { studentId: userId }, select: { classId: true } });
  const quizzes = await prisma.quiz.findMany({
    where: { classId: { in: enrollments.map((x) => x.classId) }, status: 'ACTIVE' },
    include: { attempts: { where: { studentId: userId } } },
  });

  return res.json(
    quizzes.map((quiz) => {
      const attempt = quiz.attempts[0];
      return {
        ...quiz,
        statusLabel: attempt ? attempt.status.toLowerCase() : 'not_started',
        score: attempt?.score ?? 0,
      };
    }),
  );
});

router.post('/quizzes', authorize('COORDINATION', 'ADMIN', 'TEACHER'), async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    description: z.string().min(2),
    classId: z.string(),
    maxScore: z.coerce.number().int().positive(),
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).default('DRAFT'),
    questions: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        options: z.array(z.string()).min(2),
        answerIndex: z.coerce.number().int().min(0),
      }),
    ),
  });
  const data = schema.parse(req.body);

  const canManage = await canManageClass(req.auth.userId, req.auth.role, data.classId);
  if (!canManage) return res.status(403).json({ message: 'Sem permissão para essa turma.' });

  const quiz = await prisma.quiz.create({
    data: {
      title: data.title,
      description: data.description,
      classId: data.classId,
      maxScore: data.maxScore,
      status: data.status,
      questions: JSON.stringify(data.questions),
      createdById: req.auth.userId,
    },
  });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'CREATE_QUIZ',
    entity: 'Quiz',
    entityId: quiz.id,
    metadata: { classId: quiz.classId },
  });

  return res.status(201).json(quiz);
});

router.patch('/quizzes/:id', authorize('COORDINATION', 'ADMIN', 'TEACHER'), async (req, res) => {
  const schema = z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(2).optional(),
    maxScore: z.coerce.number().int().positive().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).optional(),
    questions: z
      .array(
        z.object({
          id: z.string(),
          text: z.string(),
          options: z.array(z.string()).min(2),
          answerIndex: z.coerce.number().int().min(0),
        }),
      )
      .optional(),
  });
  const data = schema.parse(req.body);

  const existing = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Quiz não encontrado.' });

  const canManage = await canManageClass(req.auth.userId, req.auth.role, existing.classId);
  if (!canManage) return res.status(403).json({ message: 'Sem permissão para editar esse quiz.' });

  const payload = {
    ...data,
    questions: data.questions ? JSON.stringify(data.questions) : undefined,
  };

  const updated = await prisma.quiz.update({ where: { id: req.params.id }, data: payload });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'UPDATE_QUIZ',
    entity: 'Quiz',
    entityId: updated.id,
    metadata: data,
  });

  return res.json(updated);
});

router.delete('/quizzes/:id', authorize('COORDINATION', 'ADMIN', 'TEACHER'), async (req, res) => {
  const existing = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Quiz não encontrado.' });

  const canManage = await canManageClass(req.auth.userId, req.auth.role, existing.classId);
  if (!canManage) return res.status(403).json({ message: 'Sem permissão para remover esse quiz.' });

  await prisma.quiz.delete({ where: { id: req.params.id } });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'DELETE_QUIZ',
    entity: 'Quiz',
    entityId: req.params.id,
  });

  return res.json({ ok: true });
});

router.post('/quizzes/:id/attempt/start', authorize('STUDENT'), async (req, res) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz || quiz.status !== 'ACTIVE') return res.status(404).json({ message: 'Quiz indisponível.' });

  const allowed = await canAccessClassAsStudent(req.auth.userId, quiz.classId);
  if (!allowed) return res.status(403).json({ message: 'Sem acesso ao quiz.' });

  const attempt = await prisma.quizAttempt.upsert({
    where: { quizId_studentId: { quizId: quiz.id, studentId: req.auth.userId } },
    update: { status: 'STARTED', startedAt: new Date(), maxScore: quiz.maxScore },
    create: {
      quizId: quiz.id,
      studentId: req.auth.userId,
      status: 'STARTED',
      startedAt: new Date(),
      maxScore: quiz.maxScore,
    },
  });

  return res.json(attempt);
});

router.post('/quizzes/:id/attempt/submit', authorize('STUDENT'), async (req, res) => {
  const schema = z.object({ answers: z.array(z.number().int().min(0)) });
  const { answers } = schema.parse(req.body);

  const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
  if (!quiz || quiz.status !== 'ACTIVE') return res.status(404).json({ message: 'Quiz indisponível.' });

  const allowed = await canAccessClassAsStudent(req.auth.userId, quiz.classId);
  if (!allowed) return res.status(403).json({ message: 'Sem acesso ao quiz.' });

  const questions = JSON.parse(quiz.questions);
  const correct = questions.reduce((sum, question, index) => sum + (answers[index] === question.answerIndex ? 1 : 0), 0);
  const score = Math.round((correct / Math.max(questions.length, 1)) * quiz.maxScore);

  const attempt = await prisma.quizAttempt.upsert({
    where: { quizId_studentId: { quizId: quiz.id, studentId: req.auth.userId } },
    update: {
      status: 'SUBMITTED',
      finishedAt: new Date(),
      score,
      maxScore: quiz.maxScore,
      answers: JSON.stringify(answers),
    },
    create: {
      quizId: quiz.id,
      studentId: req.auth.userId,
      status: 'SUBMITTED',
      startedAt: new Date(),
      finishedAt: new Date(),
      score,
      maxScore: quiz.maxScore,
      answers: JSON.stringify(answers),
    },
  });

  return res.json(attempt);
});

export default router;
