import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';

import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';
import roundRoutes from './routes/round.routes';
import resumeRoutes from './routes/resume.routes';
import notificationRoutes from './routes/notification.routes';
import statsRoutes from './routes/stats.routes';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/applications/:applicationId/rounds', roundRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Daily cron at 8 AM — notifications are pre-scheduled via generateNotificationsForApplication.
// This job handles cleanup of old read notifications (older than 30 days).
cron.schedule('0 8 * * *', async () => {
  const { default: prisma } = await import('./lib/prisma');
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  await prisma.notification.deleteMany({ where: { isRead: true, createdAt: { lt: cutoff } } });
  console.log('[cron] Cleaned up old read notifications');
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
