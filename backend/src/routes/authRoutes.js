import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { comparePassword } from '../utils/password.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { requireAuth } from '../middleware/auth.js';
import { roleMap } from '../services/permissions.js';

const router = Router();

const loginSchema = z.object({
  profile: z.enum(['professor', 'aluno', 'coordenacao']),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/login', async (req, res) => {
  const { profile, email, password } = loginSchema.parse(req.body);
  const role = roleMap[profile];

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active || user.role !== role) {
    return res.status(401).json({ message: 'Credenciais inválidas para o perfil selecionado.' });
  }

  const validPassword = await comparePassword(password, user.passwordHash);
  if (!validPassword) return res.status(401).json({ message: 'Credenciais inválidas.' });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const decoded = verifyRefreshToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(decoded.exp * 1000),
    },
  });

  return res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.post('/refresh', async (req, res) => {
  const schema = z.object({ refreshToken: z.string().min(1) });
  const { refreshToken } = schema.parse(req.body);

  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!stored || !stored.user.active) {
      return res.status(401).json({ message: 'Refresh token inválido.' });
    }

    const accessToken = signAccessToken(stored.user);
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Refresh token inválido.' });
  }
});

router.post('/logout', async (req, res) => {
  const schema = z.object({ refreshToken: z.string().min(1) });
  const { refreshToken } = schema.parse(req.body);
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  if (!user || !user.active) return res.status(401).json({ message: 'Usuário inválido.' });
  return res.json(user);
});

export default router;
