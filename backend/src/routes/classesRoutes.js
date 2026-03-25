import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authorize, requireAuth } from '../middleware/auth.js';
import { auditLog } from '../services/audit.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { role, userId } = req.auth;
  if (role === 'COORDINATION' || role === 'ADMIN') {
    const data = await prisma.class.findMany({
      include: {
        teacher: { select: { id: true, name: true, email: true, role: true } },
        students: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(data);
  }

  if (role === 'TEACHER') {
    const data = await prisma.class.findMany({
      where: { teacherId: userId },
      include: { students: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(data);
  }

  const enrollments = await prisma.classStudent.findMany({
    where: { studentId: userId },
    include: { class: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(enrollments.map((item) => item.class));
});

router.post('/', authorize('COORDINATION', 'ADMIN'), async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    subject: z.string().min(2),
    period: z.string().min(2),
    teacherId: z.string().optional(),
  });
  const data = schema.parse(req.body);
  const created = await prisma.class.create({ data });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'CREATE_CLASS',
    entity: 'Class',
    entityId: created.id,
    metadata: data,
  });

  res.status(201).json(created);
});

router.patch('/:id', authorize('COORDINATION', 'ADMIN'), async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    subject: z.string().min(2).optional(),
    period: z.string().min(2).optional(),
    teacherId: z.string().nullable().optional(),
  });
  const data = schema.parse(req.body);
  const updated = await prisma.class.update({ where: { id: req.params.id }, data });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'UPDATE_CLASS',
    entity: 'Class',
    entityId: updated.id,
    metadata: data,
  });

  res.json(updated);
});

router.delete('/:id', authorize('COORDINATION', 'ADMIN'), async (req, res) => {
  await prisma.class.delete({ where: { id: req.params.id } });
  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'DELETE_CLASS',
    entity: 'Class',
    entityId: req.params.id,
  });
  res.json({ ok: true });
});

router.post('/:id/teacher', authorize('COORDINATION', 'ADMIN'), async (req, res) => {
  const schema = z.object({ teacherId: z.string() });
  const { teacherId } = schema.parse(req.body);
  const updated = await prisma.class.update({
    where: { id: req.params.id },
    data: { teacherId },
  });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'LINK_TEACHER_CLASS',
    entity: 'Class',
    entityId: req.params.id,
    metadata: { teacherId },
  });

  res.json(updated);
});

router.post('/:id/students', authorize('COORDINATION', 'ADMIN'), async (req, res) => {
  const schema = z.object({ studentIds: z.array(z.string()).min(1) });
  const { studentIds } = schema.parse(req.body);
  await prisma.classStudent.createMany({
    data: studentIds.map((studentId) => ({ classId: req.params.id, studentId })),
    skipDuplicates: true,
  });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'LINK_STUDENTS_CLASS',
    entity: 'Class',
    entityId: req.params.id,
    metadata: { count: studentIds.length },
  });

  const students = await prisma.classStudent.findMany({ where: { classId: req.params.id } });
  res.json(students);
});

export default router;
