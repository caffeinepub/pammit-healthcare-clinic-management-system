import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    latitude: number;
    longitude: number;
    timestamp: Time;
}
export interface Treatment {
    date: Time;
    plan?: TreatmentPlan;
    type: string;
    notes: string;
    price: bigint;
}
export type Time = bigint;
export interface Spending {
    id: string;
    date: Time;
    description: string;
    category: SpendingCategory;
    amount: bigint;
}
export interface PatientSession {
    id: string;
    checkIn: Time;
    duration: bigint;
    visitNumber: bigint;
    progressPercentage: bigint;
    patientId: string;
    date: Time;
    treatmentPackageId: string;
    checkOut?: Time;
}
export interface MiscExpense {
    id: string;
    date: Time;
    description: string;
    category: SpendingCategory;
    amount: bigint;
}
export interface CheckOutData {
    patientId: string;
}
export interface Patient {
    id: string;
    debt: bigint;
    name: string;
    paid: bigint;
    diagnosis: string;
    address: string;
    phone: string;
    treatments: Array<Treatment>;
}
export interface StaffMember {
    id: string;
    name: string;
    qualifications: string;
    phone: string;
    position: string;
    payRate: bigint;
}
export interface TreatmentPlan {
    endDate: Time;
    description: string;
    startDate: Time;
}
export interface StaffAttendance {
    id: string;
    staffId: string;
    date: Time;
    hoursWorked: bigint;
    clockOut?: Time;
    clockIn: Time;
    totalPay: bigint;
    locationHistory: Array<Location>;
    payRate: bigint;
    location?: Location;
}
export interface ClockInData {
    staffId: string;
    location?: Location;
}
export interface BackupRecord {
    id: string;
    timestamp: Time;
    recordCount: {
        spendings: bigint;
        attendances: bigint;
        staff: bigint;
        sessions: bigint;
        patients: bigint;
        miscExpenses: bigint;
    };
}
export interface CheckInData {
    visitNumber: bigint;
    patientId: string;
    treatmentPackageId: string;
}
export interface BackupData {
    spendings: Array<Spending>;
    attendances: Array<StaffAttendance>;
    staff: Array<StaffMember>;
    sessions: Array<PatientSession>;
    timestamp: Time;
    patients: Array<Patient>;
    miscExpenses: Array<MiscExpense>;
}
export interface ClockOutData {
    staffId: string;
}
export interface UserProfile {
    staffId?: string;
    name: string;
    role: string;
}
export enum SpendingCategory {
    equipment = "equipment",
    marketing = "marketing",
    supplies = "supplies",
    misc = "misc",
    rent = "rent",
    utilities = "utilities",
    insurance = "insurance",
    medications = "medications"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMiscExpense(expense: MiscExpense): Promise<void>;
    addPatient(patient: Patient): Promise<void>;
    addSpending(spending: Spending): Promise<void>;
    addStaff(staffMember: StaffMember): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkInPatient(data: CheckInData): Promise<void>;
    checkOutPatient(data: CheckOutData): Promise<void>;
    clockInStaff(data: ClockInData): Promise<void>;
    clockOutStaff(data: ClockOutData): Promise<void>;
    createBackupRecord(data: BackupData, recordId: string): Promise<void>;
    deleteMiscExpense(id: string): Promise<void>;
    deletePatient(id: string): Promise<void>;
    deleteStaff(id: string): Promise<void>;
    editCheckInTime(patientId: string, sessionId: string, newCheckInTime: Time): Promise<void>;
    editCheckOutTime(patientId: string, sessionId: string, newCheckOutTime: Time): Promise<void>;
    editClockInTime(staffId: string, attendanceId: string, newClockInTime: Time): Promise<void>;
    editClockOutTime(staffId: string, attendanceId: string, newClockOutTime: Time): Promise<void>;
    exportAllData(): Promise<BackupData>;
    getAllAttendances(): Promise<Array<StaffAttendance>>;
    getAllMiscExpenses(): Promise<Array<MiscExpense>>;
    getAllPatients(): Promise<Array<Patient>>;
    getAllSessions(): Promise<Array<PatientSession>>;
    getAllStaff(): Promise<Array<StaffMember>>;
    getBackupRecords(): Promise<Array<BackupRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPatientSessions(patientId: string): Promise<Array<PatientSession>>;
    getSpendingsByCategory(category: SpendingCategory): Promise<Array<Spending>>;
    getStaffAttendance(staffId: string): Promise<Array<StaffAttendance>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    importBackupData(backupData: BackupData): Promise<void>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    mergeBackupData(backupData: BackupData): Promise<void>;
    resetAllData(): Promise<void>;
    resetAllPatients(): Promise<void>;
    resetAllStaff(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateMiscExpense(id: string, expense: MiscExpense): Promise<void>;
    updatePatient(id: string, patient: Patient): Promise<void>;
    updateStaff(id: string, staffMember: StaffMember): Promise<void>;
    updateStaffLocation(staffId: string, location: Location): Promise<void>;
}
