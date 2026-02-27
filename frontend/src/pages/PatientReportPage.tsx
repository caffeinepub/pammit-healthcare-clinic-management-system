import { useState } from 'react';
import { useGetAllPatients } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PatientReportPage() {
  const { data: patients = [], isLoading } = useGetAllPatients();

  const totalPatients = patients.length;
  const totalRevenue = patients.reduce((sum, p) => sum + Number(p.paid), 0);
  const totalDebt = patients.reduce((sum, p) => sum + Number(p.debt), 0);
  const totalTreatments = patients.reduce((sum, p) => sum + p.treatments.length, 0);
  const patientsWithPlans = patients.filter(p => p.treatments.some(t => t.plan)).length;

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleExportPDF = () => {
    window.print();
    toast.success('Use browser print dialog to save as PDF');
  };

  const handleExportExcel = () => {
    // Create CSV data instead of using xlsx library
    const headers = ['Patient ID', 'Name', 'Phone', 'Address', 'Diagnosis', 'Treatments', 'Treatment Plans', 'Amount Paid', 'Outstanding Debt', 'Total Value'];
    
    const rows = patients.map(patient => [
      patient.id,
      patient.name,
      patient.phone,
      patient.address,
      patient.diagnosis,
      patient.treatments.length.toString(),
      patient.treatments.filter(t => t.plan).length.toString(),
      Number(patient.paid).toString(),
      Number(patient.debt).toString(),
      (Number(patient.paid) + Number(patient.debt)).toString(),
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patient-report-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('CSV file exported successfully');
  };

  return (
    <div className="container py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Report</h1>
          <p className="text-muted-foreground">Comprehensive patient data analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="print:block hidden mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Pammit Healthcare Clinic</h1>
        <h2 className="text-xl text-center text-muted-foreground mb-4">Patient Report</h2>
        <p className="text-center text-sm text-muted-foreground">
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{totalPatients}</div>
          <p className="text-xs text-muted-foreground">Total Patients</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-destructive">${totalDebt.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Outstanding Debt</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{totalTreatments}</div>
          <p className="text-xs text-muted-foreground">Total Treatments</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-primary">{patientsWithPlans}</div>
          <p className="text-xs text-muted-foreground">Patients with Plans</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead className="text-center">Treatments</TableHead>
              <TableHead className="text-center">Plans</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Debt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading patient data...
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No patient data available
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell className="max-w-xs truncate">{patient.diagnosis}</TableCell>
                  <TableCell className="text-center">{patient.treatments.length}</TableCell>
                  <TableCell className="text-center">
                    {patient.treatments.filter(t => t.plan).length}
                  </TableCell>
                  <TableCell className="text-right">${Number(patient.paid).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={Number(patient.debt) > 0 ? 'text-destructive font-medium' : ''}>
                      ${Number(patient.debt).toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {patients.length > 0 && (
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Treatment Plan Details</h3>
          {patients.filter(p => p.treatments.some(t => t.plan)).map((patient) => (
            <div key={patient.id} className="border-l-4 border-primary pl-4 py-2">
              <p className="font-medium">{patient.name}</p>
              {patient.treatments.filter(t => t.plan).map((treatment, idx) => (
                <div key={idx} className="mt-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{treatment.type}</p>
                  {treatment.plan && (
                    <>
                      <p>{treatment.plan.description}</p>
                      <p>
                        Duration: {new Date(Number(treatment.plan.startDate) / 1000000).toLocaleDateString()} - {new Date(Number(treatment.plan.endDate) / 1000000).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
