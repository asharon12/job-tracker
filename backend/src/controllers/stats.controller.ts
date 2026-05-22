import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types';

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const applications = await prisma.application.findMany({
    where: { userId: req.userId },
    select: {
      status: true,
      salaryMin: true,
      salaryCurrency: true,
      createdAt: true,
    },
  });

  const pipeline = {
    APPLIED: 0,
    AWAITING_REFERRAL: 0,
    SCREENING: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0,
    GHOSTED: 0,
  };
  for (const app of applications) {
    pipeline[app.status]++;
  }

  const total = applications.length;
  const ghosted = pipeline.GHOSTED;
  const responseRate = total > 0 ? Math.round(((total - ghosted) / total) * 100) : 0;

  // Weekly activity for the last 12 weeks
  const now = new Date();
  const activity = Array.from({ length: 12 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (11 - i) * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return {
      week: weekStart.toISOString().split('T')[0],
      count: applications.filter(
        (a) => a.createdAt >= weekStart && a.createdAt < weekEnd
      ).length,
    };
  });

  const salaryApps = applications
    .filter((a) => a.salaryMin != null)
    .map((a) => ({
      min: a.salaryMin,
      currency: a.salaryCurrency ?? 'USD',
    }));

  res.json({ pipeline, responseRate, activity, salaryApps, total });
};
