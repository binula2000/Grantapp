import React, { useState } from 'react';
import type { GrantApplication, Approval } from '../../types';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { firestoreService } from '../../services/firestoreService';
import { GrantStatus, UserRole } from '../../types';
import Button from '../ui/Button';

interface GrantDetailsViewProps {
  grant: GrantApplication;
  onUpdate?: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number | string[] | null | boolean, isCurrency?: boolean }> = ({ label, value, isCurrency = false }) => {
    if (value === null || value === undefined || value === '') return null;
    
    let displayValue: any = value;
    if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
    } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
    } else if (isCurrency && typeof value === 'number') {
        displayValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }

    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">{displayValue}</dd>
        </div>
    );
};

const ApprovalStatus: React.FC<{ title: string; approval?: Approval }> = ({ title, approval }) => {
    if (!approval) return null;

    const statusColor = approval.status === 'Approved' ? 'text-green-600' : approval.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600';
    
    return (
        <div>
            <h4 className="text-md font-semibold text-gray-800">{title}</h4>
            <div className="mt-2 pl-4 border-l-2">
                <p><strong>Approver:</strong> {approval.approverName}</p>
                <p><strong>Status:</strong> <span className={`font-semibold ${statusColor}`}>{approval.status}</span></p>
                {approval.timestamp && <p><strong>Date:</strong> {new Date(approval.timestamp).toLocaleString()}</p>}
                {approval.feedback && <p className="mt-1 text-sm italic text-gray-600">"{approval.feedback}"</p>}
            </div>
        </div>
    );
};

const ApprovalActions: React.FC<{ grant: GrantApplication; onUpdate: () => void; }> = ({ grant, onUpdate }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionFeedback, setRejectionFeedback] = useState('');

    if (!user || (user.role !== UserRole.GRANTS_TEAM && user.role !== UserRole.MANAGER) || grant.status !== GrantStatus.PENDING_FINAL_APPROVAL) {
        return null;
    }

    const currentUserApproval = grant.finalApprovers?.find(a => a.approverId === user.id);

    if (!currentUserApproval || currentUserApproval.status !== 'Pending') {
        return <p className="text-sm text-gray-500">You have already completed your review for this grant.</p>;
    }

    const handleApprove = async () => {
        setIsSubmitting(true);
        try {
            await firestoreService.recordFinalApproval(grant.id, user, 'Approved');
            addToast('Grant approved successfully!', 'success');
            onUpdate();
        } catch (error) {
            addToast((error as Error).message || 'Failed to approve.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleReject = async () => {
        if (!rejectionFeedback) {
            addToast('Rejection feedback is required.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await firestoreService.recordFinalApproval(grant.id, user, 'Rejected', rejectionFeedback);
            addToast('Grant rejected successfully.', 'success');
            onUpdate();
        } catch (error) {
            addToast((error as Error).message || 'Failed to reject.', 'error');
        } finally {
            setIsSubmitting(false);
            setIsRejecting(false);
            setRejectionFeedback('');
        }
    };

    if (isRejecting) {
        return (
            <div className="space-y-3">
                <h4 className="text-md font-semibold text-gray-800">Rejection Feedback</h4>
                <textarea
                    value={rejectionFeedback}
                    onChange={e => setRejectionFeedback(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Provide a reason for rejection..."
                />
                <div className="flex space-x-2">
                    <Button onClick={handleReject} variant="danger" size="sm" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Rejection'}
                    </Button>
                     <Button onClick={() => setIsRejecting(false)} variant="secondary" size="sm" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
             <h4 className="text-md font-semibold text-gray-800">Your Action Required</h4>
            <div className="flex space-x-2">
                <Button onClick={handleApprove} size="sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Approving...' : 'Approve'}
                </Button>
                 <Button onClick={() => setIsRejecting(true)} variant="danger" size="sm" disabled={isSubmitting}>
                    Reject
                </Button>
            </div>
        </div>
    )
}


const GrantDetailsView: React.FC<GrantDetailsViewProps> = ({ grant, onUpdate = () => {} }) => {
  return (
    <div className="space-y-6">
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{grant.projectTitle}</h2>
                        <p className="mt-1 text-md text-gray-600">Funder: {grant.funder}</p>
                    </div>
                    <StatusBadge status={grant.status} />
                </div>
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">General Proposal Information</h3>
                        <dl className="mt-4 divide-y divide-gray-200">
                           <DetailItem label="Applicant" value={grant.applicantName} />
                           <DetailItem label="Department" value={grant.department} />
                           <DetailItem label="Principal Investigator(s)" value={grant.principalInvestigator} />
                           <DetailItem label="Other Faculty Involved" value={grant.otherFaculty} />
                           <DetailItem label="Collaborating Institutions" value={grant.collaboratingInstitutions} />
                           <DetailItem label="Funder's Program Name" value={grant.fundersGrantProgram} />
                           <DetailItem label="Submission Date" value={new Date(grant.submissionDate).toLocaleDateString()} />
                           <DetailItem label="Funder's Deadline" value={new Date(grant.fundersDeadline).toLocaleDateString()} />
                           <DetailItem label="Total Funding Requested" value={grant.totalFundingRequested} isCurrency />
                           <DetailItem label="Estimated Annual Funding" value={grant.estimatedAnnualFunding} isCurrency />
                           <DetailItem label="Project Type(s)" value={grant.projectType} />
                           <DetailItem label="Submission Type" value={grant.submissionType} />
                           <DetailItem label="Grant URL" value={grant.grantUrl} />
                           <DetailItem label="Total Project Period" value={grant.totalProjectPeriod} />
                           <DetailItem label="Is Subaward?" value={grant.isSubaward} />
                           <DetailItem label="Original Funder" value={grant.originalFunder} />
                           <DetailItem label="Subawards to Others" value={grant.subawardsToOthers} />
                           <DetailItem label="Consortia Agreements" value={grant.consortiaAgreements} />
                           <DetailItem label="Indirect Costs Allowed" value={grant.indirectCostsAllowed} />
                           <DetailItem label="Matching Dollars Required" value={grant.matchingDollarsRequired} />
                           <DetailItem label="IRB Review Required" value={grant.irbReviewRequired} />
                        </dl>
                    </div>
                </Card>
                
                {grant.projectSummary &&
                    <Card>
                        <div className="p-6">
                             <h3 className="text-lg font-medium leading-6 text-gray-900">Project Summary</h3>
                             <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{grant.projectSummary}</p>
                        </div>
                    </Card>
                }

                 <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Budget Considerations</h3>
                        <dl className="mt-4 divide-y divide-gray-200">
                           <DetailItem label="Project Costs (Total)" value={grant.projectCosts} isCurrency />
                           <DetailItem label="Cost Sharing / Match" value={grant.costSharingMatch} isCurrency />
                           <DetailItem label="Administrative / Indirect Costs" value={grant.adminIndirectCosts} isCurrency />
                           <DetailItem label="Cost Share Requirement" value={grant.costShareDescription} />
                           <DetailItem label="Total Cost Share Amount" value={grant.costShareTotalAmount} isCurrency />
                           <DetailItem label="Source(s) of Cost Share" value={grant.costShareSource} />
                           <DetailItem label="Indirect Rate" value={grant.indirectRate} />
                           <DetailItem label="Colleges for Indirect Distribution" value={grant.collegesForIndirect} />
                        </dl>
                    </div>
                </Card>
                
                 <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Special Review & Sub-Granting</h3>
                        <dl className="mt-4 divide-y divide-gray-200">
                           <DetailItem label="Faculty Effort" value={grant.facultyEffort} />
                           <DetailItem label="Extra Compensation" value={grant.extraCompensation} />
                           <DetailItem label="Hiring New Faculty/Staff" value={grant.hiringNewFaculty} />
                           <DetailItem label="Hiring Students" value={grant.hiringStudents} />
                           <DetailItem label="New Major or Minor" value={grant.newMajorMinor} />
                           <DetailItem label="Special Space Allocation" value={grant.specialSpace} />
                           <DetailItem label="Sub-Granting Description" value={grant.subGrantingDescription} />
                        </dl>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Approval Status</h3>
                        <div className="mt-4 space-y-4">
                            <ApprovalStatus title="Pre-Proposal Approval" approval={grant.preProposalApproval} />
                            
                            {grant.finalApprovers && (
                                <div>
                                    <h4 className="text-md font-semibold text-gray-800">Final Approvals</h4>
                                    <div className="mt-2 space-y-3">
                                        {grant.finalApprovers.map((approver, index) => (
                                            <ApprovalStatus key={index} title={`Approver ${index + 1}`} approval={approver} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <ApprovalActions grant={grant} onUpdate={onUpdate} />

                        </div>
                    </div>
                </Card>
            </div>
            
            <div className="lg:col-span-1">
                <Card>
                    <div className="p-6">
                         <h3 className="text-lg font-medium leading-6 text-gray-900">History</h3>
                         <ul className="mt-4 space-y-4">
                            {grant.history.map((event, index) => (
                                <li key={index} className="relative pl-6">
                                    <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary-500 ring-2 ring-primary-100"></div>
                                    <p className="text-sm font-semibold text-gray-800">{event.event} <span className="text-gray-500 font-normal">- {new Date(event.timestamp).toLocaleDateString()}</span></p>
                                    <p className="text-sm text-gray-600">by {event.user}</p>
                                    <p className="mt-1 text-sm text-gray-500 italic">"{event.details}"</p>
                                </li>
                            ))}
                         </ul>
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};

export default GrantDetailsView;