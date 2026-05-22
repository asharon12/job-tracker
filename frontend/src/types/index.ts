export type ApplicationStatus = 'APPLIED' | 'AWAITING_REFERRAL' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'GHOSTED';
export type RoundType = 'HR_SCREEN' | 'OA' | 'DSA' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'CASE_STUDY' | 'OTHER';
export type RoundOutcome = 'PENDING' | 'PASSED' | 'FAILED' | 'CANCELLED';
export type NotificationType = 'FOLLOW_UP' | 'AWAITING_REFERRAL_REMINDER';

export interface Resume {
  id: string;
  name: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
}

export interface InterviewRound {
  id: string;
  applicationId: string;
  roundNumber: number;
  roundType: RoundType;
  scheduledDate: string | null;
  notes: string | null;
  outcome: RoundOutcome;
  createdAt: string;
}

export interface Application {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string | null;
  status: ApplicationStatus;
  jdRaw: string | null;
  resumeId: string | null;
  resume: { id: string; name: string; fileUrl?: string } | null;
  hasReferral: boolean;
  refereeName: string | null;
  refereeRole: string | null;
  refereeCompany: string | null;
  refereeLinkedin: string | null;
  salaryMin: number | null;
  salaryCurrency: string;
  workLocation: string | null;
  resumeName: string | null;
  appliedDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  interviewRounds: InterviewRound[];
}

export interface Notification {
  id: string;
  userId: string;
  applicationId: string | null;
  application: { id: string; companyName: string; jobTitle: string } | null;
  type: NotificationType;
  message: string;
  isRead: boolean;
  triggerDate: string;
  createdAt: string;
}

export interface Stats {
  total: number;
  pipeline: Record<ApplicationStatus, number>;
  responseRate: number;
  activity: { week: string; count: number }[];
  salaryApps: { min: number | null; currency: string }[];
}
