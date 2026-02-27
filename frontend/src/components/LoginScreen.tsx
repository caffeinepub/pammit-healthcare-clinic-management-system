import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Activity, Shield, Users, FileText, DollarSign, Stethoscope } from 'lucide-react';

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <img 
              src="/assets/generated/pammit-logo-transparent.dim_200x200.png" 
              alt="Pammit Healthcare Clinic logo" 
              className="h-24 w-24 object-contain"
            />
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-primary">Pammit Healthcare Clinic</h1>
              <p className="text-lg text-muted-foreground">
                Comprehensive Healthcare Management System
              </p>
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border bg-card p-6 text-left shadow-sm" role="list" aria-label="Key features">
            <div className="flex items-start gap-3" role="listitem">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Patient Management</h2>
                <p className="text-sm text-muted-foreground">
                  Complete patient records, treatments, and session tracking
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3" role="listitem">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Staff Management</h2>
                <p className="text-sm text-muted-foreground">
                  Staff records, attendance tracking, and salary computation
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3" role="listitem">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Financial Management</h2>
                <p className="text-sm text-muted-foreground">
                  Revenue tracking, expense management, and financial reports
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3" role="listitem">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">AI-Assisted Prescriptions</h2>
                <p className="text-sm text-muted-foreground">
                  Physiotherapy-specific prescription writing with AI assistance
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3" role="listitem">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Advanced Reporting</h2>
                <p className="text-sm text-muted-foreground">
                  Detailed reports with PDF and Excel export capabilities
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            size="lg"
            className="w-full"
            aria-label={isLoggingIn ? 'Logging in, please wait' : 'Login to continue to application'}
          >
            {isLoggingIn ? 'Logging in...' : 'Login to Continue'}
          </Button>

          <p className="text-xs text-muted-foreground">
            Secure authentication powered by Internet Identity
          </p>
        </div>
      </main>
    </div>
  );
}
