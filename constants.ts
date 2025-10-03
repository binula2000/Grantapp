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

export const MOCK_APPLICANT: User = {
  id: 'user-1',
  name: 'Binula Illukpitiya',
  email: 'binula.i@university.edu',
  role: UserRole.APPLICANT,
  department: 'Computer Science',
};

export const MOCK_GRANTS_TEAM_USER: User = {
    id: 'user-5',
    name: 'Brenda Gill',
    email: 'brenda.gill@university.edu',
    role: UserRole.GRANTS_TEAM,
    department: 'Grants Office',
};


export const MOCK_FACULTY: User[] = [
    { id: 'user-2', name: 'Dr. Jamaine Davis', email: 'jamaine.davis@university.edu', role: UserRole.MANAGER, department: 'Physics' },
    { id: 'user-3', name: 'Dr. Ben Carter', email: 'ben.carter@university.edu', role: UserRole.MANAGER, department: 'Biology' },
    { id: 'user-4', name: 'Prof. Olivia Chen', email: 'olivia.chen@university.edu', role: UserRole.MANAGER, department: 'History' },
    MOCK_GRANTS_TEAM_USER,
];

export const MOCK_GRANTS: GrantApplication[] = [
  {
    id: 'grant-001',
    applicantId: 'user-1',
    applicantName: 'Binula Illukpitiya',
    department: 'Computer Science',
    projectTitle: 'AI in Personalized Medicine',
    funder: 'National Science Foundation',
    submissionDate: new Date('2023-10-15'),
    status: GrantStatus.FULLY_APPROVED,
    totalFundingRequested: 250000,
    // Pre-Proposal
    principalInvestigator: 'Binula Illukpitiya',
    otherFaculty: 'Dr. Maria Garcia (Biology), Dr. David Chen (Statistics)',
    collaboratingInstitutions: 'Vanderbilt University Medical Center',
    fundersGrantProgram: 'Smart and Connected Health (SCH)',
    fundersDeadline: new Date('2023-11-01'),
    managerId: 'user-2',
    managerName: 'Dr. Jamaine Davis',
    projectType: ['Research'],
    submissionType: 'New Proposal',
    estimatedAnnualFunding: 250000,
    indirectCostsAllowed: true,
    matchingDollarsRequired: false,
    irbReviewRequired: true,
    // Pre-Submission
    grantUrl: 'https://www.nsf.gov/pubs/2023/nsf23530/nsf23530.htm',
    totalProjectPeriod: '12/01/2023 - 11/30/2024',
    isSubaward: false,
    projectSummary: 'This project aims to develop novel AI algorithms to analyze genomic data, leading to personalized treatment plans for cancer patients. The work involves collaboration across Computer Science and Biology departments and partners at VUMC.',
    // Budget
    projectCosts: 200000,
    costSharingMatch: 0,
    adminIndirectCosts: 50000,
    indirectRate: '25% of total direct costs',
    collegesForIndirect: 'College of Sciences (50%)',
    // Special Review
    facultyEffort: 'Binula Illukpitiya: 25% academic year effort. Summer salary requested.',
    extraCompensation: 'Two months summer salary for PI.',
    hiringStudents: 'Two graduate research assistants for 12 months.',
    // Approvals
    finalApprovers: [
        { approverId: 'user-2', approverName: 'Dr. Jamaine Davis', status: 'Approved', timestamp: new Date('2023-10-20') },
        { approverId: 'user-5', approverName: 'Brenda Gill', status: 'Approved', timestamp: new Date('2023-10-21') },
    ],
    preProposalApproval: { approverId: 'user-2', approverName: 'Dr. Jamaine Davis', status: 'Approved', timestamp: new Date('2023-10-16') },
    history: [
        { timestamp: new Date('2023-10-15'), event: 'Created', user: 'Binula Illukpitiya', details: 'Pre-proposal submitted.' },
        { timestamp: new Date('2023-10-16'), event: 'Pre-Proposal Approved', user: 'Dr. Jamaine Davis', details: 'Approved to proceed.' },
        { timestamp: new Date('2023-10-18'), event: 'Submitted', user: 'Binula Illukpitiya', details: 'Full proposal submitted.' },
        { timestamp: new Date('2023-10-21'), event: 'Fully Approved', user: 'System', details: 'All final approvers have approved.' },
    ],
  },
  {
    id: 'grant-002',
    applicantId: 'user-1',
    applicantName: 'Binula Illukpitiya',
    department: 'Computer Science',
    projectTitle: 'Quantum Computing Algorithms',
    funder: 'Dept. of Energy',
    submissionDate: new Date('2024-01-20'),
    status: GrantStatus.PENDING_FINAL_APPROVAL,
    totalFundingRequested: 750000,
    // Pre-Proposal
    principalInvestigator: 'Binula Illukpitiya',
    otherFaculty: 'Dr. Ben Carter (Biology)',
    collaboratingInstitutions: 'Oak Ridge National Laboratory',
    fundersGrantProgram: 'Quantum Information Science Research',
    fundersDeadline: new Date('2024-02-15'),
    managerId: 'user-2',
    managerName: 'Dr. Jamaine Davis',
    projectType: ['Research'],
    submissionType: 'New Proposal',
    estimatedAnnualFunding: 750000,
    indirectCostsAllowed: true,
    matchingDollarsRequired: true,
    irbReviewRequired: false,
    // Pre-Submission
    grantUrl: 'https://www.energy.gov/science/listings/quantum-information-science',
    totalProjectPeriod: '03/01/2024 - 02/28/2027',
    isSubaward: false,
    subawardsToOthers: 'Oak Ridge National Laboratory - $150,000 for equipment usage and staff time.',
    projectSummary: 'This research focuses on creating and testing novel quantum algorithms for complex simulations, which could revolutionize materials science and drug discovery. The project involves a significant subaward to ORNL.',
    // Budget
    projectCosts: 600000,
    costSharingMatch: 50000,
    adminIndirectCosts: 100000,
    costShareDescription: '1:15 match required by funder.',
    costShareTotalAmount: 50000,
    costShareSource: 'University Research Fund',
    indirectRate: 'Negotiated rate of 16.67%',
    collegesForIndirect: 'College of Sciences (50%)',
    // Special Review
    hiringNewFaculty: 'One post-doctoral fellow for 3 years.',
    specialSpace: 'Requires access to the university\'s high-performance computing cluster.',
    // Sub-granting
    subGrantingDescription: 'A subaward of $150,000 to Oak Ridge National Laboratory for access to quantum computing hardware and specialist support.',
    // Approvals
    finalApprovers: [
        { approverId: 'user-2', approverName: 'Dr. Jamaine Davis', status: 'Approved', timestamp: new Date('2024-01-25') },
        { approverId: 'user-3', approverName: 'Dr. Ben Carter', status: 'Pending' },
        { approverId: 'user-5', approverName: 'Brenda Gill', status: 'Pending' },
    ],
    preProposalApproval: { approverId: 'user-2', approverName: 'Dr. Jamaine Davis', status: 'Approved', timestamp: new Date('2024-01-22') },
    history: [
      { timestamp: new Date('2024-01-20'), event: 'Created', user: 'Binula Illukpitiya', details: 'Pre-proposal submitted.' },
      { timestamp: new Date('2024-01-22'), event: 'Pre-Proposal Approved', user: 'Dr. Jamaine Davis', details: 'Approved to proceed.' },
      { timestamp: new Date('2024-01-24'), event: 'Submitted', user: 'Binula Illukpitiya', details: 'Full proposal submitted for final approval.' },
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
    // Pre-Proposal
    principalInvestigator: 'Dr. Robert Smith',
    collaboratingInstitutions: 'Scripps Institution of Oceanography',
    fundersDeadline: new Date('2024-04-01'),
    managerId: 'user-3',
    managerName: 'Dr. Ben Carter',
    projectType: ['Research', 'Public Service'],
    submissionType: 'New Proposal',
    estimatedAnnualFunding: 120000,
    indirectCostsAllowed: false,
    matchingDollarsRequired: false,
    irbReviewRequired: true,
    // Pre-Submission
    totalProjectPeriod: '05/01/2024 - 04/30/2025',
    projectSummary: 'A year-long study of coral reef bleaching in the Florida Keys, with a public service component to educate local communities.',
    // Budget
    projectCosts: 120000,
    adminIndirectCosts: 0,
    indirectRate: '0% allowed by funder',
    // Special Review
    extraCompensation: 'PI and one graduate student will receive stipends for summer fieldwork.',
    hiringStudents: 'One graduate student for 12 months.',
    // Approvals
    finalApprovers: [
        { approverId: 'user-3', approverName: 'Dr. Ben Carter', status: 'Rejected', timestamp: new Date('2024-03-10'), feedback: 'Budget requires further clarification on equipment costs.'},
        { approverId: 'user-5', approverName: 'Brenda Gill', status: 'Pending' },
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
    applicantName: 'Binula Illukpitiya',
    department: 'Computer Science',
    projectTitle: 'Community Coding Bootcamp',
    funder: 'Tech for All Foundation',
    submissionDate: new Date('2024-04-01'),
    status: GrantStatus.PRE_PROPOSAL_APPROVED,
    totalFundingRequested: 50000,
    // Pre-Proposal
    principalInvestigator: 'Binula Illukpitiya',
    fundersDeadline: new Date('2024-05-01'),
    managerId: 'user-2',
    managerName: 'Dr. Jamaine Davis',
    projectType: ['Community Programming', 'Training/Instruction'],
    submissionType: 'New Proposal',
    estimatedAnnualFunding: 50000,
    indirectCostsAllowed: false,
    matchingDollarsRequired: true,
    irbReviewRequired: false,
    // Approvals
    preProposalApproval: { approverId: 'user-2', approverName: 'Dr. Jamaine Davis', status: 'Approved', timestamp: new Date('2024-04-03') },
     history: [
      { timestamp: new Date('2024-04-01'), event: 'Created', user: 'Binula Illukpitiya', details: 'Pre-proposal submitted.' },
      { timestamp: new Date('2024-04-03'), event: 'Pre-Proposal Approved', user: 'Dr. Jamaine Davis', details: 'Approved. Ready for full submission form.' },
    ],
  },
];
