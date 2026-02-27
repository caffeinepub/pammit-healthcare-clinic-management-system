import { useState } from 'react';
import { useGetAllStaffMembers, useAddStaffMember, useUpdateStaffMember, useDeleteStaffMember, useResetAllStaff } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { StaffMember } from '../backend';
import StaffDialog from '../components/StaffDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function StaffPage() {
  const { data: staff = [], isLoading } = useGetAllStaffMembers();
  const addStaffMutation = useAddStaffMember();
  const updateStaffMutation = useUpdateStaffMember();
  const deleteStaffMutation = useDeleteStaffMember();
  const resetAllMutation = useResetAllStaff();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredStaff = staff.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  const handleAddStaff = async (staffMember: StaffMember) => {
    try {
      await addStaffMutation.mutateAsync(staffMember);
      toast.success('Staff member added successfully');
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add staff member');
    }
  };

  const handleUpdateStaff = async (staffMember: StaffMember) => {
    try {
      await updateStaffMutation.mutateAsync({ id: staffMember.id, staffMember });
      toast.success('Staff member updated successfully');
      setEditingStaff(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update staff member');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteStaffMutation.mutateAsync(id);
      toast.success('Staff member deleted successfully');
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete staff member');
    }
  };

  const handleResetAll = async () => {
    try {
      await resetAllMutation.mutateAsync();
      toast.success('All staff members reset successfully');
      setShowResetConfirm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset staff');
    }
  };

  return (
    <div className="container py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff members and their roles</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
            disabled={staff.length === 0}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset All
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search staff by name, position, or phone..."
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
              <TableHead>Position</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Qualifications</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading staff...
                </TableCell>
              </TableRow>
            ) : filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No staff members found matching your search' : 'No staff members yet. Add your first staff member!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.position}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell className="max-w-xs truncate">{member.qualifications}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingStaff(member)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(member.id)}
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

      <StaffDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddStaff}
        isSaving={addStaffMutation.isPending}
      />

      <StaffDialog
        open={!!editingStaff}
        onOpenChange={(open) => !open && setEditingStaff(null)}
        staffMember={editingStaff || undefined}
        onSave={handleUpdateStaff}
        isSaving={updateStaffMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDeleteStaff(deleteConfirmId)}
        title="Delete Staff Member"
        description="Are you sure you want to delete this staff member? This action cannot be undone."
        isLoading={deleteStaffMutation.isPending}
      />

      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleResetAll}
        title="Reset All Staff"
        description="Are you sure you want to delete all staff records? This action cannot be undone."
        isLoading={resetAllMutation.isPending}
      />
    </div>
  );
}
