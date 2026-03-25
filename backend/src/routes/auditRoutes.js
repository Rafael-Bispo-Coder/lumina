import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authorize, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, authorize('COORDINATION', 'ADMIN'));

router.get('/', async (_req, res) => {
  const logs = await prisma.activityLog.findMany({
    include: { actor: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: 300,
  });

  res.json(
    logs.map((log) => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    })),
  );
});

export default router;
