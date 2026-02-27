import { useState } from 'react';
import { useGetAllPatients, useAddPatient, useUpdatePatient, useDeletePatient, useResetAllPatients } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { Patient } from '../backend';
import PatientDialog from '../components/PatientDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PatientsPage() {
  const { data: patients = [], isLoading } = useGetAllPatients();
  const addPatientMutation = useAddPatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();
  const resetAllMutation = useResetAllPatients();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = async (patient: Patient) => {
    try {
      await addPatientMutation.mutateAsync(patient);
      toast.success('Patient added successfully');
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add patient');
    }
  };

  const handleUpdatePatient = async (patient: Patient) => {
    try {
      await updatePatientMutation.mutateAsync({ id: patient.id, patient });
      toast.success('Patient updated successfully');
      setEditingPatient(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update patient');
    }
  };

  const handleDeletePatient = async (id: string) => {
    try {
      await deletePatientMutation.mutateAsync(id);
      toast.success('Patient deleted successfully');
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete patient');
    }
  };

  const handleResetAll = async () => {
    try {
      await resetAllMutation.mutateAsync();
      toast.success('All patients reset successfully');
      setShowResetConfirm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset patients');
    }
  };

  return (
    <div className="container py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">Manage patient records and treatments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
            disabled={patients.length === 0}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset All
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search patients by name, phone, or diagnosis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Treatments</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Debt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading patients...
                </TableCell>
              </TableRow>
            ) : filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No patients found matching your search' : 'No patients yet. Add your first patient!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.diagnosis}</TableCell>
                  <TableCell>{patient.treatments.length}</TableCell>
                  <TableCell className="text-right">${Number(patient.paid).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={Number(patient.debt) > 0 ? 'text-destructive font-medium' : ''}>
                      ${Number(patient.debt).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPatient(patient)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(patient.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PatientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddPatient}
        isSaving={addPatientMutation.isPending}
      />

      <PatientDialog
        open={!!editingPatient}
        onOpenChange={(open) => !open && setEditingPatient(null)}
        patient={editingPatient || undefined}
        onSave={handleUpdatePatient}
        isSaving={updatePatientMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDeletePatient(deleteConfirmId)}
        title="Delete Patient"
        description="Are you sure you want to delete this patient? This action cannot be undone."
        isLoading={deletePatientMutation.isPending}
      />

      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleResetAll}
        title="Reset All Patients"
        description="Are you sure you want to delete all patient records? This action cannot be undone."
        isLoading={resetAllMutation.isPending}
      />
    </div>
  );
}
