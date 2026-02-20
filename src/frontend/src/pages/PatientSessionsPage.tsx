import { useState } from 'react';
import { useGetAllPatients, useGetAllPatientSessions, useCheckInPatient, useCheckOutPatient, useEditCheckInTime, useEditCheckOutTime } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Download, Printer, Clock, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { PatientSession, Patient } from '../backend';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PatientSessionsPage() {
  const { data: patients = [], isLoading: patientsLoading } = useGetAllPatients();
  const { data: sessions = [], isLoading: sessionsLoading } = useGetAllPatientSessions();
  const checkInMutation = useCheckInPatient();
  const checkOutMutation = useCheckOutPatient();
  const editCheckInMutation = useEditCheckInTime();
  const editCheckOutMutation = useEditCheckOutTime();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [treatmentPackageId, setTreatmentPackageId] = useState<string>('');
  const [filterPatientId, setFilterPatientId] = useState<string>('all');

  // Edit Check-In Time Dialog State
  const [editCheckInDialogOpen, setEditCheckInDialogOpen] = useState(false);
  const [editingCheckInSession, setEditingCheckInSession] = useState<PatientSession | null>(null);
  const [newCheckInDate, setNewCheckInDate] = useState('');
  const [newCheckInTime, setNewCheckInTime] = useState('');

  // Edit Check-Out Time Dialog State
  const [editCheckOutDialogOpen, setEditCheckOutDialogOpen] = useState(false);
  const [editingCheckOutSession, setEditingCheckOutSession] = useState<PatientSession | null>(null);
  const [newCheckOutDate, setNewCheckOutDate] = useState('');
  const [newCheckOutTime, setNewCheckOutTime] = useState('');

  const handleCheckIn = async () => {
    if (!selectedPatientId || !treatmentPackageId) {
      toast.error('Please select patient and enter treatment package ID');
      return;
    }

    const patientSessions = sessions.filter(s => s.patientId === selectedPatientId && s.treatmentPackageId === treatmentPackageId);
    const visitNumber = patientSessions.length + 1;

    try {
      await checkInMutation.mutateAsync({
        patientId: selectedPatientId,
        treatmentPackageId,
        visitNumber: BigInt(visitNumber),
      });
      toast.success('Patient checked in successfully');
      setTreatmentPackageId('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to check in patient');
    }
  };

  const handleCheckOut = async (patientId: string) => {
    try {
      await checkOutMutation.mutateAsync({ patientId });
      toast.success('Patient checked out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to check out patient');
    }
  };

  const openEditCheckInDialog = (session: PatientSession) => {
    setEditingCheckInSession(session);
    const checkInDate = new Date(Number(session.checkIn) / 1000000);
    setNewCheckInDate(checkInDate.toISOString().split('T')[0]);
    setNewCheckInTime(checkInDate.toTimeString().slice(0, 5));
    setEditCheckInDialogOpen(true);
  };

  const openEditCheckOutDialog = (session: PatientSession) => {
    setEditingCheckOutSession(session);
    if (session.checkOut) {
      const checkOutDate = new Date(Number(session.checkOut) / 1000000);
      setNewCheckOutDate(checkOutDate.toISOString().split('T')[0]);
      setNewCheckOutTime(checkOutDate.toTimeString().slice(0, 5));
    } else {
      const now = new Date();
      setNewCheckOutDate(now.toISOString().split('T')[0]);
      setNewCheckOutTime(now.toTimeString().slice(0, 5));
    }
    setEditCheckOutDialogOpen(true);
  };

  const handleEditCheckIn = async () => {
    if (!editingCheckInSession || !newCheckInDate || !newCheckInTime) {
      toast.error('Please provide valid date and time');
      return;
    }

    const newDateTime = new Date(`${newCheckInDate}T${newCheckInTime}`);
    const newCheckInTimestamp = BigInt(newDateTime.getTime() * 1000000);

    try {
      await editCheckInMutation.mutateAsync({
        patientId: editingCheckInSession.patientId,
        sessionId: editingCheckInSession.id,
        newCheckInTime: newCheckInTimestamp,
      });
      toast.success('Check-in time updated successfully');
      setEditCheckInDialogOpen(false);
      setEditingCheckInSession(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update check-in time');
    }
  };

  const handleEditCheckOut = async () => {
    if (!editingCheckOutSession || !newCheckOutDate || !newCheckOutTime) {
      toast.error('Please provide valid date and time');
      return;
    }

    const newDateTime = new Date(`${newCheckOutDate}T${newCheckOutTime}`);
    const newCheckOutTimestamp = BigInt(newDateTime.getTime() * 1000000);

    try {
      await editCheckOutMutation.mutateAsync({
        patientId: editingCheckOutSession.patientId,
        sessionId: editingCheckOutSession.id,
        newCheckOutTime: newCheckOutTimestamp,
      });
      toast.success('Check-out time updated successfully');
      setEditCheckOutDialogOpen(false);
      setEditingCheckOutSession(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update check-out time');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const filteredSessions = filterPatientId === 'all' 
      ? sessions 
      : sessions.filter(s => s.patientId === filterPatientId);

    const csvContent = [
      ['Patient Name', 'Date', 'Check In', 'Check Out', 'Duration (min)', 'Package ID', 'Visit #', 'Progress %'].join(','),
      ...filteredSessions.map(session => {
        const patient = patients.find(p => p.id === session.patientId);
        const date = new Date(Number(session.date) / 1000000);
        const checkIn = new Date(Number(session.checkIn) / 1000000);
        const checkOut = session.checkOut ? new Date(Number(session.checkOut) / 1000000) : null;
        
        return [
          patient?.name || 'Unknown',
          date.toLocaleDateString(),
          checkIn.toLocaleTimeString(),
          checkOut ? checkOut.toLocaleTimeString() : 'Not checked out',
          Number(session.duration),
          session.treatmentPackageId,
          Number(session.visitNumber),
          Number(session.progressPercentage),
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSessions = filterPatientId === 'all' 
    ? sessions 
    : sessions.filter(s => s.patientId === filterPatientId);

  const todaySessions = filteredSessions.filter(s => {
    const sessionDate = new Date(Number(s.date) / 1000000);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const currentMonthSessions = filteredSessions.filter(s => {
    const sessionDate = new Date(Number(s.date) / 1000000);
    const now = new Date();
    return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
  });

  const totalDuration = filteredSessions.reduce((sum, s) => sum + Number(s.duration), 0);
  const avgProgress = filteredSessions.length > 0 
    ? filteredSessions.reduce((sum, s) => sum + Number(s.progressPercentage), 0) / filteredSessions.length 
    : 0;

  if (patientsLoading || sessionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading session data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/patient-session-icon-transparent.dim_64x64.png" 
            alt="Patient Sessions" 
            className="h-12 w-12"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Patient Sessions</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Track patient treatment sessions and progress</p>
          </div>
        </div>
        <div className="flex gap-2 no-print w-full sm:w-auto">
          <Button variant="outline" onClick={handleExportPDF} className="flex-1 sm:flex-none">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{todaySessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{currentMonthSessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{Math.round(totalDuration / 60)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{avgProgress.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="no-print">
        <CardHeader>
          <CardTitle>Check In Patient</CardTitle>
          <CardDescription>Record patient check-in for treatment session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.diagnosis}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Treatment Package ID</Label>
              <Input
                placeholder="e.g., PKG-001"
                value={treatmentPackageId}
                onChange={(e) => setTreatmentPackageId(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleCheckIn} 
            disabled={checkInMutation.isPending || !selectedPatientId || !treatmentPackageId}
            className="w-full"
          >
            {checkInMutation.isPending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Check In Patient
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Session History</CardTitle>
              <CardDescription>View and manage patient sessions</CardDescription>
            </div>
            <div className="flex items-center gap-2 no-print w-full sm:w-auto">
              <Label className="hidden sm:inline">Filter by Patient:</Label>
              <Select value={filterPatientId} onValueChange={setFilterPatientId}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Visit #</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="no-print">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No session records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map(session => {
                    const patient = patients.find(p => p.id === session.patientId);
                    const date = new Date(Number(session.date) / 1000000);
                    const checkIn = new Date(Number(session.checkIn) / 1000000);
                    const checkOut = session.checkOut ? new Date(Number(session.checkOut) / 1000000) : null;
                    const duration = Number(session.duration);

                    return (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{patient?.name || 'Unknown'}</TableCell>
                        <TableCell>{date.toLocaleDateString()}</TableCell>
                        <TableCell>{checkIn.toLocaleTimeString()}</TableCell>
                        <TableCell>
                          {checkOut ? (
                            checkOut.toLocaleTimeString()
                          ) : (
                            <span className="text-muted-foreground">Active</span>
                          )}
                        </TableCell>
                        <TableCell>{duration > 0 ? `${duration} min` : '-'}</TableCell>
                        <TableCell>{session.treatmentPackageId}</TableCell>
                        <TableCell>{Number(session.visitNumber)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={Number(session.progressPercentage)} className="w-16" />
                            <span className="text-sm">{Number(session.progressPercentage)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="no-print">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditCheckInDialog(session)}
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              Edit In
                            </Button>
                            {checkOut ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditCheckOutDialog(session)}
                              >
                                <Edit className="mr-2 h-3 w-3" />
                                Edit Out
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCheckOut(session.patientId)}
                                disabled={checkOutMutation.isPending}
                              >
                                <Clock className="mr-2 h-3 w-3" />
                                Check Out
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Check-In Time Dialog */}
      <Dialog open={editCheckInDialogOpen} onOpenChange={setEditCheckInDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Check-In Time</DialogTitle>
            <DialogDescription>
              Modify the check-in time for this patient session. Duration and progress percentage will be automatically recalculated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingCheckInSession && (
              <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                <p><strong>Patient:</strong> {patients.find(p => p.id === editingCheckInSession.patientId)?.name}</p>
                <p><strong>Current Check-In:</strong> {new Date(Number(editingCheckInSession.checkIn) / 1000000).toLocaleString()}</p>
                <p><strong>Package:</strong> {editingCheckInSession.treatmentPackageId}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-checkin-date">New Check-In Date</Label>
              <Input
                id="edit-checkin-date"
                type="date"
                value={newCheckInDate}
                onChange={(e) => setNewCheckInDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-checkin-time">New Check-In Time</Label>
              <Input
                id="edit-checkin-time"
                type="time"
                value={newCheckInTime}
                onChange={(e) => setNewCheckInTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditCheckInDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={handleEditCheckIn}
              disabled={editCheckInMutation.isPending || !newCheckInDate || !newCheckInTime}
              className="w-full sm:w-auto"
            >
              {editCheckInMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Check-Out Time Dialog */}
      <Dialog open={editCheckOutDialogOpen} onOpenChange={setEditCheckOutDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Check-Out Time</DialogTitle>
            <DialogDescription>
              Modify the check-out time for this patient session. Duration and progress percentage will be automatically recalculated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingCheckOutSession && (
              <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                <p><strong>Patient:</strong> {patients.find(p => p.id === editingCheckOutSession.patientId)?.name}</p>
                <p><strong>Check-In:</strong> {new Date(Number(editingCheckOutSession.checkIn) / 1000000).toLocaleString()}</p>
                {editingCheckOutSession.checkOut && (
                  <p><strong>Current Check-Out:</strong> {new Date(Number(editingCheckOutSession.checkOut) / 1000000).toLocaleString()}</p>
                )}
                <p><strong>Package:</strong> {editingCheckOutSession.treatmentPackageId}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-checkout-date">New Check-Out Date</Label>
              <Input
                id="edit-checkout-date"
                type="date"
                value={newCheckOutDate}
                onChange={(e) => setNewCheckOutDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-checkout-time">New Check-Out Time</Label>
              <Input
                id="edit-checkout-time"
                type="time"
                value={newCheckOutTime}
                onChange={(e) => setNewCheckOutTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditCheckOutDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={handleEditCheckOut}
              disabled={editCheckOutMutation.isPending || !newCheckOutDate || !newCheckOutTime}
              className="w-full sm:w-auto"
            >
              {editCheckOutMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

