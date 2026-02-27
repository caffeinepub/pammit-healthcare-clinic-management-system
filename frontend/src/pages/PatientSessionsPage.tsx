import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useGetAllPatients,
  useGetAllSessions,
  useCheckInPatient,
  useCheckOutPatient,
  useEditCheckInTime,
  useEditCheckOutTime,
} from '@/hooks/useQueries';
import { PatientSession } from '@/backend';
import { UserCircle, Clock, LogIn, LogOut, Search, Printer, FileText, Edit2, Filter } from 'lucide-react';

function formatTime(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleString();
}

function formatDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString();
}

function nsToDatetimeLocal(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToNs(value: string): bigint {
  return BigInt(new Date(value).getTime()) * 1_000_000n;
}

export default function PatientSessionsPage() {
  const { data: patients = [] } = useGetAllPatients();
  const { data: sessions = [], isLoading: sessionsLoading } = useGetAllSessions();
  const checkIn = useCheckInPatient();
  const checkOut = useCheckOutPatient();
  const editCheckIn = useEditCheckInTime();
  const editCheckOut = useEditCheckOutTime();

  // Check-in form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [treatmentPackageId, setTreatmentPackageId] = useState('');
  const [visitNumber, setVisitNumber] = useState('1');
  const [filterPatientId, setFilterPatientId] = useState('all');
  const [nameSearch, setNameSearch] = useState('');

  // Edit dialogs
  const [editCheckInOpen, setEditCheckInOpen] = useState(false);
  const [editCheckOutOpen, setEditCheckOutOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<PatientSession | null>(null);
  const [newCheckInTime, setNewCheckInTime] = useState('');
  const [newCheckOutTime, setNewCheckOutTime] = useState('');

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name ?? patientId;
  };

  const openSessions = sessions.filter(s => !s.checkOut);
  const closedSessions = sessions.filter(s => s.checkOut);

  // Filter sessions by name search and patient filter
  const filteredSessions = sessions.filter(s => {
    const patientName = getPatientName(s.patientId).toLowerCase();
    const matchesName = nameSearch.trim() === '' || patientName.includes(nameSearch.toLowerCase().trim());
    const matchesFilter = filterPatientId === 'all' || s.patientId === filterPatientId;
    return matchesName && matchesFilter;
  });

  const handleCheckIn = async () => {
    if (!selectedPatientId || !treatmentPackageId) return;
    await checkIn.mutateAsync({
      patientId: selectedPatientId,
      treatmentPackageId,
      visitNumber: BigInt(visitNumber || '1'),
    });
    setSelectedPatientId('');
    setTreatmentPackageId('');
    setVisitNumber('1');
  };

  const handleCheckOut = async (patientId: string) => {
    await checkOut.mutateAsync({ patientId });
  };

  const handleEditCheckIn = (session: PatientSession) => {
    setEditingSession(session);
    setNewCheckInTime(nsToDatetimeLocal(session.checkIn));
    setEditCheckInOpen(true);
  };

  const handleEditCheckOut = (session: PatientSession) => {
    setEditingSession(session);
    setNewCheckOutTime(session.checkOut ? nsToDatetimeLocal(session.checkOut) : nsToDatetimeLocal(session.checkIn));
    setEditCheckOutOpen(true);
  };

  const handleSaveCheckIn = async () => {
    if (!editingSession || !newCheckInTime) return;
    await editCheckIn.mutateAsync({
      patientId: editingSession.patientId,
      sessionId: editingSession.id,
      newCheckInTime: datetimeLocalToNs(newCheckInTime),
    });
    setEditCheckInOpen(false);
    setEditingSession(null);
  };

  const handleSaveCheckOut = async () => {
    if (!editingSession || !newCheckOutTime) return;
    await editCheckOut.mutateAsync({
      patientId: editingSession.patientId,
      sessionId: editingSession.id,
      newCheckOutTime: datetimeLocalToNs(newCheckOutTime),
    });
    setEditCheckOutOpen(false);
    setEditingSession(null);
  };

  const handlePrintAll = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Patient Name', 'Date', 'Check In', 'Check Out', 'Duration (hrs)', 'Visit #', 'Treatment Package', 'Progress %'];
    const rows = filteredSessions.map(s => [
      getPatientName(s.patientId),
      formatDate(s.date),
      formatTime(s.checkIn),
      s.checkOut ? formatTime(s.checkOut) : 'Active',
      String(s.duration),
      String(s.visitNumber),
      s.treatmentPackageId,
      String(s.progressPercentage),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8 no-print">
        <div className="flex items-center gap-3">
          <img src="/assets/generated/patient-session-icon-transparent.dim_64x64.png" alt="" className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patient Sessions</h1>
            <p className="text-muted-foreground text-sm">Track patient check-in and check-out</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintAll}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Check-In Form */}
      <Card className="mb-6 no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LogIn className="w-5 h-5 text-primary" />
            Check In Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="patient-select">Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger id="patient-select">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="treatment-pkg">Treatment Package</Label>
              <Input
                id="treatment-pkg"
                placeholder="e.g. PT-001"
                value={treatmentPackageId}
                onChange={e => setTreatmentPackageId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visit-num">Visit Number</Label>
              <Input
                id="visit-num"
                type="number"
                min="1"
                value={visitNumber}
                onChange={e => setVisitNumber(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCheckIn}
                disabled={!selectedPatientId || !treatmentPackageId || checkIn.isPending}
                className="w-full"
              >
                {checkIn.isPending ? 'Checking In...' : 'Check In'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      {openSessions.length > 0 && (
        <Card className="mb-6 no-print">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-green-600" />
              Active Sessions ({openSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {openSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">{getPatientName(session.patientId)}</p>
                      <p className="text-sm text-muted-foreground">
                        Checked in: {formatTime(session.checkIn)} · Visit #{String(session.visitNumber)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCheckIn(session)}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit In
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCheckOut(session.patientId)}
                      disabled={checkOut.isPending}
                    >
                      <LogOut className="w-3 h-3 mr-1" />
                      Check Out
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">Session History</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 no-print">
              {/* Search by name */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient by name..."
                  value={nameSearch}
                  onChange={e => setNameSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              {/* Filter by patient */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterPatientId} onValueChange={setFilterPatientId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading sessions...</p>
          ) : filteredSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {nameSearch ? `No sessions found for "${nameSearch}"` : 'No sessions recorded yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Visit #</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="no-print">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map(session => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{getPatientName(session.patientId)}</TableCell>
                      <TableCell>{formatDate(session.date)}</TableCell>
                      <TableCell>{formatTime(session.checkIn)}</TableCell>
                      <TableCell>
                        {session.checkOut ? formatTime(session.checkOut) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>{String(session.duration)}h</TableCell>
                      <TableCell>#{String(session.visitNumber)}</TableCell>
                      <TableCell className="max-w-[120px] truncate">{session.treatmentPackageId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.min(Number(session.progressPercentage), 100)}%` }}
                            />
                          </div>
                          <span className="text-xs">{String(session.progressPercentage)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="no-print">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCheckIn(session)}
                            title="Edit check-in time"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          {session.checkOut && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCheckOut(session)}
                              title="Edit check-out time"
                            >
                              <Clock className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Check-In Dialog */}
      <Dialog open={editCheckInOpen} onOpenChange={setEditCheckInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Check-In Time</DialogTitle>
            <DialogDescription>
              Update the check-in time for {editingSession ? getPatientName(editingSession.patientId) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="new-checkin">New Check-In Time</Label>
              <Input
                id="new-checkin"
                type="datetime-local"
                value={newCheckInTime}
                onChange={e => setNewCheckInTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCheckInOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCheckIn} disabled={editCheckIn.isPending}>
              {editCheckIn.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Check-Out Dialog */}
      <Dialog open={editCheckOutOpen} onOpenChange={setEditCheckOutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Check-Out Time</DialogTitle>
            <DialogDescription>
              Update the check-out time for {editingSession ? getPatientName(editingSession.patientId) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="new-checkout">New Check-Out Time</Label>
              <Input
                id="new-checkout"
                type="datetime-local"
                value={newCheckOutTime}
                onChange={e => setNewCheckOutTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCheckOutOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCheckOut} disabled={editCheckOut.isPending}>
              {editCheckOut.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print-only content */}
      <div className="print-only hidden">
        <h1 className="text-2xl font-bold mb-4">Patient Sessions Report</h1>
        <p className="text-sm mb-4">Generated: {new Date().toLocaleString()}</p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Patient</th>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Check In</th>
              <th className="border p-2 text-left">Check Out</th>
              <th className="border p-2 text-left">Duration</th>
              <th className="border p-2 text-left">Visit #</th>
              <th className="border p-2 text-left">Package</th>
              <th className="border p-2 text-left">Progress</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map(session => (
              <tr key={session.id}>
                <td className="border p-2">{getPatientName(session.patientId)}</td>
                <td className="border p-2">{formatDate(session.date)}</td>
                <td className="border p-2">{formatTime(session.checkIn)}</td>
                <td className="border p-2">{session.checkOut ? formatTime(session.checkOut) : 'Active'}</td>
                <td className="border p-2">{String(session.duration)}h</td>
                <td className="border p-2">#{String(session.visitNumber)}</td>
                <td className="border p-2">{session.treatmentPackageId}</td>
                <td className="border p-2">{String(session.progressPercentage)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
