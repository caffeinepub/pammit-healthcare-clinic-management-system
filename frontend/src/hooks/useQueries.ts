import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Patient,
  StaffMember,
  Spending,
  MiscExpense,
  StaffAttendance,
  PatientSession,
  BackupData,
  EditableSessionFields,
  Location,
} from '../backend';
import { SpendingCategory } from '../backend';

// ─── Patients ────────────────────────────────────────────────────────────────

export function useGetAllPatients() {
  const { actor, isFetching } = useActor();
  return useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPatients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patient: Patient) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPatient(patient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patient }: { id: string; patient: Patient }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePatient(id, patient);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeletePatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePatient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useResetAllPatients() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetAllPatients();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export function useGetAllStaff() {
  const { actor, isFetching } = useActor();
  return useQuery<StaffMember[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStaff();
    },
    enabled: !!actor && !isFetching,
  });
}

// Backward-compatible aliases
export const useGetAllStaffMembers = useGetAllStaff;

export function useAddStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffMember: StaffMember) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStaff(staffMember);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

// Backward-compatible alias
export const useAddStaffMember = useAddStaff;

export function useUpdateStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, staffMember }: { id: string; staffMember: StaffMember }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStaff(id, staffMember);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

// Backward-compatible alias
export const useUpdateStaffMember = useUpdateStaff;

export function useDeleteStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteStaff(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

// Backward-compatible alias
export const useDeleteStaffMember = useDeleteStaff;

export function useResetAllStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetAllStaff();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

// ─── Spendings ────────────────────────────────────────────────────────────────

export function useGetAllSpendings() {
  const { actor, isFetching } = useActor();
  return useQuery<Spending[]>({
    queryKey: ['spendings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSpendings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSpending() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (spending: Spending) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSpending(spending);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendings'] });
    },
  });
}

export function useEditSpending() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, spending }: { id: string; spending: Spending }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editSpending(id, spending);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendings'] });
    },
  });
}

// ─── Misc Expenses ────────────────────────────────────────────────────────────

export function useGetAllMiscExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery<MiscExpense[]>({
    queryKey: ['miscExpenses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMiscExpenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMiscExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expense: MiscExpense) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMiscExpense(expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miscExpenses'] });
    },
  });
}

export function useUpdateMiscExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, expense }: { id: string; expense: MiscExpense }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMiscExpense(id, expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miscExpenses'] });
    },
  });
}

export function useDeleteMiscExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMiscExpense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miscExpenses'] });
    },
  });
}

// ─── Staff Attendance ─────────────────────────────────────────────────────────

export function useGetAllAttendances() {
  const { actor, isFetching } = useActor();
  return useQuery<StaffAttendance[]>({
    queryKey: ['attendances'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAttendances();
    },
    enabled: !!actor && !isFetching,
  });
}

// Backward-compatible alias
export const useGetAllStaffAttendance = useGetAllAttendances;

export function useGetStaffAttendance(staffId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<StaffAttendance[]>({
    queryKey: ['attendances', staffId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStaffAttendance(staffId);
    },
    enabled: !!actor && !isFetching && !!staffId,
  });
}

export function useClockInStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { staffId: string; location?: Location }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.clockInStaff(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });
}

export function useClockOutStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { staffId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.clockOutStaff(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });
}

export function useUpdateStaffLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ staffId, location }: { staffId: string; location: Location }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStaffLocation(staffId, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });
}

export function useEditClockInTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      staffId,
      attendanceId,
      newClockInTime,
    }: {
      staffId: string;
      attendanceId: string;
      newClockInTime: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editClockInTime(staffId, attendanceId, newClockInTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });
}

export function useEditClockOutTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      staffId,
      attendanceId,
      newClockOutTime,
    }: {
      staffId: string;
      attendanceId: string;
      newClockOutTime: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editClockOutTime(staffId, attendanceId, newClockOutTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });
}

// ─── Patient Sessions ─────────────────────────────────────────────────────────

export function useGetAllSessions() {
  const { actor, isFetching } = useActor();
  return useQuery<PatientSession[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

// Backward-compatible alias
export const useGetAllPatientSessions = useGetAllSessions;

export function useGetPatientSessions(patientId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PatientSession[]>({
    queryKey: ['sessions', patientId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPatientSessions(patientId);
    },
    enabled: !!actor && !isFetching && !!patientId,
  });
}

export function useCheckInPatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      patientId: string;
      treatmentPackageId: string;
      visitNumber: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkInPatient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useCheckOutPatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { patientId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkOutPatient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useEditCheckInTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      sessionId,
      newCheckInTime,
    }: {
      patientId: string;
      sessionId: string;
      newCheckInTime: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editCheckInTime(patientId, sessionId, newCheckInTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useEditCheckOutTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      sessionId,
      newCheckOutTime,
    }: {
      patientId: string;
      sessionId: string;
      newCheckOutTime: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editCheckOutTime(patientId, sessionId, newCheckOutTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useUpdatePatientSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: EditableSessionFields }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePatientSession(id, changes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

// ─── Backup & Restore ─────────────────────────────────────────────────────────

export function useGetBackupMetadata() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['backupMetadata'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const data = await actor.exportAllData();
      return {
        patientCount: data.patients.length,
        staffCount: data.staff.length,
        spendingCount: data.spendings.length,
        attendanceCount: data.attendances.length,
        sessionCount: data.sessions.length,
        miscExpenseCount: data.miscExpenses.length,
        lastModified: data.timestamp,
      };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBackupRecords() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['backupRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBackupRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExportAllData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<BackupData> => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportAllData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupRecords'] });
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
    },
  });
}

export function useImportBackupData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (backupData: BackupData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.importBackupData(backupData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useMergeBackupData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (backupData: BackupData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.mergeBackupData(backupData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useResetAllData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetAllData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

// ─── Summary Data (computed from patients + staff + spendings) ────────────────

export interface SummaryData {
  totalPatients: number;
  totalStaff: number;
  totalPayments: number;
  totalDebt: number;
  totalSpendings: number;
  isLoading: boolean;
}

export function useGetSummaryData(): SummaryData & { data: SummaryData; isLoading: boolean } {
  const { data: patients = [], isLoading: patientsLoading } = useGetAllPatients();
  const { data: staff = [], isLoading: staffLoading } = useGetAllStaff();
  const { data: spendings = [], isLoading: spendingsLoading } = useGetAllSpendings();

  const isLoading = patientsLoading || staffLoading || spendingsLoading;

  const totalPayments = patients.reduce((sum, p) => sum + Number(p.paid), 0);
  const totalDebt = patients.reduce((sum, p) => sum + Number(p.debt), 0);
  const totalSpendings = spendings.length;

  const result: SummaryData = {
    totalPatients: patients.length,
    totalStaff: staff.length,
    totalPayments,
    totalDebt,
    totalSpendings,
    isLoading,
  };

  // Return both the flat shape AND a { data, isLoading } shape for backward compatibility
  return {
    ...result,
    data: result,
    isLoading,
  };
}

// ─── Location History (derived from attendances) ──────────────────────────────

export function useGetLocationHistory(
  staffId?: string | null,
  startTimestamp?: bigint | null,
  endTimestamp?: bigint | null
) {
  const { data: attendances = [], isLoading } = useGetAllAttendances();

  const locationHistory = attendances
    .filter((a) => !staffId || a.staffId === staffId)
    .flatMap((a) =>
      (a.locationHistory || []).map((loc) => ({
        ...loc,
        staffId: a.staffId,
        attendanceId: a.id,
      }))
    )
    .filter((loc) => {
      if (startTimestamp && loc.timestamp < startTimestamp) return false;
      if (endTimestamp && loc.timestamp > endTimestamp) return false;
      return true;
    })
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  return { data: locationHistory, isLoading };
}

// ─── Category helpers ─────────────────────────────────────────────────────────

export const SPENDING_CATEGORIES: SpendingCategory[] = [
  SpendingCategory.equipment,
  SpendingCategory.medications,
  SpendingCategory.supplies,
  SpendingCategory.rent,
  SpendingCategory.utilities,
  SpendingCategory.insurance,
  SpendingCategory.marketing,
  SpendingCategory.misc,
];

export function categoryLabel(cat: SpendingCategory): string {
  const labels: Record<SpendingCategory, string> = {
    [SpendingCategory.equipment]: 'Equipment',
    [SpendingCategory.medications]: 'Medications',
    [SpendingCategory.supplies]: 'Supplies',
    [SpendingCategory.rent]: 'Rent',
    [SpendingCategory.utilities]: 'Utilities',
    [SpendingCategory.insurance]: 'Insurance',
    [SpendingCategory.marketing]: 'Marketing',
    [SpendingCategory.misc]: 'Miscellaneous',
  };
  return labels[cat] ?? cat;
}
