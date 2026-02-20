import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import type { Patient, Treatment } from '../backend';
import AIPrescriptionPanel from './AIPrescriptionPanel';

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient;
  onSave: (patient: Patient) => Promise<void>;
  isSaving: boolean;
}

export default function PatientDialog({ open, onOpenChange, patient, onSave, isSaving }: PatientDialogProps) {
  const [formData, setFormData] = useState<Patient>({
    id: '',
    name: '',
    phone: '',
    address: '',
    diagnosis: '',
    treatments: [],
    paid: BigInt(0),
    debt: BigInt(0),
  });

  const [newTreatment, setNewTreatment] = useState<Partial<Treatment>>({
    type: '',
    price: BigInt(0),
    notes: '',
  });

  useEffect(() => {
    if (patient) {
      setFormData(patient);
    } else {
      setFormData({
        id: `P${Date.now()}`,
        name: '',
        phone: '',
        address: '',
        diagnosis: '',
        treatments: [],
        paid: BigInt(0),
        debt: BigInt(0),
      });
    }
  }, [patient, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleAddTreatment = () => {
    if (newTreatment.type && newTreatment.price) {
      const treatment: Treatment = {
        type: newTreatment.type,
        price: BigInt(newTreatment.price),
        date: BigInt(Date.now() * 1000000),
        notes: newTreatment.notes || '',
        plan: undefined,
      };
      setFormData({ ...formData, treatments: [...formData.treatments, treatment] });
      setNewTreatment({ type: '', price: BigInt(0), notes: '' });
    }
  };

  const handleRemoveTreatment = (index: number) => {
    setFormData({
      ...formData,
      treatments: formData.treatments.filter((_, i) => i !== index),
    });
  };

  const handleAddTreatmentPlan = (treatment: Treatment) => {
    setFormData({ ...formData, treatments: [...formData.treatments, treatment] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              <TabsTrigger value="ai-prescription">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Prescription
              </TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
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
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="treatments" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Add Treatment</h4>
                  <div className="grid gap-3">
                    <Input
                      placeholder="Treatment type"
                      value={newTreatment.type}
                      onChange={(e) => setNewTreatment({ ...newTreatment, type: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={Number(newTreatment.price || 0)}
                      onChange={(e) => setNewTreatment({ ...newTreatment, price: BigInt(e.target.value || 0) })}
                    />
                    <Textarea
                      placeholder="Notes"
                      value={newTreatment.notes}
                      onChange={(e) => setNewTreatment({ ...newTreatment, notes: e.target.value })}
                    />
                    <Button type="button" onClick={handleAddTreatment} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Treatment
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Current Treatments ({formData.treatments.length})</h4>
                  {formData.treatments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No treatments added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.treatments.map((treatment, index) => (
                        <div key={index} className="flex items-start justify-between rounded-lg border p-3">
                          <div className="flex-1">
                            <p className="font-medium">{treatment.type}</p>
                            <p className="text-sm text-muted-foreground">
                              ${Number(treatment.price).toLocaleString()} - {treatment.notes}
                            </p>
                            {treatment.plan && (
                              <div className="mt-2 rounded bg-primary/5 p-2 text-xs">
                                <p className="font-medium text-primary">Treatment Plan:</p>
                                <p className="text-muted-foreground">{treatment.plan.description}</p>
                                <p className="text-muted-foreground">
                                  {new Date(Number(treatment.plan.startDate) / 1000000).toLocaleDateString()} - {new Date(Number(treatment.plan.endDate) / 1000000).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTreatment(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai-prescription" className="mt-4">
              <AIPrescriptionPanel
                patientName={formData.name}
                diagnosis={formData.diagnosis}
                onAddTreatmentPlan={handleAddTreatmentPlan}
              />
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="paid">Amount Paid</Label>
                <Input
                  id="paid"
                  type="number"
                  value={Number(formData.paid)}
                  onChange={(e) => setFormData({ ...formData, paid: BigInt(e.target.value || 0) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debt">Outstanding Debt</Label>
                <Input
                  id="debt"
                  type="number"
                  value={Number(formData.debt)}
                  onChange={(e) => setFormData({ ...formData, debt: BigInt(e.target.value || 0) })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Patient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
