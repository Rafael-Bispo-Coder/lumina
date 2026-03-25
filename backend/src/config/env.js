import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().default(7),
  BCRYPT_ROUNDS: z.coerce.number().min(8).max(14).default(10),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  WATCH_COMPLETION_PERCENT: z.coerce.number().min(1).max(100).default(90),
});

export const env = envSchema.parse(process.env);
