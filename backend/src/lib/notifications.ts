import prisma from './prisma';

const DEADLINE_REMINDER_DAYS_BEFORE = 3;

export const generateNotificationsForApplication = async (
  applicationId: string,
  userId: string
): Promise<void> => {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { interviewRounds: true },
  });
  if (!app) return;

  await prisma.notification.deleteMany({
    where: { applicationId, isRead: false, triggerDate: { gt: new Date() } },
  });

  const notifications: {
    userId: string;
    applicationId: string;
    type: 'DEADLINE_REMINDER' | 'FOLLOW_UP';
    message: string;
    triggerDate: Date;
  }[] = [];

  if (app.deadlineDate) {
    const triggerDate = new Date(app.deadlineDate);
    triggerDate.setDate(triggerDate.getDate() - DEADLINE_REMINDER_DAYS_BEFORE);
    if (triggerDate > new Date()) {
      notifications.push({
        userId,
        applicationId,
        type: 'DEADLINE_REMINDER',
        message: `Application deadline for ${app.companyName} — ${app.jobTitle} is in ${DEADLINE_REMINDER_DAYS_BEFORE} days.`,
        triggerDate,
      });
    }
  }

  for (const round of app.interviewRounds) {
    if (round.scheduledDate && round.scheduledDate > new Date()) {
      const triggerDate = new Date(round.scheduledDate);
      triggerDate.setHours(8, 0, 0, 0);
      notifications.push({
        userId,
        applicationId,
        type: 'FOLLOW_UP',
        message: `You have a ${round.roundType.replace(/_/g, ' ')} interview at ${app.companyName} today (Round ${round.roundNumber}).`,
        triggerDate,
      });
    }
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }
};
