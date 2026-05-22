import { Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types';
import { generateNotificationsForApplication } from '../lib/notifications';

const appSchema = z.object({
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  jobUrl: z.string().url().optional().nullable().or(z.literal('')),
  status: z.enum(['APPLIED', 'AWAITING_REFERRAL', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED']).optional(),
  jdRaw: z.string().optional().nullable(),
  resumeId: z.string().uuid().optional().nullable().or(z.literal('')),
  hasReferral: z.boolean().optional(),
  refereeName: z.string().optional().nullable(),
  refereeRole: z.string().optional().nullable(),
  refereeCompany: z.string().optional().nullable(),
  refereeLinkedin: z.string().optional().nullable(),
  salaryMin: z.preprocess((v) => (v === null || v === undefined || (typeof v === 'number' && isNaN(v)) ? null : v), z.number().optional().nullable()),
  salaryCurrency: z.string().optional(),
  workLocation: z.string().optional().nullable(),
  resumeName: z.string().optional().nullable(),
  appliedDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const ARCHIVED_STATUSES = ['REJECTED', 'GHOSTED'];

export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, search, page = '1', limit = '20', archived = 'false' } = req.query as Record<string, string>;

  const where: Record<string, unknown> = { userId: req.userId };
  if (archived === 'true') {
    where.status = { in: ARCHIVED_STATUSES };
  } else if (status) {
    where.status = status;
  } else {
    where.status = { notIn: ARCHIVED_STATUSES };
  }
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { jobTitle: { contains: search, mode: 'insensitive' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [total, applications] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        resume: { select: { id: true, name: true } },
        interviewRounds: { orderBy: { roundNumber: 'asc' } },
      },
    }),
  ]);

  res.json({ data: applications, total, page: pageNum, limit: limitNum });
};

export const getApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const app = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: {
      resume: { select: { id: true, name: true, fileUrl: true } },
      interviewRounds: { orderBy: { roundNumber: 'asc' } },
    },
  });
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(app);
};

export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = appSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  const app = await prisma.application.create({
    data: {
      userId: req.userId!,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      jobUrl: data.jobUrl || null,
      status: data.status,
      jdRaw: data.jdRaw || null,
      resumeId: data.resumeId || null,
      hasReferral: data.hasReferral ?? false,
      refereeName: data.refereeName || null,
      refereeRole: data.refereeRole || null,
      refereeCompany: data.refereeCompany || null,
      refereeLinkedin: data.refereeLinkedin || null,
      salaryMin: data.salaryMin ?? null,
      salaryCurrency: data.salaryCurrency || 'USD',
      workLocation: data.workLocation || null,
      resumeName: data.resumeName || null,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
      notes: data.notes || null,
    },
    include: {
      resume: { select: { id: true, name: true } },
      interviewRounds: true,
    },
  });

  await generateNotificationsForApplication(app.id, req.userId!);
  res.status(201).json(app);
};

export const updateApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  const parsed = appSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  const updated = await prisma.application.update({
    where: { id: req.params.id },
    data: {
      ...(data.companyName !== undefined && { companyName: data.companyName }),
      ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle }),
      ...(data.jobUrl !== undefined && { jobUrl: data.jobUrl || null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.jdRaw !== undefined && { jdRaw: data.jdRaw }),
      ...(data.resumeId !== undefined && { resumeId: data.resumeId }),
      ...(data.hasReferral !== undefined && { hasReferral: data.hasReferral }),
      ...(data.refereeName !== undefined && { refereeName: data.refereeName }),
      ...(data.refereeRole !== undefined && { refereeRole: data.refereeRole }),
      ...(data.refereeCompany !== undefined && { refereeCompany: data.refereeCompany }),
      ...(data.refereeLinkedin !== undefined && { refereeLinkedin: data.refereeLinkedin }),
      ...(data.salaryMin !== undefined && { salaryMin: data.salaryMin }),
      ...(data.salaryCurrency !== undefined && { salaryCurrency: data.salaryCurrency }),
      ...(data.workLocation !== undefined && { workLocation: data.workLocation }),
      ...(data.resumeName !== undefined && { resumeName: data.resumeName }),
      ...(data.appliedDate !== undefined && { appliedDate: data.appliedDate ? new Date(data.appliedDate) : null }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: {
      resume: { select: { id: true, name: true } },
      interviewRounds: { orderBy: { roundNumber: 'asc' } },
    },
  });

  await generateNotificationsForApplication(updated.id, req.userId!);
  res.json(updated);
};

export const deleteApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  await prisma.application.delete({ where: { id: req.params.id } });
  res.status(204).send();
};

