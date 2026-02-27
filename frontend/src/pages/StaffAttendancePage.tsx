import { useState, useEffect } from 'react';
import { useGetAllStaffMembers, useGetAllStaffAttendance, useClockInStaff, useClockOutStaff, useEditClockInTime, useEditClockOutTime } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Plus, Download, Printer, MapPin, ExternalLink, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { StaffAttendance, StaffMember, Location } from '../backend';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function StaffAttendancePage() {
  const { data: staffMembers = [], isLoading: staffLoading } = useGetAllStaffMembers();
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useGetAllStaffAttendance();
  const clockInMutation = useClockInStaff();
  const clockOutMutation = useClockOutStaff();
  const editClockInMutation = useEditClockInTime();
  const editClockOutMutation = useEditClockOutTime();

  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [filterStaffId, setFilterStaffId] = useState<string>('all');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  // Edit Clock-In Time Dialog State
  const [editClockInDialogOpen, setEditClockInDialogOpen] = useState(false);
  const [editingClockInRecord, setEditingClockInRecord] = useState<StaffAttendance | null>(null);
  const [newClockInDate, setNewClockInDate] = useState('');
  const [newClockInTime, setNewClockInTime] = useState('');

  // Edit Clock-Out Time Dialog State
  const [editClockOutDialogOpen, setEditClockOutDialogOpen] = useState(false);
  const [editingClockOutRecord, setEditingClockOutRecord] = useState<StaffAttendance | null>(null);
  const [newClockOutDate, setNewClockOutDate] = useState('');
  const [newClockOutTime, setNewClockOutTime] = useState('');

  const selectedStaff = staffMembers.find(s => s.id === selectedStaffId);

  useEffect(() => {
    // Check location permission status
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
      });
    }
  }, []);

  const captureLocation = async (): Promise<Location | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        resolve(null);
        return;
      }

      setIsCapturingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: BigInt(Date.now() * 1000000),
          };
          setCurrentLocation(location);
          setLocationPermission('granted');
          setIsCapturingLocation(false);
          toast.success('Location captured successfully');
          resolve(location);
        },
        (error) => {
          setIsCapturingLocation(false);
          setLocationPermission('denied');
          toast.error(`Location access denied: ${error.message}`);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const handleClockIn = async () => {
    if (!selectedStaffId) {
      toast.error('Please select a staff member');
      return;
    }

    // Capture location
    const location = await captureLocation();

    try {
      await clockInMutation.mutateAsync({
        staffId: selectedStaffId,
        location: location || undefined,
      });
      toast.success('Clocked in successfully');
      setCurrentLocation(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async (staffId: string) => {
    try {
      await clockOutMutation.mutateAsync({ staffId });
      toast.success('Clocked out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock out');
    }
  };

  const openEditClockInDialog = (record: StaffAttendance) => {
    setEditingClockInRecord(record);
    const clockInDate = new Date(Number(record.clockIn) / 1000000);
    setNewClockInDate(clockInDate.toISOString().split('T')[0]);
    setNewClockInTime(clockInDate.toTimeString().slice(0, 5));
    setEditClockInDialogOpen(true);
  };

  const openEditClockOutDialog = (record: StaffAttendance) => {
    setEditingClockOutRecord(record);
    if (record.clockOut) {
      const clockOutDate = new Date(Number(record.clockOut) / 1000000);
      setNewClockOutDate(clockOutDate.toISOString().split('T')[0]);
      setNewClockOutTime(clockOutDate.toTimeString().slice(0, 5));
    } else {
      const now = new Date();
      setNewClockOutDate(now.toISOString().split('T')[0]);
      setNewClockOutTime(now.toTimeString().slice(0, 5));
    }
    setEditClockOutDialogOpen(true);
  };

  const handleEditClockIn = async () => {
    if (!editingClockInRecord || !newClockInDate || !newClockInTime) {
      toast.error('Please provide valid date and time');
      return;
    }

    const newDateTime = new Date(`${newClockInDate}T${newClockInTime}`);
    const newClockInTimestamp = BigInt(newDateTime.getTime() * 1000000);

    try {
      await editClockInMutation.mutateAsync({
        staffId: editingClockInRecord.staffId,
        attendanceId: editingClockInRecord.id,
        newClockInTime: newClockInTimestamp,
      });
      toast.success('Clock-in time updated successfully');
      setEditClockInDialogOpen(false);
      setEditingClockInRecord(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update clock-in time');
    }
  };

  const handleEditClockOut = async () => {
    if (!editingClockOutRecord || !newClockOutDate || !newClockOutTime) {
      toast.error('Please provide valid date and time');
      return;
    }

    const newDateTime = new Date(`${newClockOutDate}T${newClockOutTime}`);
    const newClockOutTimestamp = BigInt(newDateTime.getTime() * 1000000);

    try {
      await editClockOutMutation.mutateAsync({
        staffId: editingClockOutRecord.staffId,
        attendanceId: editingClockOutRecord.id,
        newClockOutTime: newClockOutTimestamp,
      });
      toast.success('Clock-out time updated successfully');
      setEditClockOutDialogOpen(false);
      setEditingClockOutRecord(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update clock-out time');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const filteredRecords = filterStaffId === 'all' 
      ? attendanceRecords 
      : attendanceRecords.filter(r => r.staffId === filterStaffId);

    const csvContent = [
      ['Staff Name', 'Date', 'Clock In', 'Clock Out', 'Hours Worked', 'Pay Rate', 'Total Pay', 'Location (Lat, Lng)'].join(','),
      ...filteredRecords.map(record => {
        const staff = staffMembers.find(s => s.id === record.staffId);
        const date = new Date(Number(record.date) / 1000000);
        const clockIn = new Date(Number(record.clockIn) / 1000000);
        const clockOut = record.clockOut ? new Date(Number(record.clockOut) / 1000000) : null;
        const hours = Number(record.hoursWorked);
        const locationStr = record.location 
          ? `"${record.location.latitude}, ${record.location.longitude}"`
          : 'N/A';
        
        return [
          staff?.name || 'Unknown',
          date.toLocaleDateString(),
          clockIn.toLocaleTimeString(),
          clockOut ? clockOut.toLocaleTimeString() : 'Not clocked out',
          hours.toFixed(2),
          Number(record.payRate),
          Number(record.totalPay),
          locationStr,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getGoogleMapsUrl = (location: Location) => {
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  };

  const filteredRecords = filterStaffId === 'all' 
    ? attendanceRecords 
    : attendanceRecords.filter(r => r.staffId === filterStaffId);

  const totalHours = filteredRecords.reduce((sum, r) => sum + Number(r.hoursWorked), 0);
  const totalPay = filteredRecords.reduce((sum, r) => sum + Number(r.totalPay), 0);

  const todayRecords = filteredRecords.filter(r => {
    const recordDate = new Date(Number(r.date) / 1000000);
    const today = new Date();
    return recordDate.toDateString() === today.toDateString();
  });

  const currentMonthRecords = filteredRecords.filter(r => {
    const recordDate = new Date(Number(r.date) / 1000000);
    const now = new Date();
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
  });

  const monthlyHours = currentMonthRecords.reduce((sum, r) => sum + Number(r.hoursWorked), 0);
  const monthlyPay = currentMonthRecords.reduce((sum, r) => sum + Number(r.totalPay), 0);

  if (staffLoading || attendanceLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/staff-attendance-icon-transparent.dim_64x64.png" 
            alt="Staff Attendance" 
            className="h-12 w-12"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Staff Attendance</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Track staff work hours, locations, and calculate salaries</p>
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

      {locationPermission === 'denied' && (
        <Alert variant="destructive" className="no-print">
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            Location access is denied. Please enable location permissions in your browser settings to track attendance locations.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {todayRecords.reduce((sum, r) => sum + Number(r.hoursWorked), 0).toFixed(2)}h
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{monthlyHours.toFixed(2)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">${monthlyPay.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{filteredRecords.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="no-print">
        <CardHeader>
          <CardTitle>Clock In/Out</CardTitle>
          <CardDescription>Record staff attendance with automatic location tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Staff Member</Label>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name} - {staff.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStaff && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Pay Rate: <span className="font-semibold text-foreground">${Number(selectedStaff.payRate)}/hour</span>
              </p>
            </div>
          )}

          {currentLocation && (
            <div className="rounded-lg border bg-green-50 dark:bg-green-950 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">Location Captured</p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(getGoogleMapsUrl(currentLocation), '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleClockIn} 
              disabled={clockInMutation.isPending || isCapturingLocation || !selectedStaffId}
              className="flex-1"
            >
              {isCapturingLocation ? (
                <>
                  <MapPin className="mr-2 h-4 w-4 animate-pulse" />
                  Capturing Location...
                </>
              ) : clockInMutation.isPending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Clocking In...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Clock In
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>View and manage attendance records with location data</CardDescription>
            </div>
            <div className="flex items-center gap-2 no-print w-full sm:w-auto">
              <Label className="hidden sm:inline">Filter by Staff:</Label>
              <Select value={filterStaffId} onValueChange={setFilterStaffId}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staffMembers.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
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
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Pay Rate</TableHead>
                  <TableHead>Total Pay</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="no-print">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map(record => {
                    const staff = staffMembers.find(s => s.id === record.staffId);
                    const date = new Date(Number(record.date) / 1000000);
                    const clockIn = new Date(Number(record.clockIn) / 1000000);
                    const clockOut = record.clockOut ? new Date(Number(record.clockOut) / 1000000) : null;
                    const hours = Number(record.hoursWorked);

                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{staff?.name || 'Unknown'}</TableCell>
                        <TableCell>{date.toLocaleDateString()}</TableCell>
                        <TableCell>{clockIn.toLocaleTimeString()}</TableCell>
                        <TableCell>
                          {clockOut ? (
                            clockOut.toLocaleTimeString()
                          ) : (
                            <span className="text-muted-foreground">Active</span>
                          )}
                        </TableCell>
                        <TableCell>{hours.toFixed(2)}h</TableCell>
                        <TableCell>${Number(record.payRate)}/hr</TableCell>
                        <TableCell className="font-semibold">${Number(record.totalPay).toLocaleString()}</TableCell>
                        <TableCell>
                          {record.location ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(getGoogleMapsUrl(record.location!), '_blank')}
                              className="gap-1"
                            >
                              <MapPin className="h-3 w-3" />
                              View Map
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="no-print">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditClockInDialog(record)}
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              Edit In
                            </Button>
                            {clockOut ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditClockOutDialog(record)}
                              >
                                <Edit className="mr-2 h-3 w-3" />
                                Edit Out
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleClockOut(record.staffId)}
                                disabled={clockOutMutation.isPending}
                              >
                                <Clock className="mr-2 h-3 w-3" />
                                Clock Out
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

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-4 border-t pt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold">{totalHours.toFixed(2)}h</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Pay</p>
              <p className="text-2xl font-bold text-primary">${totalPay.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Clock-In Time Dialog */}
      <Dialog open={editClockInDialogOpen} onOpenChange={setEditClockInDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Clock-In Time</DialogTitle>
            <DialogDescription>
              Modify the clock-in time for this attendance record. Hours worked and total pay will be automatically recalculated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingClockInRecord && (
              <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                <p><strong>Staff:</strong> {staffMembers.find(s => s.id === editingClockInRecord.staffId)?.name}</p>
                <p><strong>Current Clock-In:</strong> {new Date(Number(editingClockInRecord.clockIn) / 1000000).toLocaleString()}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-clockin-date">New Clock-In Date</Label>
              <Input
                id="edit-clockin-date"
                type="date"
                value={newClockInDate}
                onChange={(e) => setNewClockInDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-clockin-time">New Clock-In Time</Label>
              <Input
                id="edit-clockin-time"
                type="time"
                value={newClockInTime}
                onChange={(e) => setNewClockInTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditClockInDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={handleEditClockIn}
              disabled={editClockInMutation.isPending || !newClockInDate || !newClockInTime}
              className="w-full sm:w-auto"
            >
              {editClockInMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Clock-Out Time Dialog */}
      <Dialog open={editClockOutDialogOpen} onOpenChange={setEditClockOutDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Clock-Out Time</DialogTitle>
            <DialogDescription>
              Modify the clock-out time for this attendance record. Hours worked and total pay will be automatically recalculated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingClockOutRecord && (
              <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                <p><strong>Staff:</strong> {staffMembers.find(s => s.id === editingClockOutRecord.staffId)?.name}</p>
                <p><strong>Clock-In:</strong> {new Date(Number(editingClockOutRecord.clockIn) / 1000000).toLocaleString()}</p>
                {editingClockOutRecord.clockOut && (
                  <p><strong>Current Clock-Out:</strong> {new Date(Number(editingClockOutRecord.clockOut) / 1000000).toLocaleString()}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-clockout-date">New Clock-Out Date</Label>
              <Input
                id="edit-clockout-date"
                type="date"
                value={newClockOutDate}
                onChange={(e) => setNewClockOutDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-clockout-time">New Clock-Out Time</Label>
              <Input
                id="edit-clockout-time"
                type="time"
                value={newClockOutTime}
                onChange={(e) => setNewClockOutTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditClockOutDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={handleEditClockOut}
              disabled={editClockOutMutation.isPending || !newClockOutDate || !newClockOutTime}
              className="w-full sm:w-auto"
            >
              {editClockOutMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

