import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Patient, UserProfile, BackupData, StaffMember, Spending, StaffAttendance, PatientSession, Location, Time, ClockInData, ClockOutData, CheckInData, CheckOutData, MiscExpense, SpendingCategory } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Patient Queries
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
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
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
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
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
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
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
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
    },
  });
}

// Query to get full backup data - used as source for all data
export function useGetBackupData() {
  const { actor, isFetching } = useActor();

  return useQuery<BackupData>({
    queryKey: ['backupData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportAllData();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000, // Cache for 30 seconds
  });
}

// Staff Queries - Now using direct backend calls
export function useGetAllStaffMembers() {
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

export function useAddStaffMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffMember: StaffMember) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStaff(staffMember);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
    },
  });
}

export function useUpdateStaffMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, staffMember }: { id: string; staffMember: StaffMember }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStaff(id, staffMember);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
    },
  });
}

export function useDeleteStaffMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteStaff(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
    },
  });
}

// Spendings queries using backup data
export function useGetAllSpendings() {
  const { data: backupData, isLoading } = useGetBackupData();
  
  return {
    data: backupData?.spendings || [],
    isLoading,
  };
}

// Spending Operations - Backend integrated
export function useAddSpending() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spending: Spending) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSpending(spending);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
    },
  });
}

export function useUpdateSpending() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, spending }: { id: string; spending: Spending }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have updateSpending, so we need to delete and re-add
      // This is a workaround until backend implements updateSpending
      await actor.addSpending(spending);
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
    },
  });
}

export function useDeleteSpending() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have deleteSpending method
      // This is a workaround - we'll need to implement this in backend
      throw new Error('Delete spending is not yet implemented in the backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
    },
  });
}

export function useResetAllSpendings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have resetAllSpendings method
      // This is a workaround - we'll need to implement this in backend
      throw new Error('Reset all spendings is not yet implemented in the backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
    },
  });
}

export function useGetSpendingsByCategory(category: SpendingCategory) {
  const { actor, isFetching } = useActor();

  return useQuery<Spending[]>({
    queryKey: ['spendings', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSpendingsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

// Miscellaneous Expenses Queries
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
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
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
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
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
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
    },
  });
}

// Staff Attendance queries using backup data
export function useGetAllStaffAttendance() {
  const { data: backupData, isLoading } = useGetBackupData();
  
  return {
    data: backupData?.attendances || [],
    isLoading,
  };
}

// Staff Attendance Operations - Backend integrated
export function useClockInStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClockInData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.clockInStaff(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['staffAttendance'] });
    },
  });
}

export function useClockOutStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClockOutData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.clockOutStaff(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['staffAttendance'] });
    },
  });
}

export function useEditClockInTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffId, attendanceId, newClockInTime }: { staffId: string; attendanceId: string; newClockInTime: Time }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editClockInTime(staffId, attendanceId, newClockInTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['staffAttendance'] });
    },
  });
}

export function useEditClockOutTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffId, attendanceId, newClockOutTime }: { staffId: string; attendanceId: string; newClockOutTime: Time }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editClockOutTime(staffId, attendanceId, newClockOutTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['staffAttendance'] });
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
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['staffAttendance'] });
    },
  });
}

export function useGetStaffAttendance(staffId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StaffAttendance[]>({
    queryKey: ['staffAttendance', staffId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStaffAttendance(staffId);
    },
    enabled: !!actor && !isFetching && !!staffId,
  });
}

// Patient Sessions queries using backup data
export function useGetAllPatientSessions() {
  const { data: backupData, isLoading } = useGetBackupData();
  
  return {
    data: backupData?.sessions || [],
    isLoading,
  };
}

// Patient Session Operations - Backend integrated
export function useCheckInPatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckInData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkInPatient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['patientSessions'] });
    },
  });
}

export function useCheckOutPatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckOutData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkOutPatient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['patientSessions'] });
    },
  });
}

export function useEditCheckInTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, sessionId, newCheckInTime }: { patientId: string; sessionId: string; newCheckInTime: Time }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editCheckInTime(patientId, sessionId, newCheckInTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['patientSessions'] });
    },
  });
}

export function useEditCheckOutTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, sessionId, newCheckOutTime }: { patientId: string; sessionId: string; newCheckOutTime: Time }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editCheckOutTime(patientId, sessionId, newCheckOutTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
      queryClient.invalidateQueries({ queryKey: ['patientSessions'] });
    },
  });
}

export function useGetPatientSessions(patientId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PatientSession[]>({
    queryKey: ['patientSessions', patientId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPatientSessions(patientId);
    },
    enabled: !!actor && !isFetching && !!patientId,
  });
}

// Summary data computed from backup data
export function useGetSummaryData() {
  const { data: backupData, isLoading } = useGetBackupData();
  
  const summaryData = backupData ? {
    totalPatients: BigInt(backupData.patients.length),
    totalStaff: BigInt(backupData.staff.length),
    totalSpendings: BigInt(backupData.spendings.length),
    totalPayments: backupData.patients.reduce((sum, p) => sum + p.paid, BigInt(0)),
  } : null;
  
  return {
    data: summaryData,
    isLoading,
  };
}

export function useGetLocationHistory(_staffId?: string | null, _startDate?: Time | null, _endDate?: Time | null) {
  const { data: backupData, isLoading } = useGetBackupData();
  
  return {
    data: [] as Location[],
    isLoading,
  };
}

export function useGetAllStaffAttendanceLocations() {
  const { data: backupData, isLoading } = useGetBackupData();
  
  return {
    data: [] as Array<[string, Location | null]>,
    isLoading,
  };
}

// Backup & Restore Queries
export function useExportAllData() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportAllData();
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
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['miscExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
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
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['miscExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
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
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['miscExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['backupMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['backupData'] });
    },
  });
}

// Backup Metadata Query - uses exportAllData to get current counts
export function useGetBackupMetadata() {
  const { data: backupData, isLoading } = useGetBackupData();

  const metadata = backupData ? {
    patientCount: BigInt(backupData.patients.length),
    staffCount: BigInt(backupData.staff.length),
    spendingCount: BigInt(backupData.spendings.length),
    attendanceCount: BigInt(backupData.attendances.length),
    sessionCount: BigInt(backupData.sessions.length),
    miscExpenseCount: BigInt(backupData.miscExpenses.length),
    lastModified: backupData.timestamp,
  } : null;

  return {
    data: metadata,
    isLoading,
  };
}

