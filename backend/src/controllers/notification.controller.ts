import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId, triggerDate: { lte: new Date() } },
    include: {
      application: { select: { id: true, companyName: true, jobTitle: true } },
    },
    orderBy: { triggerDate: 'desc' },
  });
  res.json(notifications);
};

export const markRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!notification) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }
  const updated = await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  res.json(updated);
};

export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.notification.updateMany({
    where: { userId: req.userId, isRead: false },
    data: { isRead: true },
  });
  res.json({ success: true });
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!notification) {
    res.status(404).json({ error: 'Notification not found' });
    return;
  }
  await prisma.notification.delete({ where: { id: req.params.id } });
  res.status(204).send();
};
