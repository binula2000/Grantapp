
import React, { useState, useMemo } from 'react';
// Fix: Import mock users from constants file and AuthContext from its own file to resolve export error.
import { AuthContext } from './contexts/AuthContext';
import { MOCK_APPLICANT, MOCK_GRANTS_TEAM_USER } from './constants';
import type { User } from './types';
import ApplicantDashboard from './components/dashboard/ApplicantDashboard';
import GrantsTeamDashboard from './components/dashboard/GrantsTeamDashboard';
import Header from './components/layout/Header';
import { ToastProvider } from './contexts/ToastContext';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const authContextValue = useMemo(() => ({
    user: currentUser,
    // In a real application, this login function would be called after a successful
    // sign-in with a library like MSAL (Microsoft Authentication Library), which would
    // provide the user's profile information from Azure Active Directory.
    // FIX: Updated login function to accept a User object to match the AuthContextType.
    login: (user: User) => {
        setCurrentUser(user);
    },
    logout: () => setCurrentUser(null),
  }), [currentUser]);

  const renderContent = () => {
    if (!currentUser) {
      return <LoginScreen />;
    }
    if (currentUser.role === 'Applicant') {
      return <ApplicantDashboard />;
    }
    if (currentUser.role === 'Grants Team') {
      return <GrantsTeamDashboard />;
    }
    return <div>Invalid user role.</div>;
  };

  const LoginScreen: React.FC = () => {
    const { login } = React.useContext(AuthContext);

    // This component simulates the login process.
    // In a real app, clicking the "Sign in" button would trigger the MSAL pop-up or redirect flow.
    // For this simulation, we'll present a choice to the user to select their role upon clicking.
    const [showRoleChoice, setShowRoleChoice] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-sm w-full">
                <div className="mb-6">
                    <svg className="mx-auto h-12 w-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Grant Approval System</h2>
                    <p className="mt-2 text-sm text-gray-600">Please sign in with your work account.</p>
                </div>
                {!showRoleChoice ? (
                    <button
                        onClick={() => setShowRoleChoice(true)}
                        className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                            <path fill="#2672ec" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"></path>
                            <path fill="#fff" d="M33.27,34.132c-1.306-2.296-3.26-4.225-5.636-5.467c-1.233-0.648-2.6-1.029-4.044-1.029c-2.31,0-4.512,0.978-6.07,2.701 c-1.306,1.455-2.09,3.313-2.09,5.323c0,0.283,0.019,0.562,0.054,0.838C17.309,37.388,20.523,38,24,38c3.55,0,6.84-0.64,9.387-1.85 C33.35,35.441,33.321,34.77,33.27,34.132z"></path><path fill="#fff" d="M24,30c3.309,0,6-2.691,6-6s-2.691-6-6-6s-6,2.691-6,6S20.691,30,24,30z"></path>
                        </svg>
                        Sign in with Microsoft
                    </button>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Choose a role for this simulation:</p>
                        <button
                            // FIX: Pass the MOCK_APPLICANT User object to the login function as required by AuthContextType.
                            onClick={() => login(MOCK_APPLICANT)}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            Login as Applicant
                        </button>
                        <button
                            // FIX: Pass the MOCK_GRANTS_TEAM_USER User object to the login function as required by AuthContextType.
                            onClick={() => login(MOCK_GRANTS_TEAM_USER)}
                            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            Login as Grants Team Member
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          {currentUser && <Header />}
          <main>{renderContent()}</main>
        </div>
      </ToastProvider>
    </AuthContext.Provider>
  );
};

export default App;
