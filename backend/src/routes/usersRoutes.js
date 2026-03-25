import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authorize, requireAuth } from '../middleware/auth.js';
import { hashPassword } from '../utils/password.js';
import { auditLog } from '../services/audit.js';

const router = Router();

router.use(requireAuth, authorize('COORDINATION', 'ADMIN'));

router.get('/', async (req, res) => {
  const role = req.query.role;
  const users = await prisma.user.findMany({
    where: role ? { role: String(role) } : undefined,
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.post('/', async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['COORDINATION', 'TEACHER', 'STUDENT', 'ADMIN']),
  });
  const data = schema.parse(req.body);
  const user = await prisma.user.create({
    data: {
      ...data,
      passwordHash: await hashPassword(data.password),
      password: undefined,
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'CREATE_USER',
    entity: 'User',
    entityId: user.id,
    metadata: { role: user.role, email: user.email },
  });

  res.status(201).json(user);
});

router.patch('/:id', async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(['COORDINATION', 'TEACHER', 'STUDENT', 'ADMIN']).optional(),
    active: z.boolean().optional(),
  });
  const data = schema.parse(req.body);
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'UPDATE_USER',
    entity: 'User',
    entityId: updated.id,
    metadata: data,
  });

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'DELETE_USER',
    entity: 'User',
    entityId: req.params.id,
  });
  res.json({ ok: true });
});

router.post('/:id/force-reset', async (req, res) => {
  const schema = z.object({ newPassword: z.string().min(6) });
  const { newPassword } = schema.parse(req.body);

  await prisma.user.update({
    where: { id: req.params.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  await prisma.passwordReset.create({
    data: {
      targetId: req.params.id,
      resetById: req.auth.userId,
    },
  });

  await auditLog({
    actorId: req.auth.userId,
    actorRole: req.auth.role,
    action: 'FORCE_RESET_PASSWORD',
    entity: 'User',
    entityId: req.params.id,
  });

  res.json({ ok: true });
});

export default router;
