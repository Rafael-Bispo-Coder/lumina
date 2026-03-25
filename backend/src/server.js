import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import classesRoutes from './routes/classesRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { errorHandler } from './middleware/error.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';
import { env } from './config/env.js';

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Lumina API running on port ${env.PORT}`);
});
