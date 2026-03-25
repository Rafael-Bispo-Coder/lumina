import { prisma } from '../lib/prisma.js';

export const auditLog = async ({ actorId, actorRole, action, entity, entityId = null, metadata = null }) => {
  if (!actorId || !actorRole) return;
  await prisma.activityLog.create({
    data: {
      actorId,
      actorRole,
      action,
      entity,
      entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
};
