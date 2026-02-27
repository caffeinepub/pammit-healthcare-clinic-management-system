import { useGetSummaryData, useGetAllPatients, useGetAllSpendings } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCog, DollarSign, TrendingUp, FileText, Activity, TrendingDown } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: 'patients' | 'staff' | 'finance' | 'patient-report' | 'staff-report') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: summaryData, isLoading: summaryLoading } = useGetSummaryData();
  const { data: patients = [], isLoading: patientsLoading } = useGetAllPatients();
  const { data: spendings = [], isLoading: spendingsLoading } = useGetAllSpendings();

  const totalDebt = patients.reduce((sum, p) => sum + Number(p.debt), 0);
  const totalExpenses = spendings.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalRevenue = Number(summaryData?.totalPayments || 0);
  const netIncome = totalRevenue - totalExpenses;
  const recentPatients = patients.slice(-5).reverse();

  return (
    <div className="container py-8 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of Pammit Healthcare Clinic operations
        </p>
      </div>

      <section aria-labelledby="summary-statistics">
        <h2 id="summary-statistics" className="sr-only">Summary Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow" aria-label="Total patients statistic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryLoading ? '...' : Number(summaryData?.totalPatients || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active patient records
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow" aria-label="Total staff statistic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryLoading ? '...' : Number(summaryData?.totalStaff || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered staff members
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow" aria-label="Total revenue statistic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summaryLoading ? '...' : totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Collected payments
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow" aria-label="Outstanding debt statistic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Debt</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${patientsLoading ? '...' : totalDebt.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending payments
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="financial-summary">
        <h2 id="financial-summary" className="sr-only">Financial Summary</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow" aria-label="Total expenses statistic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${spendingsLoading ? '...' : totalExpenses.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Operational costs
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow" aria-label="Net income statistic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                ${(summaryLoading || spendingsLoading) ? '...' : netIncome.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Revenue minus expenses
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow" aria-label="Expense records statistic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expense Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryLoading ? '...' : Number(summaryData?.totalSpendings || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recorded transactions
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="recent-patients-heading">
          <Card>
            <CardHeader>
              <CardTitle id="recent-patients-heading" className="flex items-center gap-2">
                <Activity className="h-5 w-5" aria-hidden="true" />
                Recent Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : recentPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No patients yet</p>
              ) : (
                <ul className="space-y-3" aria-label="Recent patients list">
                  {recentPatients.map((patient) => (
                    <li key={patient.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.diagnosis}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${Number(patient.paid).toLocaleString()}</p>
                        {Number(patient.debt) > 0 && (
                          <p className="text-xs text-destructive">Debt: ${Number(patient.debt).toLocaleString()}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="quick-actions-heading">
          <Card>
            <CardHeader>
              <CardTitle id="quick-actions-heading" className="flex items-center gap-2">
                <FileText className="h-5 w-5" aria-hidden="true" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => onNavigate('patients')}
                aria-label="Navigate to manage patients"
              >
                <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                Manage Patients
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => onNavigate('staff')}
                aria-label="Navigate to manage staff"
              >
                <UserCog className="mr-2 h-4 w-4" aria-hidden="true" />
                Manage Staff
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => onNavigate('finance')}
                aria-label="Navigate to financial management"
              >
                <DollarSign className="mr-2 h-4 w-4" aria-hidden="true" />
                Financial Management
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => onNavigate('patient-report')}
                aria-label="Navigate to view patient reports"
              >
                <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                View Patient Reports
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => onNavigate('staff-report')}
                aria-label="Navigate to view staff reports"
              >
                <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                View Staff Reports
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
