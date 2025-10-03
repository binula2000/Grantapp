import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import type { GrantApplication } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import PreProposalForm from '../grant/PreProposalForm';
import GrantDetailsView from '../grant/GrantDetailsView';
import PreSubmissionForm from '../grant/PreSubmissionForm';

type View = 'LIST' | 'CREATE_FORM' | 'VIEW_DETAILS' | 'EDIT_FORM';

const ApplicantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [grants, setGrants] = useState<GrantApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('LIST');
  const [selectedGrant, setSelectedGrant] = useState<GrantApplication | null>(null);

  const fetchGrants = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const userGrants = await firestoreService.getGrantsForUser(user.id);
      setGrants(userGrants);
    } catch (err) {
      setError('Failed to fetch grant applications.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);
  
  const handleBackToList = () => {
    setSelectedGrant(null);
    setView('LIST');
  };

  const handleFormSuccess = () => {
    setView('LIST');
    setSelectedGrant(null);
    fetchGrants();
  };

  const handleViewDetails = (grant: GrantApplication) => {
    setSelectedGrant(grant);
    setView('VIEW_DETAILS');
  };

  const handleEditGrant = (grant: GrantApplication) => {
    setSelectedGrant(grant);
    setView('EDIT_FORM');
  };

  const renderNextAction = (grant: GrantApplication) => {
    switch (grant.status) {
      case 'Pre-Proposal Approved':
        return <Button size="sm" onClick={() => handleEditGrant(grant)}>Complete Full Proposal</Button>;
      case 'Pre-Proposal Rejected':
      case 'Pre-Submission Rejected':
        return <Button size="sm" variant="secondary" onClick={() => alert('Navigate to Edit Form')}>Edit & Resubmit</Button>;
      default:
        return <Button size="sm" variant="secondary" onClick={() => handleViewDetails(grant)}>View Details</Button>;
    }
  };

  const renderGrantList = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Grant Applications</h2>
        <Button onClick={() => setView('CREATE_FORM')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Start New Grant Application
        </Button>
      </div>
      {isLoading && <p>Loading applications...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && grants.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new grant application.</p>
        </div>
      )}
      {!isLoading && !error && grants.length > 0 && (
        <div className="space-y-4">
          {grants.map((grant) => (
            <Card key={grant.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-primary-700">{grant.projectTitle}</h3>
                  <p className="text-sm text-gray-500">{grant.funder}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500">Submitted</p>
                  <p className="font-medium">{grant.submissionDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <StatusBadge status={grant.status} />
                </div>
                <div className="text-right">
                  {renderNextAction(grant)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );

  const renderContent = () => {
    switch (view) {
      case 'LIST':
        return renderGrantList();
      case 'CREATE_FORM':
        return (
          <div>
            <Button variant="secondary" onClick={handleBackToList} className="mb-6">
              &larr; Back to Dashboard
            </Button>
            <PreProposalForm onSuccess={handleFormSuccess} />
          </div>
        );
      case 'EDIT_FORM':
        if (!selectedGrant) return null;
        return (
          <div>
            <Button variant="secondary" onClick={handleBackToList} className="mb-6">
              &larr; Back to Dashboard
            </Button>
            <PreSubmissionForm grant={selectedGrant} onSuccess={handleFormSuccess} />
          </div>
        );
      case 'VIEW_DETAILS':
        if (!selectedGrant) return null;
        return (
           <div>
            <Button variant="secondary" onClick={handleBackToList} className="mb-6">
              &larr; Back to Dashboard
            </Button>
            <GrantDetailsView grant={selectedGrant} />
          </div>
        );
      default:
        return renderGrantList();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderContent()}
    </div>
  );
};

export default ApplicantDashboard;
