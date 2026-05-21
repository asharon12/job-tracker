import { Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types';

const roundSchema = z.object({
  roundType: z.enum(['HR_SCREEN', 'OA', 'DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'CASE_STUDY', 'OTHER']),
  scheduledDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  outcome: z.enum(['PENDING', 'PASSED', 'FAILED', 'CANCELLED']).optional(),
});

const verifyApplicationOwnership = async (applicationId: string, userId: string) => {
  return prisma.application.findFirst({ where: { id: applicationId, userId } });
};

export const getRounds = async (req: AuthRequest, res: Response): Promise<void> => {
  const app = await verifyApplicationOwnership(req.params.applicationId, req.userId!);
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const rounds = await prisma.interviewRound.findMany({
    where: { applicationId: req.params.applicationId },
    orderBy: { roundNumber: 'asc' },
  });
  res.json(rounds);
};

export const addRound = async (req: AuthRequest, res: Response): Promise<void> => {
  const app = await verifyApplicationOwnership(req.params.applicationId, req.userId!);
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  const parsed = roundSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const lastRound = await prisma.interviewRound.findFirst({
    where: { applicationId: req.params.applicationId },
    orderBy: { roundNumber: 'desc' },
  });
  const nextRoundNumber = lastRound ? lastRound.roundNumber + 1 : 1;

  const round = await prisma.interviewRound.create({
    data: {
      applicationId: req.params.applicationId,
      roundNumber: nextRoundNumber,
      roundType: parsed.data.roundType,
      scheduledDate: parsed.data.scheduledDate ? new Date(parsed.data.scheduledDate) : null,
      notes: parsed.data.notes || null,
      outcome: parsed.data.outcome || 'PENDING',
    },
  });

  res.status(201).json(round);
};

export const updateRound = async (req: AuthRequest, res: Response): Promise<void> => {
  const app = await verifyApplicationOwnership(req.params.applicationId, req.userId!);
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  const round = await prisma.interviewRound.findFirst({
    where: { id: req.params.roundId, applicationId: req.params.applicationId },
  });
  if (!round) {
    res.status(404).json({ error: 'Round not found' });
    return;
  }

  const parsed = roundSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const updated = await prisma.interviewRound.update({
    where: { id: req.params.roundId },
    data: {
      ...(parsed.data.roundType && { roundType: parsed.data.roundType }),
      ...(parsed.data.scheduledDate !== undefined && {
        scheduledDate: parsed.data.scheduledDate ? new Date(parsed.data.scheduledDate) : null,
      }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
      ...(parsed.data.outcome && { outcome: parsed.data.outcome }),
    },
  });

  res.json(updated);
};

export const deleteRound = async (req: AuthRequest, res: Response): Promise<void> => {
  const app = await verifyApplicationOwnership(req.params.applicationId, req.userId!);
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  const round = await prisma.interviewRound.findFirst({
    where: { id: req.params.roundId, applicationId: req.params.applicationId },
  });
  if (!round) {
    res.status(404).json({ error: 'Round not found' });
    return;
  }

  await prisma.interviewRound.delete({ where: { id: req.params.roundId } });

  // Re-number remaining rounds sequentially
  const remaining = await prisma.interviewRound.findMany({
    where: { applicationId: req.params.applicationId },
    orderBy: { roundNumber: 'asc' },
  });
  for (let i = 0; i < remaining.length; i++) {
    await prisma.interviewRound.update({
      where: { id: remaining[i].id },
      data: { roundNumber: i + 1 },
    });
  }

  res.status(204).send();
};
