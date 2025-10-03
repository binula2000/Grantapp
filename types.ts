
export enum UserRole {
  APPLICANT = 'Applicant',
  MANAGER = 'Manager',
  GRANTS_TEAM = 'Grants Team'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

export enum GrantStatus {
  DRAFT = 'Draft',
  PENDING_PRE_PROPOSAL_APPROVAL = 'Pending Pre-Proposal Approval',
  PRE_PROPOSAL_REJECTED = 'Pre-Proposal Rejected',
  PRE_PROPOSAL_APPROVED = 'Pre-Proposal Approved',
  PENDING_FINAL_APPROVAL = 'Pending Final Approval',
  PRE_SUBMISSION_REJECTED = 'Pre-Submission Rejected',
  FULLY_APPROVED = 'Fully Approved',
}

export interface Approval {
  approverId: string;
  approverName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp?: Date;
  feedback?: string;
}

export interface GrantApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  department: string;
  projectTitle: string;
  funder: string;
  submissionDate: Date;
  status: GrantStatus;
  totalFundingRequested: number;
  
  // Form 1: Pre-Proposal
  principalInvestigator: string;
  otherFaculty?: string;
  collaboratingInstitutions?: string;
  fundersGrantProgram?: string;
  fundersDeadline: Date;
  managerId: string;
  managerName: string;
  projectType: string[];
  submissionType: string;
  estimatedAnnualFunding: number;
  indirectCostsAllowed: boolean;
  matchingDollarsRequired: boolean;
  irbReviewRequired: boolean;
  fileAttachments?: FileAttachment[];

  // Form 2: Pre-Submission
  grantUrl?: string;
  totalProjectPeriod?: string;
  isSubaward?: boolean;
  originalFunder?: string;
  subawardsToOthers?: string;
  consortiaAgreements?: string;
  projectSummary?: string;

  // Budget
  projectCosts?: number;
  costSharingMatch?: number;
  adminIndirectCosts?: number;
  costShareDescription?: string;
  costShareTotalAmount?: number;
  costShareSource?: string;
  indirectRate?: string;
  collegesForIndirect?: string;
  
  // Special Review
  facultyEffort?: string;
  extraCompensation?: string;
  hiringNewFaculty?: string;
  hiringStudents?: string;
  newMajorMinor?: string;
  specialSpace?: string;

  // Sub-granting
  subGrantingDescription?: string;

  // Approvals
  finalApprovers?: Approval[];
  preProposalApproval?: Approval;
  history: GrantHistory[];
}

export interface FileAttachment {
  name: string;
  url: string; // In a real app, this would point to a storage location
}

export interface GrantHistory {
  timestamp: Date;
  event: string;
  user: string;
  details: string;
}
