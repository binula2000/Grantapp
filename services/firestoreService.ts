import { MOCK_GRANTS, MOCK_FACULTY } from '../constants';
import type { GrantApplication, User, Approval } from '../types';
import { GrantStatus, UserRole } from '../types';
import { MOCK_GRANTS_TEAM_USER } from '../constants';

let grants: GrantApplication[] = MOCK_GRANTS;

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Simulates sending an approval request email via the Microsoft Graph API.
 * In a real application, this function would use an access token obtained from MSAL
 * to make a secure API call to https://graph.microsoft.com/v1.0/me/sendMail.
 *
 * @param approver The user object for the approver.
 * @param grant The grant application needing approval.
 * @param currentUser The user submitting the request.
 */
const _sendApprovalRequestEmail = (approver: User, grant: GrantApplication, currentUser: User) => {
    if (!approver.email) {
        console.warn(`Approver ${approver.name} does not have an email address. Skipping notification.`);
        return;
    }

    const subject = `Approval Request: ${grant.projectTitle}`;
    const body = `
        <p>Dear ${approver.name},</p>
        <p>A grant application, "${grant.projectTitle}," submitted by ${currentUser.name} requires your approval.</p>
        <p>Please review the details in the Grant Planning & Approval System.</p>
        <p>Thank you.</p>
    `;

    console.log("--- SIMULATING EMAIL NOTIFICATION ---");
    console.log(`To: ${approver.email}`);
    console.log(`From: noreply@grant-system.com`);
    console.log(`Subject: ${subject}`);
    console.log("Body:", body);
    console.log("-------------------------------------");
    // In a real implementation:
    // const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': 'Bearer YOUR_MSAL_ACCESS_TOKEN',
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     message: {
    //       subject: subject,
    //       body: { contentType: 'HTML', content: body },
    //       toRecipients: [{ emailAddress: { address: approver.email } }]
    //     }
    //   })
    // });
    // if (!response.ok) { throw new Error('Failed to send notification email.'); }
};


export const firestoreService = {
  getGrantsForUser: async (userId: string): Promise<GrantApplication[]> => {
    await delay(500);
    return grants.filter(grant => grant.applicantId === userId).sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime());
  },

  getAllGrants: async (): Promise<GrantApplication[]> => {
    await delay(500);
    return grants.sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime());
  },

  getGrantById: async (grantId: string): Promise<GrantApplication | undefined> => {
    await delay(300);
    return grants.find(grant => grant.id === grantId);
  },

  createGrant: async (grantData: Omit<GrantApplication, 'id' | 'submissionDate' | 'status' | 'history'>, applicant: User): Promise<GrantApplication> => {
    await delay(700);
    const newGrant: GrantApplication = {
      ...grantData,
      id: `grant-${Date.now()}`,
      applicantId: applicant.id,
      applicantName: applicant.name,
      department: applicant.department || 'N/A',
      submissionDate: new Date(),
      status: GrantStatus.PENDING_PRE_PROPOSAL_APPROVAL,
      history: [{
        timestamp: new Date(),
        event: 'Pre-Proposal Submitted',
        user: applicant.name,
        details: 'Initial application created and sent for pre-proposal approval.',
      }],
      preProposalApproval: {
        approverId: grantData.managerId,
        approverName: grantData.managerName,
        status: 'Pending',
      }
    };
    grants = [newGrant, ...grants];

    // Simulate sending approval notification
    const manager = MOCK_FACULTY.find(f => f.id === grantData.managerId);
    if (manager) {
        _sendApprovalRequestEmail(manager, newGrant, applicant);
    }
    
    return newGrant;
  },

  updateGrant: async (grantId: string, updates: Partial<GrantApplication>, user: User, eventDetails: string): Promise<GrantApplication> => {
    await delay(700);
    let grant = await firestoreService.getGrantById(grantId);
    if (!grant) {
      throw new Error("Grant not found");
    }

    const originalStatus = grant.status;
    const updatedGrant = { ...grant, ...updates };

    // When moving to final approval, set up the approvers list and send notifications.
    if (updates.status === GrantStatus.PENDING_FINAL_APPROVAL && originalStatus !== GrantStatus.PENDING_FINAL_APPROVAL) {
      const managerApprover: Approval = {
        approverId: grant.managerId,
        approverName: grant.managerName,
        status: 'Pending',
      };
      const grantsTeamApprover: Approval = {
        approverId: MOCK_GRANTS_TEAM_USER.id,
        approverName: MOCK_GRANTS_TEAM_USER.name,
        status: 'Pending',
      };
      updatedGrant.finalApprovers = [managerApprover, grantsTeamApprover];
      
      // Simulate sending notifications to all final approvers
      const approvers = MOCK_FACULTY.filter(f => updatedGrant.finalApprovers?.map(a => a.approverId).includes(f.id));
      approvers.forEach(approver => {
        _sendApprovalRequestEmail(approver, updatedGrant, user);
      });
    }
    
    const newHistoryEvent = {
        timestamp: new Date(),
        event: updates.status || 'Updated',
        user: user.name,
        details: eventDetails,
    };
    updatedGrant.history = [...(updatedGrant.history || []), newHistoryEvent];

    grants = grants.map(g => g.id === grantId ? updatedGrant : g);
    return updatedGrant;
  },
  
  recordFinalApproval: async (grantId: string, approver: User, decision: 'Approved' | 'Rejected', feedback?: string): Promise<GrantApplication> => {
    await delay(800);
    let grant = await firestoreService.getGrantById(grantId);
    if (!grant || !grant.finalApprovers) {
      throw new Error("Grant not found or not ready for final approval.");
    }

    let isAltered = false;
    const newFinalApprovers = grant.finalApprovers.map(a => {
      if (a.approverId === approver.id && a.status === 'Pending') {
        isAltered = true;
        return { ...a, status: decision, timestamp: new Date(), feedback: feedback || undefined };
      }
      return a;
    });

    if (!isAltered) {
      throw new Error("Approver not found or has already voted.");
    }
    
    grant.finalApprovers = newFinalApprovers;

    let newStatus = grant.status;
    let eventDetails = '';

    if (decision === 'Rejected') {
      newStatus = GrantStatus.PRE_SUBMISSION_REJECTED;
      eventDetails = `Submission rejected by ${approver.name}. Feedback: ${feedback}`;
    } else {
      const allApproved = newFinalApprovers.every(a => a.status === 'Approved');
      if (allApproved) {
        newStatus = GrantStatus.FULLY_APPROVED;
        eventDetails = `All approvers have approved. Grant is now fully approved.`;
      } else {
        eventDetails = `Submission approved by ${approver.name}. Awaiting other approvals.`;
      }
    }

    grant.status = newStatus;
    
    const newHistoryEvent = {
      timestamp: new Date(),
      event: `Final Approval ${decision}`,
      user: approver.name,
      details: eventDetails,
    };
    grant.history.push(newHistoryEvent);

    grants = grants.map(g => (g.id === grantId ? grant : g));
    return grant;
  },

  searchFaculty: async (query: string): Promise<User[]> => {
    await delay(300);
    if (!query) return MOCK_FACULTY;
    return MOCK_FACULTY.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
  }
};