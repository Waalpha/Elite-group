import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Student,
  SchoolClass,
  ClassRoom,
  Subject,
  Teacher,
  NonTeachingStaff,
  AttendanceRecord,
  Assessment,
  AssessmentResultItem,
  ExamResult,
  ReportCard,
  FeePayment,
  FeeStructure,
  FeeStructureItem,
  TimetableEntry,
  Assignment,
  AssignmentSubmission,
  Announcement,
  LibraryBook,
  BookLoan,
  InventoryItem,
  InventoryTransaction,
  TransportVehicle,
  TransportRoute,
  AdmissionApplication,
  SchoolSettings,
  AuditLog,
  UserProfile,
  UserRole,
} from '../types';

// Generic CRUD operations
export const firestoreService = {
  // Collection fetch
  async getCollection<T>(collectionName: string): Promise<T[]> {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as T[];
    } catch (error) {
      console.error(`Error fetching collection ${collectionName}:`, error);
      return [];
    }
  },

  // Document fetch
  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching document ${collectionName}/${docId}:`, error);
      return null;
    }
  },

  // Add document with auto-ID
  async addDocument<T extends Record<string, any>>(
    collectionName: string,
    data: T,
    auditContext?: { userId: string; userName: string; role: UserRole; action: string }
  ): Promise<string> {
    try {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (auditContext) {
        await this.logAudit({
          userId: auditContext.userId,
          userName: auditContext.userName,
          userRole: auditContext.role,
          action: auditContext.action,
          targetCollection: collectionName,
          recordId: docRef.id,
          details: `Created record in ${collectionName}`,
          timestamp: new Date().toISOString(),
        });
      }

      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  },

  // Set document with specified ID
  async setDocument<T extends Record<string, any>>(
    collectionName: string,
    docId: string,
    data: T,
    auditContext?: { userId: string; userName: string; role: UserRole; action: string }
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      if (auditContext) {
        await this.logAudit({
          userId: auditContext.userId,
          userName: auditContext.userName,
          userRole: auditContext.role,
          action: auditContext.action,
          targetCollection: collectionName,
          recordId: docId,
          details: `Set record in ${collectionName}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Error setting document in ${collectionName}/${docId}:`, error);
      throw error;
    }
  },

  // Update document
  async updateDocument<T extends Record<string, any>>(
    collectionName: string,
    docId: string,
    data: Partial<T>,
    auditContext?: { userId: string; userName: string; role: UserRole; action: string }
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });

      if (auditContext) {
        await this.logAudit({
          userId: auditContext.userId,
          userName: auditContext.userName,
          userRole: auditContext.role,
          action: auditContext.action,
          targetCollection: collectionName,
          recordId: docId,
          details: `Updated record in ${collectionName}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Error updating document ${collectionName}/${docId}:`, error);
      throw error;
    }
  },

  // Delete document
  async deleteDocument(
    collectionName: string,
    docId: string,
    auditContext?: { userId: string; userName: string; role: UserRole; action: string }
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);

      if (auditContext) {
        await this.logAudit({
          userId: auditContext.userId,
          userName: auditContext.userName,
          userRole: auditContext.role,
          action: auditContext.action,
          targetCollection: collectionName,
          recordId: docId,
          details: `Deleted record from ${collectionName}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Error deleting document ${collectionName}/${docId}:`, error);
      throw error;
    }
  },

  // Real-time listener for collection
  subscribeCollection<T>(
    collectionName: string,
    onData: (data: T[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as T[];
        onData(items);
      },
      (err) => {
        console.error(`Subscription error for ${collectionName}:`, err);
        if (onError) onError(err);
      }
    );
  },

  // Real-time listener for single document
  subscribeDocument<T>(
    collectionName: string,
    docId: string,
    onData: (data: T | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onData({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
          onData(null);
        }
      },
      (err) => {
        console.error(`Document subscription error for ${collectionName}/${docId}:`, err);
        if (onError) onError(err);
      }
    );
  },

  // Specific Business Methods
  async recordFeePayment(
    paymentData: Omit<FeePayment, 'id' | 'createdAt'>,
    userContext: { userId: string; userName: string; role: UserRole }
  ): Promise<string> {
    try {
      const paymentRef = doc(collection(db, 'payments'));
      const receiptId = paymentRef.id;

      // 1. Create payment document
      const fullPayment: FeePayment = {
        ...paymentData,
        id: receiptId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(paymentRef, fullPayment);

      // 2. Update student fee balance
      const studentRef = doc(db, 'students', paymentData.studentId);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const studentData = studentSnap.data() as Student;
        const currentPaid = Number(studentData.totalFeesPaid || 0);
        const currentBilled = Number(studentData.totalFeesBilled || 0);
        const newPaid = currentPaid + Number(paymentData.amountPaid);
        const newBalance = Math.max(0, currentBilled - newPaid);

        await updateDoc(studentRef, {
          totalFeesPaid: newPaid,
          feeBalance: newBalance,
          updatedAt: new Date().toISOString(),
        });
      }

      // 3. Log audit
      await this.logAudit({
        userId: userContext.userId,
        userName: userContext.userName,
        userRole: userContext.role,
        action: 'PAYMENT_RECORDED',
        targetCollection: 'payments',
        recordId: receiptId,
        details: `Recorded payment of KES ${paymentData.amountPaid} for ${paymentData.studentName} (${paymentData.admissionNumber}) via ${paymentData.paymentMethod}`,
        timestamp: new Date().toISOString(),
      });

      return receiptId;
    } catch (error) {
      console.error('Error recording fee payment:', error);
      throw error;
    }
  },

  async enrollApplicant(
    applicationId: string,
    studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>,
    userContext: { userId: string; userName: string; role: UserRole }
  ): Promise<string> {
    try {
      // Create student
      const studentRef = doc(collection(db, 'students'));
      const studentId = studentRef.id;

      const newStudent: Student = {
        ...studentData,
        id: studentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(studentRef, newStudent);

      // Update admission status
      const appRef = doc(db, 'admissions', applicationId);
      await updateDoc(appRef, {
        status: 'Enrolled',
        assignedAdmissionNumber: studentData.admissionNumber,
        updatedAt: new Date().toISOString(),
      });

      // Audit log
      await this.logAudit({
        userId: userContext.userId,
        userName: userContext.userName,
        userRole: userContext.role,
        action: 'APPLICANT_ENROLLED',
        targetCollection: 'students',
        recordId: studentId,
        details: `Enrolled student ${studentData.fullName} into ${studentData.currentClass} with Adm No ${studentData.admissionNumber}`,
        timestamp: new Date().toISOString(),
      });

      return studentId;
    } catch (error) {
      console.error('Error enrolling applicant:', error);
      throw error;
    }
  },

  async promoteStudent(
    studentId: string,
    fromClass: string,
    toClass: string,
    academicYear: string,
    status: 'Promoted' | 'Retained' | 'Graduated' | 'Transferred',
    remarks: string,
    userContext: { userId: string; userName: string; role: UserRole }
  ): Promise<void> {
    try {
      const studentRef = doc(db, 'students', studentId);
      const studentSnap = await getDoc(studentRef);
      if (!studentSnap.exists()) throw new Error('Student not found');
      const student = studentSnap.data() as Student;

      // 1. Add to student history
      const historyRef = doc(collection(db, 'studentHistory'));
      await setDoc(historyRef, {
        id: historyRef.id,
        studentId,
        studentName: student.fullName,
        admissionNumber: student.admissionNumber,
        academicYear,
        gradeLevel: fromClass,
        stream: student.stream,
        promotedTo: toClass,
        promotionStatus: status,
        remarks,
        updatedAt: new Date().toISOString(),
      });

      // 2. Update student current class
      await updateDoc(studentRef, {
        currentClass: toClass as any,
        status: status === 'Graduated' ? 'Graduated' : status === 'Transferred' ? 'Transferred' : 'Active',
        academicYear,
        updatedAt: new Date().toISOString(),
      });

      // 3. Audit
      await this.logAudit({
        userId: userContext.userId,
        userName: userContext.userName,
        userRole: userContext.role,
        action: 'STUDENT_PROMOTED',
        targetCollection: 'students',
        recordId: studentId,
        details: `${status} ${student.fullName} from ${fromClass} to ${toClass} for AY ${academicYear}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error promoting student:', error);
      throw error;
    }
  },

  async logAudit(log: Omit<AuditLog, 'id'>): Promise<void> {
    try {
      const logRef = doc(collection(db, 'auditLogs'));
      await setDoc(logRef, {
        ...log,
        id: logRef.id,
      });
    } catch (e) {
      console.warn('Failed to record audit log:', e);
    }
  },
};

// ==========================================
// Standalone Listeners and Helper Functions
// ==========================================

// Students
export const listenToStudents = (callback: (data: Student[]) => void) => {
  return firestoreService.subscribeCollection<Student>('students', callback);
};

export const addStudent = async (data: any) => {
  return firestoreService.addDocument('students', {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateStudent = async (id: string, data: Partial<Student> | any) => {
  return firestoreService.updateDocument('students', id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteStudent = async (id: string) => {
  return firestoreService.deleteDocument('students', id);
};

export const promoteStudent = async (
  studentId: string,
  promoteGrade: string,
  promoteStream?: string,
  reason?: string
) => {
  return firestoreService.updateDocument('students', studentId, {
    currentClass: promoteGrade as any,
    stream: promoteStream || 'EAST',
    promotionReason: reason || 'Academic Progression',
    updatedAt: new Date().toISOString(),
  });
};

// Teachers / Staff
export const listenToTeachers = (callback: (data: Teacher[]) => void) => {
  return firestoreService.subscribeCollection<Teacher>('teachers', callback);
};

export const addTeacher = async (data: any) => {
  return firestoreService.addDocument('teachers', {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateTeacher = async (id: string, data: Partial<Teacher> | any) => {
  return firestoreService.updateDocument('teachers', id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteTeacher = async (id: string) => {
  return firestoreService.deleteDocument('teachers', id);
};

// Classes
export const listenToClasses = (callback: (data: ClassRoom[]) => void) => {
  return firestoreService.subscribeCollection<ClassRoom>('classes', callback);
};

export const addClassRoom = async (data: any) => {
  return firestoreService.addDocument('classes', {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateClassRoom = async (id: string, data: Partial<ClassRoom> | any) => {
  return firestoreService.updateDocument('classes', id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// Admissions / Applications
export const listenToApplications = (callback: (data: AdmissionApplication[]) => void) => {
  return firestoreService.subscribeCollection<AdmissionApplication>('admissions', callback);
};

export const addApplication = async (data: any) => {
  return firestoreService.addDocument('admissions', {
    ...data,
    applicationDate: data.applicationDate || new Date().toISOString().split('T')[0],
    status: data.status || 'Pending',
    createdAt: new Date().toISOString(),
  });
};

export const addAdmissionApplication = addApplication;

export const updateApplicationStatus = async (id: string, status: string) => {
  return firestoreService.updateDocument('admissions', id, {
    status,
    updatedAt: new Date().toISOString(),
  });
};

// Attendance
export const listenToAttendance = (callback: (data: AttendanceRecord[]) => void) => {
  return firestoreService.subscribeCollection<AttendanceRecord>('attendance', callback);
};

export const recordBulkAttendance = async (records: any) => {
  if (Array.isArray(records)) {
    for (const record of records) {
      await firestoreService.addDocument('attendance', record);
    }
  } else {
    await firestoreService.addDocument('attendance', records);
  }
};

// Examinations / Results
export const listenToExamResults = (callback: (data: ExamResult[]) => void) => {
  return firestoreService.subscribeCollection<ExamResult>('examResults', callback);
};

export const saveBulkExamResults = async (results: any[]) => {
  for (const item of results) {
    await firestoreService.addDocument('examResults', {
      ...item,
      createdAt: new Date().toISOString(),
    });
  }
};

// Finance & Fee Payments
export const listenToFeePayments = (callback: (data: FeePayment[]) => void) => {
  return firestoreService.subscribeCollection<FeePayment>('payments', callback);
};

export const listenToFeeStructures = (callback: (data: FeeStructure[]) => void) => {
  return firestoreService.subscribeCollection<FeeStructure>('feeStructures', callback);
};

export const recordFeePayment = async (paymentData: any) => {
  const receiptNumber = paymentData.receiptNumber || `UES-REC-${Date.now().toString().slice(-6)}`;
  const paymentRecord: FeePayment = {
    ...paymentData,
    receiptNumber,
    createdAt: new Date().toISOString(),
    paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
  };

  const paymentId = await firestoreService.addDocument('payments', paymentRecord);

  // Update student fee balance
  if (paymentData.studentId) {
    try {
      const student = await firestoreService.getDocument<Student>('students', paymentData.studentId);
      if (student) {
        const amount = Number(paymentData.amount || paymentData.amountPaid || 0);
        const newPaid = (Number(student.totalFeesPaid) || 0) + amount;
        const billed = Number(student.totalFeesBilled) || 0;
        const newBalance = Math.max(0, billed - newPaid);
        await firestoreService.updateDocument('students', paymentData.studentId, {
          totalFeesPaid: newPaid,
          feeBalance: newBalance,
        });
      }
    } catch (e) {
      console.warn('Failed to update student fee balance:', e);
    }
  }

  return { id: paymentId, ...paymentRecord };
};

// Assignments
export const listenToAssignments = (callback: (data: Assignment[]) => void) => {
  return firestoreService.subscribeCollection<Assignment>('assignments', callback);
};

export const addAssignment = async (data: any) => {
  return firestoreService.addDocument('assignments', {
    ...data,
    createdAt: new Date().toISOString(),
  });
};

// Announcements
export const listenToAnnouncements = (callback: (data: Announcement[]) => void) => {
  return firestoreService.subscribeCollection<Announcement>('announcements', callback);
};

export const addAnnouncement = async (data: any) => {
  return firestoreService.addDocument('announcements', {
    ...data,
    publishedDate: data.publishedDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  });
};

export const deleteAnnouncement = async (id: string) => {
  return firestoreService.deleteDocument('announcements', id);
};

// Library
export const listenToLibraryBooks = (callback: (data: LibraryBook[]) => void) => {
  return firestoreService.subscribeCollection<LibraryBook>('libraryBooks', callback);
};

export const listenToBookLoans = (callback: (data: BookLoan[]) => void) => {
  return firestoreService.subscribeCollection<BookLoan>('bookLoans', callback);
};

export const addLibraryBook = async (data: any) => {
  const copies = Number(data.totalCopies) || 1;
  return firestoreService.addDocument('libraryBooks', {
    ...data,
    totalCopies: copies,
    availableCopies: copies,
    borrowedCopies: 0,
    createdAt: new Date().toISOString(),
  });
};

export const borrowBook = async (loanData: any) => {
  const loanId = await firestoreService.addDocument('bookLoans', {
    ...loanData,
    status: 'Active',
    borrowedDate: loanData.borrowDate || loanData.borrowedDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  });

  if (loanData.bookId) {
    try {
      const book = await firestoreService.getDocument<LibraryBook>('libraryBooks', loanData.bookId);
      if (book) {
        const avail = Math.max(0, (book.availableCopies || 1) - 1);
        const borrowed = (book.borrowedCopies || 0) + 1;
        await firestoreService.updateDocument('libraryBooks', loanData.bookId, {
          availableCopies: avail,
          borrowedCopies: borrowed,
        });
      }
    } catch (e) {
      console.warn('Failed to update book count:', e);
    }
  }

  return loanId;
};

export const returnBook = async (loanId: string, bookId: string) => {
  await firestoreService.updateDocument('bookLoans', loanId, {
    status: 'Returned',
    returnedDate: new Date().toISOString().split('T')[0],
  });

  if (bookId) {
    try {
      const book = await firestoreService.getDocument<LibraryBook>('libraryBooks', bookId);
      if (book) {
        const avail = (book.availableCopies || 0) + 1;
        const borrowed = Math.max(0, (book.borrowedCopies || 1) - 1);
        await firestoreService.updateDocument('libraryBooks', bookId, {
          availableCopies: avail,
          borrowedCopies: borrowed,
        });
      }
    } catch (e) {
      console.warn('Failed to update book count upon return:', e);
    }
  }
};

// Inventory
export const listenToInventoryItems = (callback: (data: InventoryItem[]) => void) => {
  return firestoreService.subscribeCollection<InventoryItem>('inventoryItems', callback);
};

export const addInventoryItem = async (data: any) => {
  return firestoreService.addDocument('inventoryItems', {
    ...data,
    createdAt: new Date().toISOString(),
  });
};

export const adjustInventoryStock = async (itemId: string, change: number, reason: string) => {
  const item = await firestoreService.getDocument<InventoryItem>('inventoryItems', itemId);
  if (item) {
    const currentQty = Number(item.quantityInStock) || 0;
    const newQty = Math.max(0, currentQty + change);
    await firestoreService.updateDocument('inventoryItems', itemId, {
      quantityInStock: newQty,
      updatedAt: new Date().toISOString(),
    });
    await firestoreService.addDocument('inventoryTransactions', {
      itemId,
      itemName: item.name,
      type: change >= 0 ? 'Stock In' : 'Stock Out',
      quantity: Math.abs(change),
      date: new Date().toISOString(),
      reason,
      authorizedBy: 'Storekeeper',
    });
  }
};

// Transport
export const listenToTransportRoutes = (callback: (data: TransportRoute[]) => void) => {
  return firestoreService.subscribeCollection<TransportRoute>('transportRoutes', callback);
};

export const addTransportRoute = async (data: any) => {
  return firestoreService.addDocument('transportRoutes', {
    ...data,
    createdAt: new Date().toISOString(),
  });
};

// School Settings
export const listenToSchoolSettings = (callback: (data: SchoolSettings | null) => void) => {
  return onSnapshot(
    doc(db, 'settings', 'schoolProfile'),
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as SchoolSettings);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Error subscribing to school settings:', err);
    }
  );
};

export const updateSchoolSettings = async (data: Partial<SchoolSettings>) => {
  return firestoreService.setDocument('settings', 'schoolProfile', {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// Fee Structures
export const addFeeStructure = async (data: any) => {
  return firestoreService.addDocument('feeStructures', {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateFeeStructure = async (id: string, data: Partial<FeeStructure> | any) => {
  return firestoreService.updateDocument('feeStructures', id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteFeeStructure = async (id: string) => {
  return firestoreService.deleteDocument('feeStructures', id);
};

// Non-Teaching Staff
export const listenToNonTeachingStaff = (callback: (data: NonTeachingStaff[]) => void) => {
  return firestoreService.subscribeCollection<NonTeachingStaff>('nonTeachingStaff', callback);
};

export const addNonTeachingStaff = async (data: any) => {
  return firestoreService.addDocument('nonTeachingStaff', {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateNonTeachingStaff = async (id: string, data: Partial<NonTeachingStaff> | any) => {
  return firestoreService.updateDocument('nonTeachingStaff', id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteNonTeachingStaff = async (id: string) => {
  return firestoreService.deleteDocument('nonTeachingStaff', id);
};

// Staff Suspensions & Reactivations
export const suspendTeacher = async (
  teacherId: string,
  reason: string,
  auditContext?: { userId: string; userName: string; role: UserRole }
) => {
  return firestoreService.updateDocument(
    'teachers',
    teacherId,
    {
      status: 'SUSPENDED',
      suspensionReason: reason,
      suspensionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    auditContext
      ? {
          ...auditContext,
          action: 'STAFF_SUSPENDED',
        }
      : undefined
  );
};

export const reactivateTeacher = async (
  teacherId: string,
  auditContext?: { userId: string; userName: string; role: UserRole }
) => {
  return firestoreService.updateDocument(
    'teachers',
    teacherId,
    {
      status: 'ACTIVE',
      suspensionReason: '',
      suspensionDate: '',
      updatedAt: new Date().toISOString(),
    },
    auditContext
      ? {
          ...auditContext,
          action: 'STAFF_REACTIVATED',
        }
      : undefined
  );
};

// Website Settings
export const listenToWebsiteSettings = (callback: (data: any) => void) => {
  return firestoreService.subscribeDocument<any>('settings', 'websiteSettings', callback);
};

export const updateWebsiteSettings = async (data: any) => {
  return firestoreService.setDocument('settings', 'websiteSettings', {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// Role Permissions Matrix
export const listenToRolePermissions = (callback: (data: any[]) => void) => {
  return firestoreService.subscribeCollection<any>('rolePermissions', callback);
};

export const updateRolePermission = async (roleId: string, data: any) => {
  return firestoreService.setDocument('rolePermissions', roleId, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// System Users Management
export const listenToUsers = (callback: (data: UserProfile[]) => void) => {
  return firestoreService.subscribeCollection<UserProfile>('users', callback);
};

export const addUser = async (data: any) => {
  return firestoreService.addDocument('users', {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateUser = async (id: string, data: Partial<UserProfile> | any) => {
  return firestoreService.updateDocument('users', id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteUser = async (id: string) => {
  return firestoreService.deleteDocument('users', id);
};

// Audit Logs
export const listenToAuditLogs = (callback: (data: AuditLog[]) => void) => {
  return firestoreService.subscribeCollection<AuditLog>('auditLogs', callback);
};


