import { Response } from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types';
import { generateNotificationsForApplication } from '../lib/notifications';

const appSchema = z.object({
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  jobUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED']).optional(),
  jdRaw: z.string().optional(),
  resumeId: z.string().uuid().optional().nullable(),
  hasReferral: z.boolean().optional(),
  refereeName: z.string().optional().nullable(),
  refereeRole: z.string().optional().nullable(),
  refereeCompany: z.string().optional().nullable(),
  refereeLinkedin: z.string().optional().nullable(),
  salaryMin: z.number().optional().nullable(),
  salaryMax: z.number().optional().nullable(),
  salaryCurrency: z.string().optional(),
  workLocation: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional().nullable(),
  appliedDate: z.string().optional().nullable(),
  deadlineDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;

  const where: Record<string, unknown> = { userId: req.userId };
  if (status) where.status = status;
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
      salaryMax: data.salaryMax ?? null,
      salaryCurrency: data.salaryCurrency || 'USD',
      workLocation: data.workLocation || null,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
      deadlineDate: data.deadlineDate ? new Date(data.deadlineDate) : null,
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
      ...(data.salaryMax !== undefined && { salaryMax: data.salaryMax }),
      ...(data.salaryCurrency !== undefined && { salaryCurrency: data.salaryCurrency }),
      ...(data.workLocation !== undefined && { workLocation: data.workLocation }),
      ...(data.appliedDate !== undefined && { appliedDate: data.appliedDate ? new Date(data.appliedDate) : null }),
      ...(data.deadlineDate !== undefined && { deadlineDate: data.deadlineDate ? new Date(data.deadlineDate) : null }),
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

export const summarizeJD = async (req: AuthRequest, res: Response): Promise<void> => {
  const app = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  if (!app.jdRaw) {
    res.status(400).json({ error: 'No job description text to summarize' });
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a job description analyzer. Extract structured information from the following job description and return ONLY valid JSON matching this exact schema:
{
  "required_skills": ["string"],
  "nice_to_have": ["string"],
  "responsibilities": ["string"],
  "experience_required": "string",
  "tech_stack": ["string"],
  "work_location": "Remote | Hybrid | Onsite | Not specified"
}

Keep each array item concise (under 15 words). Return only the JSON, no markdown, no explanation.

Job Description:
${app.jdRaw}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  let summary: unknown;
  try {
    const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    summary = JSON.parse(cleaned);
  } catch {
    res.status(500).json({ error: 'Failed to parse AI response' });
    return;
  }

  const updated = await prisma.application.update({
    where: { id: req.params.id },
    data: { jdSummary: summary as object },
  });

  res.json({ jdSummary: updated.jdSummary });
};
