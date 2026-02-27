import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PatientSession, Patient } from '@/backend';
import { useUpdatePatientSession } from '@/hooks/useQueries';

interface SessionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: PatientSession | null;
  patients: Patient[];
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

export default function SessionEditDialog({ open, onOpenChange, session, patients }: SessionEditDialogProps) {
  const updateSession = useUpdatePatientSession();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [visitNumber, setVisitNumber] = useState('');
  const [progressPercentage, setProgressPercentage] = useState('');
  const [treatmentPackageId, setTreatmentPackageId] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (session) {
      setCheckIn(nsToDatetimeLocal(session.checkIn));
      setCheckOut(session.checkOut ? nsToDatetimeLocal(session.checkOut) : '');
      setVisitNumber(String(session.visitNumber));
      setProgressPercentage(String(session.progressPercentage));
      setTreatmentPackageId(session.treatmentPackageId);
      setDuration(String(session.duration));
    }
  }, [session]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name ?? patientId;
  };

  const handleSave = async () => {
    if (!session) return;
    await updateSession.mutateAsync({
      id: session.id,
      changes: {
        checkIn: checkIn ? datetimeLocalToNs(checkIn) : undefined,
        checkOut: checkOut ? datetimeLocalToNs(checkOut) : undefined,
        visitNumber: visitNumber ? BigInt(visitNumber) : undefined,
        progressPercentage: progressPercentage ? BigInt(progressPercentage) : undefined,
        treatmentPackageId: treatmentPackageId || undefined,
        duration: duration ? BigInt(duration) : undefined,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
          <DialogDescription>
            {session ? `Editing session for ${getPatientName(session.patientId)}` : 'Edit session details'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {session && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p><span className="font-medium">Patient:</span> {getPatientName(session.patientId)}</p>
              <p><span className="font-medium">Session ID:</span> {session.id.slice(0, 20)}...</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-checkin">Check-In Time</Label>
              <Input
                id="edit-checkin"
                type="datetime-local"
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-checkout">Check-Out Time</Label>
              <Input
                id="edit-checkout"
                type="datetime-local"
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-visit">Visit Number</Label>
              <Input
                id="edit-visit"
                type="number"
                min="1"
                value={visitNumber}
                onChange={e => setVisitNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-progress">Progress (%)</Label>
              <Input
                id="edit-progress"
                type="number"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={e => setProgressPercentage(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-package">Treatment Package</Label>
              <Input
                id="edit-package"
                value={treatmentPackageId}
                onChange={e => setTreatmentPackageId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-duration">Duration (hours)</Label>
              <Input
                id="edit-duration"
                type="number"
                min="0"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateSession.isPending}>
            {updateSession.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
