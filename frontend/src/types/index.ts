export type ApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'GHOSTED';
export type WorkLocation = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type RoundType = 'HR_SCREEN' | 'OA' | 'DSA' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'CASE_STUDY' | 'OTHER';
export type RoundOutcome = 'PENDING' | 'PASSED' | 'FAILED' | 'CANCELLED';
export type NotificationType = 'DEADLINE_REMINDER' | 'FOLLOW_UP';

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

export interface JDSummary {
  required_skills: string[];
  nice_to_have: string[];
  responsibilities: string[];
  experience_required: string;
  tech_stack: string[];
  work_location: string;
}

export interface Application {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string | null;
  status: ApplicationStatus;
  jdRaw: string | null;
  jdSummary: JDSummary | null;
  resumeId: string | null;
  resume: { id: string; name: string; fileUrl?: string } | null;
  hasReferral: boolean;
  refereeName: string | null;
  refereeRole: string | null;
  refereeCompany: string | null;
  refereeLinkedin: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  workLocation: WorkLocation | null;
  appliedDate: string | null;
  deadlineDate: string | null;
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
  salaryApps: { min: number | null; max: number | null; currency: string }[];
}
