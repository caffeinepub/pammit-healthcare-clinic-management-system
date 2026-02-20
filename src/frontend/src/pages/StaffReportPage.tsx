import { useGetAllStaffMembers, useGetSummaryData } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function StaffReportPage() {
  const { data: staff = [], isLoading } = useGetAllStaffMembers();
  const { data: summaryData } = useGetSummaryData();

  const positionCounts = staff.reduce((acc, member) => {
    acc[member.position] = (acc[member.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    toast.info('PDF export functionality would be implemented here');
  };

  const handleExportExcel = () => {
    // Create CSV content
    const headers = ['Name', 'Position', 'Phone', 'Qualifications'];
    const rows = staff.map(s => [
      s.name,
      s.position,
      s.phone,
      s.qualifications
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Excel file downloaded successfully');
  };

  return (
    <div className="container py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Report</h1>
          <p className="text-muted-foreground">Comprehensive staff data and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      <div className="print:block hidden mb-6">
        <h1 className="text-2xl font-bold">Staff Report</h1>
        <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(summaryData?.totalStaff || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(positionCounts).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Common Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {Object.keys(positionCounts).length > 0
                ? Object.entries(positionCounts).sort((a, b) => b[1] - a[1])[0][0]
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff by Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(positionCounts).map(([position, count]) => (
              <div key={position} className="flex items-center justify-between border-b pb-2 last:border-0">
                <span className="font-medium">{position}</span>
                <span className="text-muted-foreground">{count} member{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
            {Object.keys(positionCounts).length === 0 && (
              <p className="text-sm text-muted-foreground">No staff data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Qualifications</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No staff data available
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.qualifications}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
