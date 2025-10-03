import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { firestoreService } from '../../services/firestoreService';
import type { GrantApplication } from '../../types';
import { GrantStatus } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import Card from '../ui/Card';
import GrantDetailsView from '../grant/GrantDetailsView';

const StatCard: React.FC<{ title: string; value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card className="p-4">
        <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    </Card>
);


const GrantsTeamDashboard: React.FC = () => {
  const [allGrants, setAllGrants] = useState<GrantApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GrantStatus | 'ALL'>('ALL');
  const [view, setView] = useState<'LIST' | 'VIEW_DETAILS'>('LIST');
  const [selectedGrant, setSelectedGrant] = useState<GrantApplication | null>(null);

  const fetchAllGrants = useCallback(async () => {
    try {
      setIsLoading(true);
      const grants = await firestoreService.getAllGrants();
      setAllGrants(grants);
    } catch (err) {
      setError('Failed to fetch grant applications.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllGrants();
  }, [fetchAllGrants]);

  const filteredGrants = useMemo(() => {
    return allGrants
      .filter(grant => statusFilter === 'ALL' || grant.status === statusFilter)
      .filter(grant => 
        grant.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grant.applicantName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [allGrants, searchTerm, statusFilter]);
  
  const metrics = useMemo(() => {
     const pending = allGrants.filter(g => g.status === GrantStatus.PENDING_FINAL_APPROVAL || g.status === GrantStatus.PENDING_PRE_PROPOSAL_APPROVAL).length;
     const active = allGrants.filter(g => g.status === GrantStatus.FULLY_APPROVED).length;
     const totalFunding = allGrants.reduce((sum, g) => sum + g.totalFundingRequested, 0);
     return {
         total: allGrants.length,
         pending,
         active,
         totalFunding: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalFunding),
     }
  }, [allGrants]);

  const getApprovalStatusSummary = (grant: GrantApplication) => {
      if (!grant.finalApprovers || (grant.status !== GrantStatus.PENDING_FINAL_APPROVAL && grant.status !== GrantStatus.FULLY_APPROVED && grant.status !== GrantStatus.PRE_SUBMISSION_REJECTED)) {
          return 'N/A';
      }
      const rejected = grant.finalApprovers.find(a => a.status === 'Rejected');
      if (rejected) {
          return `Rejected by ${rejected.approverName}`;
      }
      const approvedCount = grant.finalApprovers.filter(a => a.status === 'Approved').length;
      const total = grant.finalApprovers.length;
      return `${approvedCount} of ${total} Approved`;
  };

  const handleViewDetails = (grant: GrantApplication) => {
    setSelectedGrant(grant);
    setView('VIEW_DETAILS');
  };

  const handleBackToList = () => {
    setSelectedGrant(null);
    setView('LIST');
  };

  const handleGrantUpdate = async () => {
    await fetchAllGrants();
    if (selectedGrant) {
        const updatedGrant = await firestoreService.getGrantById(selectedGrant.id);
        if (updatedGrant) {
            setSelectedGrant(updatedGrant);
        } else {
            handleBackToList();
        }
    }
  };

  const renderDashboard = () => (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">All University Grant Applications</h2>
        {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Applications" value={metrics.total} icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        <StatCard title="Pending Approvals" value={metrics.pending} icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Active Grants" value={metrics.active} icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Total Funding Requested" value={metrics.totalFunding} icon={<svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
      </div>

       <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by Applicant or Project Title..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
             className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value as GrantStatus | 'ALL')}
          >
             <option value="ALL">All Statuses</option>
             {Object.values(GrantStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Card>
      
      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant / Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project / Funder</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funding</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Status</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                    <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                ) : error ? (
                    <tr><td colSpan={6} className="text-center py-8 text-red-500">{error}</td></tr>
                ) : filteredGrants.map(grant => (
                    <tr key={grant.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(grant)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{grant.applicantName}</div>
                            <div className="text-sm text-gray-500">{grant.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{grant.projectTitle}</div>
                            <div className="text-sm text-gray-500">{grant.funder}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(grant.totalFundingRequested)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {grant.submissionDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={grant.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getApprovalStatusSummary(grant)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </Card>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {view === 'LIST' ? renderDashboard() : (
        <div>
          <button onClick={handleBackToList} className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
             &larr; Back to Dashboard
          </button>
          {selectedGrant && <GrantDetailsView grant={selectedGrant} onUpdate={handleGrantUpdate} />}
        </div>
      )}
    </div>
  );
};

export default GrantsTeamDashboard;