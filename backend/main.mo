import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";



actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();

  // Data Types
  type TreatmentPlan = {
    description : Text;
    startDate : Time.Time;
    endDate : Time.Time;
  };

  type Treatment = {
    type_ : Text;
    price : Nat;
    date : Time.Time;
    notes : Text;
    plan : ?TreatmentPlan;
  };

  type Patient = {
    id : Text;
    name : Text;
    phone : Text;
    address : Text;
    diagnosis : Text;
    treatments : [Treatment];
    paid : Nat;
    debt : Nat;
  };

  type SpendingCategory = {
    #equipment;
    #medications;
    #supplies;
    #rent;
    #utilities;
    #insurance;
    #marketing;
    #misc;
  };

  type Spending = {
    id : Text;
    category : SpendingCategory;
    description : Text;
    amount : Nat;
    date : Time.Time;
  };

  type MiscExpense = {
    id : Text;
    description : Text;
    amount : Nat;
    category : SpendingCategory;
    date : Time.Time;
  };

  type StaffMember = {
    id : Text;
    name : Text;
    position : Text;
    phone : Text;
    qualifications : Text;
    payRate : Nat;
  };

  type Location = {
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
  };

  type StaffAttendance = {
    id : Text;
    staffId : Text;
    date : Time.Time;
    clockIn : Time.Time;
    clockOut : ?Time.Time;
    hoursWorked : Nat;
    payRate : Nat;
    totalPay : Nat;
    location : ?Location;
    locationHistory : [Location];
  };

  type PatientSession = {
    id : Text;
    patientId : Text;
    date : Time.Time;
    checkIn : Time.Time;
    checkOut : ?Time.Time;
    duration : Nat;
    treatmentPackageId : Text;
    visitNumber : Nat;
    progressPercentage : Nat;
  };

  type EditableSessionFields = {
    patientId : ?Text;
    date : ?Time.Time;
    checkIn : ?Time.Time;
    checkOut : ?Time.Time;
    duration : ?Nat;
    treatmentPackageId : ?Text;
    visitNumber : ?Nat;
    progressPercentage : ?Nat;
  };

  let patients = Map.empty<Text, Patient>();
  let staff = Map.empty<Text, StaffMember>();
  let spendings = Map.empty<Text, Spending>();
  let attendances = Map.empty<Text, StaffAttendance>();
  let sessions = Map.empty<Text, PatientSession>();
  let miscExpenses = Map.empty<Text, MiscExpense>();
  let staffPrincipals = Map.empty<Text, Principal>();

  public type UserProfile = {
    name : Text;
    role : Text;
    staffId : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type BackupData = {
    patients : [Patient];
    staff : [StaffMember];
    spendings : [Spending];
    attendances : [StaffAttendance];
    sessions : [PatientSession];
    miscExpenses : [MiscExpense];
    timestamp : Time.Time;
  };

  public type BackupRecord = {
    id : Text;
    timestamp : Time.Time;
    recordCount : {
      patients : Nat;
      staff : Nat;
      spendings : Nat;
      attendances : Nat;
      sessions : Nat;
      miscExpenses : Nat;
    };
  };

  let backupRecords = Map.empty<Text, BackupRecord>();

  func ensureAdmin(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Admins only");
    };
  };

  func ensureUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Users only");
    };
  };

  func getStaffIdForCaller(caller : Principal) : ?Text {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.staffId };
      case (null) { null };
    };
  };

  func isStaffMemberOrAdmin(caller : Principal, staffId : Text) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    switch (getStaffIdForCaller(caller)) {
      case (?callerStaffId) { callerStaffId == staffId };
      case (null) { false };
    };
  };

  // Access Control Functions
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside AccessControl.assignRole
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    ensureUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot view other profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    ensureUser(caller);
    userProfiles.add(caller, profile);

    switch (profile.staffId) {
      case (?staffId) {
        staffPrincipals.add(staffId, caller);
      };
      case (null) {};
    };
  };

  // Patient Management
  public shared ({ caller }) func addPatient(patient : Patient) : async () {
    ensureAdmin(caller);
    if (patients.containsKey(patient.id)) {
      Runtime.trap("Patient already exists");
    };
    patients.add(patient.id, patient);
  };

  public shared ({ caller }) func updatePatient(id : Text, patient : Patient) : async () {
    ensureAdmin(caller);
    if (not patients.containsKey(id)) {
      Runtime.trap("Patient does not exist");
    };
    patients.add(id, patient);
  };

  public shared ({ caller }) func deletePatient(id : Text) : async () {
    ensureAdmin(caller);
    if (not patients.containsKey(id)) {
      Runtime.trap("Patient does not exist");
    };
    patients.remove(id);
  };

  public shared ({ caller }) func resetAllPatients() : async () {
    ensureAdmin(caller);
    patients.clear();
  };

  public query ({ caller }) func getAllPatients() : async [Patient] {
    ensureUser(caller);
    patients.values().toArray();
  };

  // Staff Management
  public shared ({ caller }) func addStaff(staffMember : StaffMember) : async () {
    ensureAdmin(caller);
    if (staff.containsKey(staffMember.id)) {
      Runtime.trap("Staff already exists");
    };
    staff.add(staffMember.id, staffMember);
  };

  public shared ({ caller }) func updateStaff(id : Text, staffMember : StaffMember) : async () {
    ensureAdmin(caller);
    if (not staff.containsKey(id)) {
      Runtime.trap("Staff does not exist");
    };
    staff.add(id, staffMember);
  };

  public shared ({ caller }) func deleteStaff(id : Text) : async () {
    ensureAdmin(caller);
    if (not staff.containsKey(id)) {
      Runtime.trap("Staff does not exist");
    };
    staff.remove(id);
  };

  public shared ({ caller }) func resetAllStaff() : async () {
    ensureAdmin(caller);
    staff.clear();
  };

  public query ({ caller }) func getAllStaff() : async [StaffMember] {
    ensureUser(caller);
    staff.values().toArray();
  };

  // Staff Attendance Tracking - Admin Only Modifications
  public type ClockInData = {
    staffId : Text;
    location : ?Location;
  };

  public type ClockOutData = {
    staffId : Text;
  };

  public shared ({ caller }) func clockInStaff(data : ClockInData) : async () {
    ensureAdmin(caller);

    let staffId = data.staffId;

    let staffMember = switch (staff.get(staffId)) {
      case (null) { Runtime.trap("Staff member not found.") };
      case (?staffMember) { staffMember };
    };

    let attendanceId = staffId # "_" # Time.now().toText();
    let attendance : StaffAttendance = {
      id = attendanceId;
      staffId;
      date = Time.now();
      clockIn = Time.now();
      clockOut = null;
      hoursWorked = 0;
      payRate = staffMember.payRate;
      totalPay = 0;
      location = data.location;
      locationHistory = switch (data.location) {
        case (null) { [] };
        case (?location) { [location] };
      };
    };

    attendances.add(attendanceId, attendance);
  };

  public shared ({ caller }) func clockOutStaff(data : ClockOutData) : async () {
    ensureAdmin(caller);

    let attendancesArray = attendances.values().toArray();

    let matchingAttendance = attendancesArray.find(
      func(attendance) {
        attendance.staffId == data.staffId and attendance.clockOut == null
      }
    );

    switch (matchingAttendance) {
      case (?attendance) {
        let updatedAttendance = {
          attendance with
          clockOut = ?Time.now();
          hoursWorked = switch (attendance.clockOut, Time.now()) {
            case (null, now) {
              ((now - attendance.clockIn) / 3_600_000_000_000).toNat();
            };
            case (?_existing, _) { attendance.hoursWorked };
          };
          totalPay = switch (attendance.clockOut, Time.now()) {
            case (null, now) {
              let hoursWorked : Nat = ((now - attendance.clockIn) / 3_600_000_000_000).toNat();
              hoursWorked * attendance.payRate;
            };
            case (?_existing, _) { attendance.totalPay };
          };
        };
        attendances.add(attendance.id, updatedAttendance);
      };
      case (null) { Runtime.trap("No open attendance record found for staffId.") };
    };
  };

  public shared ({ caller }) func updateStaffLocation(staffId : Text, location : Location) : async () {
    ensureAdmin(caller);

    let copiedEntries = List.empty<(Text, StaffAttendance)>();

    for ((id, record) in attendances.entries()) {
      if (record.staffId == staffId and record.clockOut == null) {
        let newHistory = record.locationHistory.concat([location]);
        let updatedRecord = {
          record with
          location = ?location;
          locationHistory = newHistory;
        };
        copiedEntries.add((id, updatedRecord));
      } else {
        copiedEntries.add((id, record));
      };
    };

    attendances.clear();
    for (entry in copiedEntries.values()) {
      switch (entry) {
        case ((id, record)) {
          attendances.add(id, record);
        };
      };
    };
  };

  // Editing Staff Clock-In Time - Admin Only
  public shared ({ caller }) func editClockInTime(staffId : Text, attendanceId : Text, newClockInTime : Time.Time) : async () {
    ensureAdmin(caller);

    let attendance = switch (attendances.get(attendanceId)) {
      case (null) { Runtime.trap("Attendance record not found") };
      case (?record) { record };
    };

    let updatedAttendance = {
      attendance with
      clockIn = newClockInTime;
      hoursWorked = switch (attendance.clockOut) {
        case (null) { attendance.hoursWorked };
        case (?clockOutTime) {
          let duration = clockOutTime - newClockInTime;
          if (duration > 0) {
            (duration / 3_600_000_000_000).toNat();
          } else { 0 };
        };
      };
      totalPay = switch (attendance.clockOut) {
        case (null) { attendance.totalPay };
        case (?clockOutTime) {
          let duration = clockOutTime - newClockInTime;
          if (duration > 0) {
            let hoursWorked : Nat = (duration / 3_600_000_000_000).toNat();
            hoursWorked * attendance.payRate;
          } else { 0 };
        };
      };
    };
    attendances.add(attendanceId, updatedAttendance);
  };

  // Editing Staff Clock-Out Time - Admin Only
  public shared ({ caller }) func editClockOutTime(staffId : Text, attendanceId : Text, newClockOutTime : Time.Time) : async () {
    ensureAdmin(caller);

    let attendance = switch (attendances.get(attendanceId)) {
      case (null) { Runtime.trap("Attendance record not found") };
      case (?record) { record };
    };

    let updatedAttendance = {
      attendance with
      clockOut = ?newClockOutTime;
      hoursWorked = switch (attendance.clockIn) {
        case (clockInTime) {
          let duration = newClockOutTime - clockInTime;
          if (duration > 0) {
            (duration / 3_600_000_000_000).toNat();
          } else { 0 };
        };
      };
      totalPay = switch (attendance.clockIn) {
        case (clockInTime) {
          let duration = newClockOutTime - clockInTime;
          if (duration > 0) {
            let hoursWorked : Nat = (duration / 3_600_000_000_000).toNat();
            hoursWorked * attendance.payRate;
          } else { 0 };
        };
      };
    };
    attendances.add(attendanceId, updatedAttendance);
  };

  // Patient Session Tracking - Admin Only
  public type CheckInData = {
    patientId : Text;
    treatmentPackageId : Text;
    visitNumber : Nat;
  };

  public type CheckOutData = {
    patientId : Text;
  };

  public shared ({ caller }) func checkInPatient(data : CheckInData) : async () {
    ensureAdmin(caller);

    let sessionId = data.patientId # "_" # Time.now().toText();

    let session : PatientSession = {
      id = sessionId;
      patientId = data.patientId;
      date = Time.now();
      checkIn = Time.now();
      checkOut = null;
      duration = 0;
      treatmentPackageId = data.treatmentPackageId;
      visitNumber = data.visitNumber;
      progressPercentage = 0;
    };

    sessions.add(sessionId, session);
  };

  public shared ({ caller }) func checkOutPatient(data : CheckOutData) : async () {
    ensureAdmin(caller);

    let sessionsArray = sessions.values().toArray();

    let matchingSession = sessionsArray.find(
      func(session) {
        session.patientId == data.patientId and session.checkOut == null;
      }
    );

    switch (matchingSession) {
      case (?session) {
        let updatedSession = {
          session with
          checkOut = ?Time.now();
          duration = switch (session.checkOut, Time.now()) {
            case (null, now) {
              ((now - session.checkIn) / 3_600_000_000_000).toNat();
            };
            case (?_existing, _) { session.duration };
          };
          progressPercentage = switch (session.checkOut, Time.now()) {
            case (null, _) {
              let totalSessions = 10;
              let completedSessions = session.visitNumber;
              if (totalSessions > 0) {
                (completedSessions * 100) / totalSessions;
              } else { 0 };
            };
            case (?_existing, _) { session.progressPercentage };
          };
        };
        sessions.add(session.id, updatedSession);
      };
      case (null) { Runtime.trap("No open session record found for patientId.") };
    };
  };

  public query ({ caller }) func getPatientSessions(patientId : Text) : async [PatientSession] {
    ensureUser(caller);
    let sessionsList = List.empty<PatientSession>();
    for (session in sessions.values()) {
      if (session.patientId == patientId) {
        sessionsList.add(session);
      };
    };
    sessionsList.toArray();
  };

  // Editing Patient Session Check-In Time - Admin Only
  public shared ({ caller }) func editCheckInTime(patientId : Text, sessionId : Text, newCheckInTime : Time.Time) : async () {
    ensureAdmin(caller);

    let session = switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session record not found") };
      case (?record) { record };
    };

    let updatedSession = {
      session with
      checkIn = newCheckInTime;
      date = newCheckInTime;
      duration = switch (session.checkOut) {
        case (null) { session.duration };
        case (?checkOutTime) {
          let duration = checkOutTime - newCheckInTime;
          if (duration > 0) {
            (duration / 3_600_000_000_000).toNat();
          } else { 0 };
        };
      };
      progressPercentage = switch (session.checkOut) {
        case (null) { session.progressPercentage };
        case (?_) {
          if (session.visitNumber > 0) {
            (session.visitNumber * 100) / 10;
          } else { 0 };
        };
      };
    };
    sessions.add(sessionId, updatedSession);
  };

  // Editing Patient Session Check-Out Time - Admin Only
  public shared ({ caller }) func editCheckOutTime(patientId : Text, sessionId : Text, newCheckOutTime : Time.Time) : async () {
    ensureAdmin(caller);

    let session = switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session record not found") };
      case (?record) { record };
    };

    let updatedSession = {
      session with
      checkOut = ?newCheckOutTime;
      duration = switch (session.checkIn) {
        case (checkInTime) {
          if (newCheckOutTime > checkInTime) {
            ((newCheckOutTime - checkInTime) / 3_600_000_000_000).toNat();
          } else { 0 };
        };
      };
      progressPercentage = switch (session.visitNumber) {
        case (0) { 0 };
        case (visit) {
          let totalSessions = 10;
          if (totalSessions > 0) {
            (visit * 100) / totalSessions;
          } else { 0 };
        };
      };
    };
    sessions.add(sessionId, updatedSession);
  };

  // Update Patient Session Record - Admin Only
  public shared ({ caller }) func updatePatientSession(id : Text, changes : EditableSessionFields) : async () {
    ensureAdmin(caller);

    switch (sessions.get(id)) {
      case (null) { Runtime.trap("Patient session does not exist") };
      case (?existingSession) {
        let updatedSession : PatientSession = {
          existingSession with
          patientId = (switch (changes.patientId) { case (null) { existingSession.patientId } });
          date = (switch (changes.date) { case (null) { existingSession.date } });
          checkIn = (switch (changes.checkIn) { case (null) { existingSession.checkIn } });
          checkOut = (switch (changes.checkOut) { case (null) { existingSession.checkOut } });
          duration = (switch (changes.duration) { case (null) { existingSession.duration } });
          treatmentPackageId = (switch (changes.treatmentPackageId) { case (null) { existingSession.treatmentPackageId } });
          visitNumber = (switch (changes.visitNumber) { case (null) { existingSession.visitNumber } });
          progressPercentage = (switch (changes.progressPercentage) { case (null) { existingSession.progressPercentage } });
        };
        sessions.add(id, updatedSession);
      };
    };
  };

  // Data Backup & Restore System - Admin Only
  public shared ({ caller }) func createBackupRecord(data : BackupData, recordId : Text) : async () {
    ensureAdmin(caller);

    let record : BackupRecord = {
      id = recordId;
      timestamp = Time.now();
      recordCount = {
        patients = data.patients.size();
        staff = data.staff.size();
        spendings = data.spendings.size();
        attendances = data.attendances.size();
        sessions = data.sessions.size();
        miscExpenses = data.miscExpenses.size();
      };
    };

    backupRecords.add(recordId, record);
  };

  public query ({ caller }) func getBackupRecords() : async [BackupRecord] {
    ensureAdmin(caller);
    backupRecords.values().toArray();
  };

  public query ({ caller }) func exportAllData() : async BackupData {
    ensureAdmin(caller);
    {
      patients = patients.values().toArray();
      staff = staff.values().toArray();
      spendings = spendings.values().toArray();
      attendances = attendances.values().toArray();
      sessions = sessions.values().toArray();
      miscExpenses = miscExpenses.values().toArray();
      timestamp = Time.now();
    };
  };

  public shared ({ caller }) func importBackupData(backupData : BackupData) : async () {
    ensureAdmin(caller);

    patients.clear();
    staff.clear();
    spendings.clear();
    attendances.clear();
    sessions.clear();
    miscExpenses.clear();

    for (patient in backupData.patients.vals()) {
      patients.add(patient.id, patient);
    };

    for (staffMember in backupData.staff.vals()) {
      staff.add(staffMember.id, staffMember);
    };

    for (spending in backupData.spendings.vals()) {
      spendings.add(spending.id, spending);
    };

    for (attendance in backupData.attendances.vals()) {
      attendances.add(attendance.id, attendance);
    };

    for (session in backupData.sessions.vals()) {
      sessions.add(session.id, session);
    };

    for (miscExpense in backupData.miscExpenses.vals()) {
      miscExpenses.add(miscExpense.id, miscExpense);
    };

    let recordId = "backup-" # backupData.timestamp.toText();
    await createBackupRecord(backupData, recordId);
  };

  public shared ({ caller }) func mergeBackupData(backupData : BackupData) : async () {
    ensureAdmin(caller);

    for (patient in backupData.patients.vals()) {
      if (not patients.containsKey(patient.id)) {
        patients.add(patient.id, patient);
      };
    };

    for (staffMember in backupData.staff.vals()) {
      if (not staff.containsKey(staffMember.id)) {
        staff.add(staffMember.id, staffMember);
      };
    };

    for (spending in backupData.spendings.vals()) {
      if (not spendings.containsKey(spending.id)) {
        spendings.add(spending.id, spending);
      };
    };

    for (attendance in backupData.attendances.vals()) {
      if (not attendances.containsKey(attendance.id)) {
        attendances.add(attendance.id, attendance);
      };
    };

    for (session in backupData.sessions.vals()) {
      if (not miscExpenses.containsKey(session.id)) {
        sessions.add(session.id, session);
      };
    };

    for (miscExpense in backupData.miscExpenses.vals()) {
      if (not miscExpenses.containsKey(miscExpense.id)) {
        miscExpenses.add(miscExpense.id, miscExpense);
      };
    };

    let recordId = "merge-" # Time.now().toText();
    await createBackupRecord(backupData, recordId);
  };

  public shared ({ caller }) func resetAllData() : async () {
    ensureAdmin(caller);
    patients.clear();
    staff.clear();
    spendings.clear();
    attendances.clear();
    sessions.clear();
    miscExpenses.clear();
  };

  // Reporting Methods
  public query ({ caller }) func getStaffAttendance(staffId : Text) : async [StaffAttendance] {
    if (not isStaffMemberOrAdmin(caller, staffId)) {
      Runtime.trap("Unauthorized: Can only view your own attendance or admin access required");
    };

    let attendancesList = List.empty<StaffAttendance>();
    for (attendance in attendances.values()) {
      if (attendance.staffId == staffId) {
        attendancesList.add(attendance);
      };
    };
    attendancesList.toArray();
  };

  public query ({ caller }) func getAllAttendances() : async [StaffAttendance] {
    ensureAdmin(caller);
    attendances.values().toArray();
  };

  public query ({ caller }) func getAllSessions() : async [PatientSession] {
    ensureUser(caller);
    sessions.values().toArray();
  };

  // Miscellaneous Expenses Management - Admin Only
  public shared ({ caller }) func addMiscExpense(expense : MiscExpense) : async () {
    ensureAdmin(caller);
    if (miscExpenses.containsKey(expense.id)) {
      Runtime.trap("MiscExpense already exists");
    };
    miscExpenses.add(expense.id, expense);
  };

  public shared ({ caller }) func updateMiscExpense(id : Text, expense : MiscExpense) : async () {
    ensureAdmin(caller);
    if (not miscExpenses.containsKey(id)) {
      Runtime.trap("MiscExpense does not exist");
    };
    miscExpenses.add(id, expense);
  };

  public shared ({ caller }) func deleteMiscExpense(id : Text) : async () {
    ensureAdmin(caller);
    if (not miscExpenses.containsKey(id)) {
      Runtime.trap("MiscExpense does not exist");
    };
    miscExpenses.remove(id);
  };

  public query ({ caller }) func getAllMiscExpenses() : async [MiscExpense] {
    ensureUser(caller);
    miscExpenses.values().toArray();
  };

  // Category Spending Management - Admin Only
  public shared ({ caller }) func addSpending(spending : Spending) : async () {
    ensureAdmin(caller);
    spendings.add(spending.id, spending);
  };

  public shared ({ caller }) func editSpending(id : Text, updatedSpending : Spending) : async () {
    ensureAdmin(caller);
    if (not spendings.containsKey(id)) {
      Runtime.trap("Spending not found");
    };
    spendings.add(id, updatedSpending);
  };

  public query ({ caller }) func getSpendingsByCategory(category : SpendingCategory) : async [Spending] {
    ensureUser(caller);
    let filtered = List.empty<Spending>();
    for (spending in spendings.values()) {
      if (spending.category == category) {
        filtered.add(spending);
      };
    };
    filtered.toArray();
  };

  public query ({ caller }) func getAllSpendings() : async [Spending] {
    ensureUser(caller);
    spendings.values().toArray();
  };
};
