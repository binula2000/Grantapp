import { GrantStatus, type GrantApplication, type User } from './types';
import { UserRole } from './types';

export const DEPARTMENTS = [
  "Art", "Biology", "Chemistry", "Computer Science", "Economics",
  "English", "History", "Mathematics", "Music", "Physics", "Political Science",
  "Psychology", "Sociology", "Theater"
];

export const PROJECT_TYPES = [
  "Research", "Training/Instruction", "Public Service", "Event",
  "Community Programming", "Other"
];

export const SUBMISSION_TYPES = [
  "New Proposal", "Continuation Year", "Revised Application", "Scholarship/Loan Forgiveness"
];

// Fix: Centralized MOCK_APPLICANT here from AuthContext.
export const MOCK_APPLICANT: User = {
  id: 'user-1',
  name: 'Dr. Alice Johnson',
  email: 'alice.j@university.edu',
  role: UserRole.APPLICANT,
  department: 'Computer Science',
};

export const MOCK_GRANTS_TEAM_USER: User = {
    id: 'user-5',
    name: 'Dr. Samuel Rodriguez',
    email: 'samuel.rodriguez@university.edu',
    role: UserRole.GRANTS_TEAM,
    department: 'Grants Office',
};


export const MOCK_FACULTY: User[] = [
    { id: 'user-2', name: 'Dr. Eleanor Vance', email: 'eleanor.vance@university.edu', role: UserRole.MANAGER, department: 'Physics' },
    { id: 'user-3', name: 'Dr. Ben Carter', email: 'ben.carter@university.edu', role: UserRole.MANAGER, department: 'Biology' },
    { id: 'user-4', name: 'Prof. Olivia Chen', email: 'olivia.chen@university.edu', role: UserRole.MANAGER, department: 'History' },
    MOCK_GRANTS_TEAM_USER,
];

export const MOCK_GRANTS: GrantApplication[] = [
  {
    id: 'grant-001',
    applicantId: 'user-1',
    applicantName: 'Dr. Alice Johnson',
    department: 'Computer Science',
    projectTitle: 'AI in Personalized Medicine',
    funder: 'National Science Foundation',
    submissionDate: new Date('2023-10-15'),
    status: GrantStatus.FULLY_APPROVED,
    totalFundingRequested: 250000,
    principalInvestigator: 'Dr. Alice Johnson',
    fundersDeadline: new Date('2023-11-01'),
    managerId: 'user-2',
    managerName: 'Dr. Eleanor Vance',
    projectType: ['Research'],
    submissionType: 'New Proposal',
    estimatedAnnualFunding: 250000,
    indirectCostsAllowed: true,
    matchingDollarsRequired: false,
    irbReviewRequired: true,
    finalApprovers: [
        { approverId: 'user-2', approverName: 'Dr. Eleanor Vance', status: 'Approved', timestamp: new Date('2023-10-20') },
        { approverId: 'user-5', approverName: 'Dr. Samuel Rodriguez', status: 'Approved', timestamp: new Date('2023-10-21') },
    ],
    preProposalApproval: { approverId: 'user-2', approverName: 'Dr. Eleanor Vance', status: 'Approved', timestamp: new Date('2023-10-16') },
    history: [
        { timestamp: new Date('2023-10-15'), event: 'Created', user: 'Dr. Alice Johnson', details: 'Pre-proposal submitted.' },
        { timestamp: new Date('2023-10-16'), event: 'Pre-Proposal Approved', user: 'Dr. Eleanor Vance', details: 'Approved to proceed.' },
        { timestamp: new Date('2023-10-18'), event: 'Submitted', user: 'Dr. Alice Johnson', details: 'Full proposal submitted.' },
        { timestamp: new Date('2023-10-21'), event: 'Fully Approved', user: 'System', details: 'All final approvers have approved.' },
    ],
  },
  {
    id: 'grant-002',
    applicantId: 'user-1',
    applicantName: 'Dr. Alice Johnson',
    department: 'Computer Science',
    projectTitle: 'Quantum Computing Algorithms',
    funder: 'Dept. of Energy',
    submissionDate: new Date('2024-01-20'),
    status: GrantStatus.PENDING_FINAL_APPROVAL,
    totalFundingRequested: 750000,
    principalInvestigator: 'Dr. Alice Johnson',
    fundersDeadline: new Date('2024-02-15'),
    managerId: 'user-2',
    managerName: 'Dr. Eleanor Vance',
    projectType: ['Research'],
    submissionType: 'New Proposal',
    estimatedAnnualFunding: 750000,
    indirectCostsAllowed: true,
    matchingDollarsRequired: true,
    irbReviewRequired: false,
    finalApprovers: [
        { approverId: 'user-2', approverName: 'Dr. Eleanor Vance', status: 'Approved', timestamp: new Date('2024-01-25') },
        { approverId: 'user-3', approverName: 'Dr. Ben Carter', status: 'Pending' },
        { approverId: 'user-5', approverName: 'Dr. Samuel Rodriguez', status: 'Pending' },
    ],
    preProposalApproval: { approverId: 'user-2', approverName: 'Dr. Eleanor Vance', status: 'Approved', timestamp: new Date('2024-01-22') },
    history: [
      { timestamp: new Date('2024-01-20'), event: 'Created', user: 'Dr. Alice Johnson', details: 'Pre-proposal submitted.' },
      { timestamp: new Date('2024-01-22'), event: 'Pre-Proposal Approved', user: 'Dr. Eleanor Vance', details: 'Approved to proceed.' },
      { timestamp: new Date('2024-01-24'), event: 'Submitted', user: 'Dr. Alice Johnson', details: 'Full proposal submitted for final approval.' },
    ],
  },
   {
    id: 'grant-003',
    applicantId: 'another-user-id',
    applicantName: 'Dr. Robert Smith',
    department: 'Biology',
    projectTitle: 'Marine Biology Study',
    funder: 'Oceanic Preservation Society',
    submissionDate: new Date('2024-03-05'),
    status: GrantStatus.PRE_SUBMISSION_REJECTED,
    totalFundingRequested: 120000,
    principalInvestigator: 'Dr. Robert Smith',
    fundersDeadline: new Date('2024-04-01'),
    managerId: 'user-3',
    managerName: 'Dr. Ben Carter',
    projectType: ['Research', 'Public Service'],
    submissionType: 'New Proposal',
    estimatedAnnualFunding: 120000,
    indirectCostsAllowed: false,
    matchingDollarsRequired: false,
    irbReviewRequired: true,
    finalApprovers: [
        { approverId: 'user-3', approverName: 'Dr. Ben Carter', status: 'Rejected', timestamp: new Date('2024-03-10'), feedback: 'Budget requires further clarification on equipment costs.'},
        { approverId: 'user-5', approverName: 'Dr. Samuel Rodriguez', status: 'Pending' },
    ],
    preProposalApproval: { approverId: 'user-3', approverName: 'Dr. Ben Carter', status: 'Approved', timestamp: new Date('2024-03-06') },
     history: [
      { timestamp: new Date('2024-03-05'), event: 'Created', user: 'Dr. Robert Smith', details: 'Pre-proposal submitted.' },
      { timestamp: new Date('2024-03-06'), event: 'Pre-Proposal Approved', user: 'Dr. Ben Carter', details: 'Approved to proceed.' },
      { timestamp: new Date('2024-03-08'), event: 'Submitted', user: 'Dr. Robert Smith', details: 'Full proposal submitted for final approval.' },
      { timestamp: new Date('2024-03-10'), event: 'Rejected', user: 'Dr. Ben Carter', details: 'Budget requires further clarification on equipment costs.' },
    ],
  },
  {
    id: 'grant-004',
    applicantId: 'user-1',
    applicantName: 'Dr. Alice Johnson',
    department: 'Computer Science',
    projectTitle: 'Community Coding Bootcamp',
    funder: 'Tech for All Foundation',
    submissionDate: new Date('2024-04-01'),
    status: GrantStatus.PRE_PROPOSAL_APPROVED,
    totalFundingRequested: 50000,
    principalInvestigator: 'Dr. Alice Johnson',
    fundersDeadline: new Date('2024-05-01'),
    managerId: 'user-2',
    managerName: 'Dr. Eleanor Vance',
    projectType: ['Community Programming', 'Training/Instruction'],
    submissionType: 'New Proposal',
    estimatedAnnualFunding: 50000,
    indirectCostsAllowed: false,
    matchingDollarsRequired: true,
    irbReviewRequired: false,
    preProposalApproval: { approverId: 'user-2', approverName: 'Dr. Eleanor Vance', status: 'Approved', timestamp: new Date('2024-04-03') },
     history: [
      { timestamp: new Date('2024-04-01'), event: 'Created', user: 'Dr. Alice Johnson', details: 'Pre-proposal submitted.' },
      { timestamp: new Date('2024-04-03'), event: 'Pre-Proposal Approved', user: 'Dr. Eleanor Vance', details: 'Approved. Ready for full submission form.' },
    ],
  },
];