import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { StaffMember } from '../backend';

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMember?: StaffMember;
  onSave: (staffMember: StaffMember) => Promise<void>;
  isSaving: boolean;
}

export default function StaffDialog({ open, onOpenChange, staffMember, onSave, isSaving }: StaffDialogProps) {
  const [formData, setFormData] = useState<StaffMember>({
    id: '',
    name: '',
    position: '',
    phone: '',
    qualifications: '',
    payRate: BigInt(0),
  });

  useEffect(() => {
    if (staffMember) {
      setFormData(staffMember);
    } else {
      setFormData({
        id: `S${Date.now()}`,
        name: '',
        position: '',
        phone: '',
        qualifications: '',
        payRate: BigInt(0),
      });
    }
  }, [staffMember, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{staffMember ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payRate">Pay Rate ($/hour) *</Label>
            <Input
              id="payRate"
              type="number"
              min="0"
              step="0.01"
              value={Number(formData.payRate)}
              onChange={(e) => setFormData({ ...formData, payRate: BigInt(Math.round(parseFloat(e.target.value) * 100) / 100) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications</Label>
            <Textarea
              id="qualifications"
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Staff Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
