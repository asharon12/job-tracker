import prisma from './prisma';

export const generateNotificationsForApplication = async (
  applicationId: string,
  userId: string
): Promise<void> => {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { interviewRounds: true },
  });
  if (!app) return;

  const now = new Date();

  // Always regenerate interview reminders from current rounds
  await prisma.notification.deleteMany({
    where: { applicationId, isRead: false, triggerDate: { gt: now }, type: 'FOLLOW_UP' },
  });

  const notifications: {
    userId: string;
    applicationId: string;
    type: 'FOLLOW_UP' | 'AWAITING_REFERRAL_REMINDER';
    message: string;
    triggerDate: Date;
  }[] = [];

  // 12 hours before each scheduled interview round
  for (const round of app.interviewRounds) {
    if (round.scheduledDate) {
      const triggerDate = new Date(round.scheduledDate.getTime() - 12 * 60 * 60 * 1000);
      if (triggerDate > now) {
        notifications.push({
          userId,
          applicationId,
          type: 'FOLLOW_UP',
          message: `Reminder: ${round.roundType.replace(/_/g, ' ')} interview at ${app.companyName} in 12 hours (Round ${round.roundNumber}).`,
          triggerDate,
        });
      }
    }
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }

  // 48 hours after status set to AWAITING_REFERRAL — only create if none exists yet
  if (app.status === 'AWAITING_REFERRAL') {
    const existing = await prisma.notification.findFirst({
      where: { applicationId, type: 'AWAITING_REFERRAL_REMINDER', isRead: false, triggerDate: { gt: now } },
    });
    if (!existing) {
      const triggerDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      await prisma.notification.create({
        data: {
          userId,
          applicationId,
          type: 'AWAITING_REFERRAL_REMINDER',
          message: `No update in 48 hours: ${app.companyName} — ${app.jobTitle} is still awaiting referral.`,
          triggerDate,
        },
      });
    }
  } else {
    // Status moved away from AWAITING_REFERRAL — cancel any pending reminder
    await prisma.notification.deleteMany({
      where: { applicationId, type: 'AWAITING_REFERRAL_REMINDER', isRead: false, triggerDate: { gt: now } },
    });
  }
};
