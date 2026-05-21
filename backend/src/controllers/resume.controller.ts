import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'job-tracker/resumes',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  } as object,
});

export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export const getResumes = async (req: AuthRequest, res: Response): Promise<void> => {
  const resumes = await prisma.resume.findMany({
    where: { userId: req.userId },
    orderBy: { uploadedAt: 'desc' },
  });
  res.json(resumes);
};

export const uploadResume = async (
  req: AuthRequest & { file?: Express.Multer.File },
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const { name } = req.body;
  if (!name?.trim()) {
    res.status(400).json({ error: 'Resume name is required' });
    return;
  }

  const resume = await prisma.resume.create({
    data: {
      userId: req.userId!,
      name: name.trim(),
      fileUrl: (req.file as Express.Multer.File & { path: string }).path,
      fileName: req.file.originalname,
    },
  });

  res.status(201).json(resume);
};

export const deleteResume = async (req: AuthRequest, res: Response): Promise<void> => {
  const resume = await prisma.resume.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!resume) {
    res.status(404).json({ error: 'Resume not found' });
    return;
  }

  const parts = resume.fileUrl.split('/upload/');
  if (parts.length === 2) {
    const publicId = parts[1].replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }).catch(() => {});
  }

  await prisma.resume.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
