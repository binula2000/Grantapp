
import React from 'react';
import { GrantStatus } from '../../types';

interface StatusBadgeProps {
  status: GrantStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles: { [key in GrantStatus]: string } = {
    [GrantStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [GrantStatus.PENDING_PRE_PROPOSAL_APPROVAL]: 'bg-yellow-100 text-yellow-800',
    [GrantStatus.PRE_PROPOSAL_REJECTED]: 'bg-red-100 text-red-800',
    [GrantStatus.PRE_PROPOSAL_APPROVED]: 'bg-blue-100 text-blue-800',
    [GrantStatus.PENDING_FINAL_APPROVAL]: 'bg-yellow-100 text-yellow-800 animate-pulse',
    [GrantStatus.PRE_SUBMISSION_REJECTED]: 'bg-red-100 text-red-800',
    [GrantStatus.FULLY_APPROVED]: 'bg-green-100 text-green-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
