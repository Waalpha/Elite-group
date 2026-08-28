export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'DEPUTY_PRINCIPAL'
  | 'TEACHER'
  | 'ACCOUNTANT'
  | 'REGISTRAR'
  | 'PARENT'
  | 'STUDENT'
  | 'LIBRARIAN'
  | 'STOREKEEPER'
  | 'TRANSPORT_MANAGER';

export interface UserProfile {
  id: string; // Firebase Auth UID or Firestore doc ID
  email: string;
  username?: string;
  password?: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
  associatedId?: string; // Links to Student ID, Teacher Staff ID, or Parent ID
  status: 'active' | 'suspended' | 'inactive';
  createdBy?: string;
  createdAt?: string;
  lastLogin?: string;
}

export type GradeLevel =
  | 'Playgroup'
  | 'PP1'
  | 'PP2'
  | 'Grade 1'
  | 'Grade 2'
  | 'Grade 3'
  | 'Grade 4'
  | 'Grade 5'
  | 'Grade 6'
  | 'Grade 7'
  | 'Grade 8'
  | 'Grade 9'
  | 'PLAYGROUP'
  | 'GRADE_1'
  | 'GRADE_2'
  | 'GRADE_3'
  | 'GRADE_4'
  | 'GRADE_5'
  | 'GRADE_6'
  | 'GRADE_7'
  | 'GRADE_8'
  | 'GRADE_9';

export const ALL_GRADE_LEVELS: GradeLevel[] = [
  'Playgroup',
  'PP1',
  'PP2',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
];

export type StreamName =
  | 'EAST'
  | 'WEST'
  | 'NORTH'
  | 'SOUTH'
  | 'East'
  | 'West'
  | 'North'
  | 'South'
  | 'Blue'
  | 'Gold'
  | 'Red'
  | 'Green'
  | 'Yellow'
  | string;

export type Gender = 'Male' | 'Female' | 'Other' | 'MALE' | 'FEMALE';

export interface ClassRoom {
  id: string;
  name: string; // e.g. "Grade 1 East"
  grade?: GradeLevel | string;
  level?: GradeLevel | string;
  stream?: StreamName | string;
  streamIds?: string[];
  capacity?: number;
  roomNumber?: string;
  academicYear?: string;
  classTeacherId?: string;
  classTeacherName?: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Grade 6"
  level: GradeLevel;
  streamIds: string[];
  classTeacherId?: string;
  classTeacherName?: string;
  capacity?: number;
  roomNumber?: string;
  academicYear: string;
}

export interface Stream {
  id: string;
  classId: string;
  className: string;
  name: string; // e.g. "East", "West", "Blue", "Gold"
  streamTeacherId?: string;
  streamTeacherName?: string;
  capacity?: number;
}

export interface Subject {
  id: string;
  code: string; // e.g. "ENG", "KIS", "MTH", "SCI"
  name: string; // e.g. "English Language Activities"
  category: 'Languages' | 'STEM' | 'Humanities' | 'Creative & Technical' | 'Pre-Vocational' | 'Early Years';
  applicableGrades: GradeLevel[];
  isCore: boolean;
  department?: string;
  headTeacherId?: string;
  description?: string;
}

// CBC / CBE Specific Structures
export interface LearningArea {
  id: string;
  gradeLevel: GradeLevel;
  subjectId: string;
  subjectName: string;
  title: string;
  strandsCount?: number;
}

export interface Strand {
  id: string;
  learningAreaId: string;
  title: string; // e.g. "Numbers & Operations"
  description?: string;
}

export interface SubStrand {
  id: string;
  strandId: string;
  title: string; // e.g. "Whole numbers up to 10,000"
  learningOutcomes: string[];
  suggestedActivities?: string[];
  keyCompetencies?: string[];
}

export type StudentStatus = 'Active' | 'Graduated' | 'Transferred' | 'Withdrawn' | 'Suspended';

export interface Student {
  id: string;
  admissionNumber: string; // Unique e.g. "UES-2024-0108"
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  currentClass: GradeLevel;
  grade?: GradeLevel;
  stream: string; // e.g. "East"
  streamId?: string;
  admissionDate: string;
  photoUrl?: string;
  birthCertificateNo?: string;
  upiNemisNo?: string;
  previousSchool?: string;
  medicalConditions?: string;
  allergies?: string;
  bloodGroup?: string;
  specialNeeds?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  residentialAddress?: string;
  transportRouteId?: string;
  status: StudentStatus;
  academicYear: string;
  feeBalance?: number;
  totalFeesBilled?: number;
  totalFeesPaid?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdmissionApplication {
  id: string;
  applicantNumber?: string;
  applicationNumber?: string;
  firstName?: string;
  applicantFirstName?: string;
  middleName?: string;
  lastName?: string;
  applicantLastName?: string;
  dateOfBirth?: string;
  dob?: string;
  gender: 'Male' | 'Female' | 'Other';
  requestedGrade?: GradeLevel;
  gradeApplying?: GradeLevel;
  previousSchool?: string;
  previousGrade?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  parentOccupation?: string;
  residentialArea?: string;
  medicalInfo?: string;
  applicationDate: string;
  status: 'Pending' | 'Interview Scheduled' | 'Accepted' | 'Rejected' | 'Enrolled' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'WAITLIST';
  assignedAdmissionNumber?: string;
  interviewDate?: string;
  notes?: string;
  reviewedBy?: string;
}

export interface StudentAcademicHistory {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  academicYear: string;
  gradeLevel: GradeLevel;
  stream: string;
  term1Average?: number;
  term2Average?: number;
  term3Average?: number;
  overallAverage?: number;
  promotedTo?: GradeLevel;
  promotionStatus: 'Promoted' | 'Retained' | 'Transferred' | 'Graduated';
  remarks?: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  staffId: string; // e.g. "UES-T-042"
  firstName: string;
  lastName: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'MALE' | 'FEMALE';
  email: string;
  phone: string;
  nationalId?: string;
  tscNumber?: string; // Teachers Service Commission Number
  department: string;
  specialization?: string | string[];
  assignedClasses: GradeLevel[];
  assignedGrades?: string[];
  assignedSubjects: string[];
  qualification?: string;
  employmentDate: string;
  hireDate?: string;
  photoUrl?: string;
  status: 'Active' | 'On Leave' | 'Resigned' | 'Suspended' | 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'SUSPENDED';
  role?: UserRole | string;
  salary?: number;
  suspensionReason?: string;
  suspensionDate?: string;
  notes?: string;
}

export interface NonTeachingStaff {
  id: string;
  staffId: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'MALE' | 'FEMALE';
  email: string;
  phone: string;
  nationalId?: string;
  department: 'Administration' | 'Finance' | 'Transport' | 'Library' | 'Store' | 'Catering' | 'Security' | 'Maintenance' | string;
  position: string;
  employmentDate: string;
  status: 'Active' | 'On Leave' | 'Resigned' | 'Suspended' | 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'SUSPENDED';
  role?: UserRole | string;
  salary?: number;
  suspensionReason?: string;
  suspensionDate?: string;
  notes?: string;
}

export interface ParentGuardian {
  id: string;
  fullName: string;
  relationship: 'Father' | 'Mother' | 'Guardian';
  phone: string;
  email: string;
  occupation?: string;
  idNumber?: string;
  address?: string;
  childrenIds: string[]; // List of Student doc IDs
  childrenNames?: string[];
}

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Late'
  | 'Excused'
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'EXCUSED';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  gradeLevel?: GradeLevel;
  grade?: GradeLevel;
  stream: string;
  academicYear?: string;
  term?: 'Term 1' | 'Term 2' | 'Term 3' | 'TERM_1' | 'TERM_2' | 'TERM_3' | string;
  recordedByTeacherId?: string;
  recordedByTeacherName?: string;
  recordedBy?: string;
  totalPresent?: number;
  totalAbsent?: number;
  totalLate?: number;
  totalExcused?: number;
  studentId?: string;
  studentName?: string;
  admissionNumber?: string;
  status?: AttendanceStatus;
  remarks?: string;
  records?: {
    studentId: string;
    studentName: string;
    admissionNumber: string;
    status: AttendanceStatus;
    remarks?: string;
  }[];
  createdAt?: string;
}

export type AssessmentType = 'CAT' | 'Mid-Term' | 'End-Term' | 'Assignment' | 'Project' | 'CBC_Continuous';

export type ExamType =
  | 'OPENER'
  | 'MID_TERM'
  | 'END_OF_TERM'
  | 'CBC_ASSESSMENT'
  | 'PROJECT'
  | 'CAT'
  | 'Mid-Term'
  | 'End-Term'
  | 'Assignment'
  | string;

export type CBCPerformanceLevel =
  | 'EXCEEDING_EXPECTATIONS'
  | 'MEETING_EXPECTATIONS'
  | 'APPROACHING_EXPECTATIONS'
  | 'BELOW_EXPECTATIONS'
  | 'Exceeding Expectations (4)'
  | 'Meeting Expectations (3)'
  | 'Approaching Expectations (2)'
  | 'Below Expectations (1)'
  | string;

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  grade?: GradeLevel | string;
  gradeLevel?: GradeLevel | string;
  stream?: string;
  term: 'TERM_1' | 'TERM_2' | 'TERM_3' | 'Term 1' | 'Term 2' | 'Term 3' | string;
  academicYear: string;
  examType: ExamType;
  subjectName: string;
  score: number;
  maxScore: number;
  percentage: number;
  cbcPerformanceLevel?: CBCPerformanceLevel;
  traditionalGrade?: string;
  strandsMastered?: string[];
  remarks?: string;
  assessedBy?: string;
  createdAt?: string;
}

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  academicYear: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  gradeLevel: GradeLevel;
  stream?: string;
  subjectId: string;
  subjectName: string;
  maxScore: number;
  weightPercentage: number;
  examDate: string;
  status: 'Draft' | 'Marks Entered' | 'Approved' | 'Published';
  createdByTeacherId: string;
  createdByTeacherName: string;
}

export interface AssessmentResultItem {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  gradeLevel: GradeLevel;
  stream: string;
  subjectName: string;
  score: number;
  maxScore: number;
  percentage: number;
  cbcPerformanceLevel: 'Exceeding Expectations (4)' | 'Meeting Expectations (3)' | 'Approaching Expectations (2)' | 'Below Expectations (1)';
  traditionalGrade: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'E';
  remarks?: string;
  date: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  gradeLevel: GradeLevel;
  stream: string;
  academicYear: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  attendanceSummary: {
    daysPresent: number;
    daysAbsent: number;
    totalDays: number;
    percentage: number;
  };
  subjectResults: {
    subjectName: string;
    score: number;
    maxScore: number;
    percentage: number;
    grade: string;
    performanceLevel: string;
    teacherRemark: string;
  }[];
  competencies: {
    title: string;
    level: 'Exceeding Expectations' | 'Meeting Expectations' | 'Approaching Expectations' | 'Below Expectations';
  }[];
  values: {
    title: string;
    rating: 'Exemplary' | 'Good' | 'Satisfactory' | 'Needs Improvement';
  }[];
  totalMarks: number;
  maxPossibleMarks: number;
  averagePercentage: number;
  classPosition?: number;
  totalStudentsInStream?: number;
  classTeacherRemarks: string;
  headTeacherRemarks: string;
  openingDateNextTerm: string;
  issuedDate: string;
  status: 'Draft' | 'Approved' | 'Published';
}

export interface FeeCategory {
  id: string;
  name: string; // Tuition, Lunch, Transport, Activity, Exam & Assessment, Uniform, Development
  isOptional: boolean;
  description?: string;
}

export interface FeeStructureItem {
  id: string;
  name?: string;
  gradeLevel?: GradeLevel;
  grade?: GradeLevel;
  academicYear?: string;
  term?: 'Term 1' | 'Term 2' | 'Term 3' | 'TERM_1' | 'TERM_2' | 'TERM_3' | string;
  dueDate?: string;
  voteHeads?: { name: string; amount: number }[];
  items?: {
    categoryId: string;
    categoryName: string;
    amount: number;
  }[];
  totalAmount?: number;
  totalTermFee?: number;
}

export type FeeStructure = FeeStructureItem;

export interface StudentFeeAccount {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  gradeLevel: GradeLevel;
  stream: string;
  parentName?: string;
  parentPhone?: string;
  totalInvoiced: number;
  totalPaid: number;
  currentBalance: number;
  lastPaymentDate?: string;
}

export type PaymentMethod =
  | 'M-Pesa'
  | 'Bank'
  | 'Cash'
  | 'Cheque'
  | 'Other'
  | 'MPESA_PAYBILL'
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'CHEQUE'
  | string;

export interface FeePayment {
  id: string;
  receiptNumber?: string; // e.g. "UES-REC-2024-089"
  studentId: string;
  studentName: string;
  admissionNumber: string;
  gradeLevel?: GradeLevel;
  amountPaid?: number;
  amount?: number;
  paymentMethod: PaymentMethod;
  transactionReference: string; // e.g. M-Pesa code "QHD7298SKJ" or bank slip no
  paymentDate?: string;
  date?: string;
  payerName?: string;
  payerPhone?: string;
  status?: string;
  academicYear?: string;
  term?: 'Term 1' | 'Term 2' | 'Term 3' | 'TERM_1' | 'TERM_2' | 'TERM_3' | string;
  recordedByUserId?: string;
  recordedByUserName?: string;
  recordedBy?: string;
  receivedBy?: string;
  remarks?: string;
  feeItemAllocations?: {
    categoryName: string;
    amount: number;
  }[];
  notes?: string;
  createdAt?: string;
}

export interface TimetableEntry {
  id: string;
  gradeLevel: GradeLevel;
  stream: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // "08:00"
  endTime: string; // "08:45"
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomNumber?: string;
}

export interface Assignment {
  id: string;
  title: string;
  gradeLevel: GradeLevel;
  stream?: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  instructions: string;
  assignedDate: string;
  dueDate: string;
  maxScore: number;
  attachmentUrl?: string;
  attachmentName?: string;
  submissionCount?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  submissionDate: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  score?: number;
  feedback?: string;
  status: 'Submitted' | 'Graded' | 'Late';
}

export type TargetAudience =
  | 'ALL'
  | 'TEACHERS'
  | 'PARENTS'
  | 'STUDENTS'
  | 'SPECIFIC_GRADE'
  | 'All'
  | 'Teachers'
  | 'Parents'
  | 'Students'
  | 'Specific Grade'
  | string;

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: TargetAudience;
  targetGrade?: GradeLevel;
  priority: 'Normal' | 'High' | 'Urgent' | 'NORMAL' | 'HIGH' | 'URGENT' | string;
  publishedDate: string;
  authorName: string;
  authorRole: string;
  expiresAt?: string;
  isPinned?: boolean;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category: 'CBC Readers' | 'Textbooks' | 'Fiction' | 'Non-Fiction' | 'Science & Nature' | 'Reference' | 'Kiswahili Storybooks';
  applicableGrades?: GradeLevel[];
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
}

export interface BookLoan {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowerType: 'Student' | 'Teacher';
  borrowerId: string;
  borrowerName: string;
  admissionOrStaffNo: string;
  borrowedDate: string;
  dueDate: string;
  returnedDate?: string;
  status: 'Active' | 'Returned' | 'Overdue';
  fineAmount?: number;
}

export interface InventoryItem {
  id: string;
  name: string; // e.g. "A4 200pg Exercise Books", "School Blazer Size 28", "Footballs"
  category: 'Textbooks' | 'Exercise books' | 'Stationery' | 'Uniforms' | 'Furniture' | 'Electronics' | 'Sports equipment' | 'Cleaning supplies' | 'Laboratory' | 'Other';
  skuCode: string;
  quantityInStock: number;
  unit: 'Pieces' | 'Boxes' | 'Cartons' | 'Reams' | 'Pairs' | 'Sets';
  unitCost: number;
  reorderLevel: number;
  supplierName?: string;
  location?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Stock In' | 'Stock Out' | 'Adjustment' | 'Damaged';
  quantity: number;
  date: string;
  reason: string;
  authorizedBy: string;
  recipientDepartment?: string;
}

export interface TransportVehicle {
  id: string;
  registrationNumber: string; // e.g. "KDB 492X"
  vehicleType: 'Bus' | 'Mini-Bus' | 'Van';
  seatingCapacity: number;
  driverName: string;
  driverPhone: string;
  assistantName?: string;
  insuranceExpiry: string;
  speedGovernorCertExpiry?: string;
  status: 'Active' | 'Maintenance' | 'Out of Service';
}

export interface TransportRoute {
  id: string;
  name: string; // e.g. "Route A: Ruiru - Bypass - Membley"
  vehicleId: string;
  vehicleReg: string;
  driverName: string;
  driverPhone: string;
  stops: {
    stopName: string;
    pickupTime: string;
    dropoffTime: string;
    monthlyFee: number;
  }[];
  assignedStudentsCount: number;
}

export interface SchoolSettings {
  id: string;
  schoolName: string;
  motto: string;
  schoolType: string;
  curriculum?: string;
  moeRegNumber?: string;
  knecCode?: string;
  phone: string;
  email: string;
  website: string;
  postalAddress: string;
  physicalLocation: string;
  address?: string;
  currentAcademicYear: string;
  currentTerm: 'Term 1' | 'Term 2' | 'Term 3';
  termStartDate: string;
  termEndDate: string;
  nextTermStartDate: string;
  principalName: string;
  principalSignatureUrl?: string;
  schoolStampUrl?: string;
  logoUrl?: string;
  mpesaPaybillNumber?: string;
  mpesaAccountNumberRule?: string;
  bankAccountDetails?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // "STUDENT_CREATED", "PAYMENT_RECORDED", "RESULT_APPROVED", etc.
  targetCollection: string;
  recordId: string;
  details: string;
  timestamp: string;
}

// Roles & Permissions Matrix
export type PermissionKey =
  | 'students:view'
  | 'students:create'
  | 'students:edit'
  | 'students:delete'
  | 'admissions:manage'
  | 'attendance:view'
  | 'attendance:record'
  | 'academics:view'
  | 'academics:manage'
  | 'exams:view'
  | 'exams:enter_marks'
  | 'exams:publish'
  | 'finance:view'
  | 'finance:collect'
  | 'finance:manage_structures'
  | 'staff:view'
  | 'staff:create'
  | 'staff:edit'
  | 'staff:suspend'
  | 'staff:delete'
  | 'facilities:manage'
  | 'announcements:manage'
  | 'settings:manage'
  | 'website:manage'
  | 'audit:view';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'Students' | 'Academics & Exams' | 'Finance' | 'Staff & HR' | 'Facilities' | 'System & CMS';
}

export interface RolePermissionConfig {
  role: UserRole;
  roleTitle: string;
  description: string;
  permissions: PermissionKey[];
  isCustom?: boolean;
  updatedAt?: string;
}

// Public Website Settings (Controlled by Admin CMS)
export interface WebsiteFacility {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  featured?: boolean;
}

export interface WebsiteProgram {
  id: string;
  title: string;
  ageGroup: string;
  level: string;
  description: string;
  features: string[];
  imageUrl: string;
}

export interface WebsiteTestimonial {
  id: string;
  author: string;
  role: string; // e.g. "Parent of Grade 5 Learner"
  content: string;
  rating: number;
  avatarUrl?: string;
  date?: string;
}

export interface WebsiteHeroSlide {
  id: string;
  tag: string;
  headline: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryText?: string;
  secondaryLink?: string;
  bgImage: string;
  badgeColor?: string;
  order?: number;
  active?: boolean;
}

export interface WebsiteNewsArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  author?: string;
  published?: boolean;
}

export interface WebsiteSettings {
  id: string;
  // Hero & Brand
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroCtaText: string;
  heroSecondaryCta: string;
  tagline?: string;
  heroHeadline?: string;
  heroBackgroundImage?: string;
  principalWelcome?: string;
  newsArticles?: WebsiteNewsArticle[];

  // Dynamic Hero Carousel Slides
  heroSlides?: WebsiteHeroSlide[];
  
  // Admissions Banner
  admissionsOpen: boolean;
  admissionsBannerText: string;
  admissionsDeadline: string;
  admissionsIntakeTerm: string;

  // About School
  aboutTitle: string;
  aboutStory: string;
  aboutImageUrl: string;
  establishedYear: string;
  accreditationBadge: string;

  // Principal Welcome
  principalName: string;
  principalTitle: string;
  principalMessage: string;
  principalPhotoUrl: string;
  principalQualifications: string;

  // Vision & Values
  vision: string;
  mission: string;
  coreValues: string[];

  // Quick Stats
  stats: {
    label: string;
    value: string;
    sublabel: string;
  }[];

  // Academic Programs
  programs: WebsiteProgram[];

  // Facilities Showcase
  facilities: WebsiteFacility[];

  // Testimonials
  testimonials: WebsiteTestimonial[];

  // News & Events
  news: WebsiteNewsArticle[];

  // Social & Contact
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
  };
  contact: {
    phone: string;
    emergencyPhone?: string;
    email: string;
    admissionsEmail?: string;
    address: string;
    officeHours?: string;
    mapLocationQuery?: string;
  };

  updatedAt?: string;
}

