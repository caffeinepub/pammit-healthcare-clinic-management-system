import { useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginScreen from './components/LoginScreen';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './pages/Dashboard';
import PatientsPage from './pages/PatientsPage';
import StaffPage from './pages/StaffPage';
import PatientReportPage from './pages/PatientReportPage';
import StaffReportPage from './pages/StaffReportPage';
import FinancePage from './pages/FinancePage';
import DataBackupPage from './pages/DataBackupPage';
import StaffAttendancePage from './pages/StaffAttendancePage';
import PatientSessionsPage from './pages/PatientSessionsPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import LiveRegion from './components/LiveRegion';
import SkipToContent from './components/SkipToContent';

type Page = 'dashboard' | 'patients' | 'staff' | 'finance' | 'patient-report' | 'staff-report' | 'data-backup' | 'staff-attendance' | 'patient-sessions' | 'owner-dashboard';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleProfileSave = async (name: string) => {
    await saveProfileMutation.mutateAsync({ name, role: 'Medical Staff', staffId: undefined });
  };

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" role="status" aria-label="Loading application" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LoginScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SkipToContent />
      <div className="flex min-h-screen flex-col bg-background">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} userName={userProfile?.name} />
        
        <main id="main-content" className="flex-1" role="main">
          {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
          {currentPage === 'patients' && <PatientsPage />}
          {currentPage === 'staff' && <StaffPage />}
          {currentPage === 'finance' && <FinancePage />}
          {currentPage === 'patient-report' && <PatientReportPage />}
          {currentPage === 'staff-report' && <StaffReportPage />}
          {currentPage === 'data-backup' && <DataBackupPage />}
          {currentPage === 'staff-attendance' && <StaffAttendancePage />}
          {currentPage === 'patient-sessions' && <PatientSessionsPage />}
          {currentPage === 'owner-dashboard' && <OwnerDashboardPage />}
        </main>

        <Footer />
        
        {showProfileSetup && (
          <ProfileSetupModal
            onSave={handleProfileSave}
            isSaving={saveProfileMutation.isPending}
          />
        )}
        
        <LiveRegion />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
