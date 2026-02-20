import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Activity, Users, UserCog, FileText, LogOut, Menu, Moon, Sun, DollarSign, Database, Clock, Calendar, MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';

type Page = 'dashboard' | 'patients' | 'staff' | 'finance' | 'patient-report' | 'staff-report' | 'data-backup' | 'staff-attendance' | 'patient-sessions' | 'owner-dashboard';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userName?: string;
}

export default function Header({ currentPage, onNavigate, userName }: HeaderProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: Activity },
    { id: 'patients' as Page, label: 'Patients', icon: Users },
    { id: 'staff' as Page, label: 'Staff', icon: UserCog },
    { id: 'staff-attendance' as Page, label: 'Staff Attendance', icon: Clock },
    { id: 'patient-sessions' as Page, label: 'Patient Sessions', icon: Calendar },
    { id: 'owner-dashboard' as Page, label: 'Owner Dashboard', icon: MapPin },
    { id: 'finance' as Page, label: 'Finance', icon: DollarSign },
    { id: 'patient-report' as Page, label: 'Patient Reports', icon: FileText },
    { id: 'staff-report' as Page, label: 'Staff Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/pammit-logo-transparent.dim_200x200.png" 
              alt="Pammit Healthcare Clinic logo" 
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-primary">Pammit Healthcare Clinic</h1>
              <p className="text-xs text-muted-foreground">Management System</p>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className="gap-2"
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Button>
              );
            })}
            <Button
              variant={currentPage === 'data-backup' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('data-backup')}
              className="gap-2"
              aria-label="Navigate to Data Backup"
              aria-current={currentPage === 'data-backup' ? 'page' : undefined}
            >
              <Database className="h-4 w-4" aria-hidden="true" />
              Data Backup
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open navigation menu" aria-expanded="false">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onNavigate('data-backup')}
                className="gap-2"
              >
                <Database className="h-4 w-4" aria-hidden="true" />
                Data Backup
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5" role="status" aria-label={`Logged in as ${userName || 'User'}`}>
            <div className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
            <span className="text-sm font-medium">{userName || 'User'}</span>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2" aria-label="Logout from application">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
