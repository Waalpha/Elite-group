import { doc, writeBatch, collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  SchoolSettings,
  SchoolClass,
  Subject,
  Teacher,
  Student,
  FeeStructureItem,
  FeePayment,
  Assessment,
  AssessmentResultItem,
  ReportCard,
  LibraryBook,
  InventoryItem,
  TransportVehicle,
  TransportRoute,
  Announcement,
  TimetableEntry,
  UserProfile,
  NonTeachingStaff,
  AdmissionApplication,
} from '../types';

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  id: 'main-settings',
  schoolName: 'UWEZO ELITE SCHOOL',
  motto: 'Excellence in Character, Innovation and Leadership',
  schoolType: 'Day & Boarding Private Primary & Junior Secondary School (CBC/CBE)',
  phone: '+254 722 000 111 / +254 733 222 333',
  email: 'info@uwezoeliteschool.ac.ke',
  website: 'https://uwezoeliteschool.ac.ke',
  postalAddress: 'P.O. Box 45210 - 00100, Nairobi, Kenya',
  physicalLocation: 'Uwezo Academic Boulevard, Off Eastern Bypass, Ruiru/Membley, Kenya',
  currentAcademicYear: '2025/2026',
  currentTerm: 'Term 1',
  termStartDate: '2026-01-08',
  termEndDate: '2026-04-10',
  nextTermStartDate: '2026-05-04',
  principalName: 'Dr. Josephat Mwangi, PhD',
  principalSignatureUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=120&auto=format&fit=crop&q=60',
  schoolStampUrl: '',
  logoUrl: '',
  mpesaPaybillNumber: '522522',
  mpesaAccountNumberRule: 'UES-[AdmissionNumber] (e.g. UES-2024-0101)',
  bankAccountDetails: 'Kenya Commercial Bank (KCB) | Acc: 1290887766 | Branch: Ruiru',
};

export const SEED_USERS: UserProfile[] = [
  {
    id: 'user-super-admin',
    username: 'superadmin',
    password: 'Admin@123',
    email: 'admin@uwezoeliteschool.ac.ke',
    displayName: 'Dr. Josephat Mwangi',
    role: 'SUPER_ADMIN',
    phoneNumber: '+254722111001',
    status: 'active',
  },
  {
    id: 'user-principal',
    username: 'principal',
    password: 'Principal@123',
    email: 'principal@uwezoeliteschool.ac.ke',
    displayName: 'Madam Elizabeth Wanjiru',
    role: 'PRINCIPAL',
    phoneNumber: '+254722111002',
    status: 'active',
  },
  {
    id: 'user-accountant',
    username: 'accountant',
    password: 'Accounts@123',
    email: 'accounts@uwezoeliteschool.ac.ke',
    displayName: 'Peter Otieno (CPA-K)',
    role: 'ACCOUNTANT',
    phoneNumber: '+254722111003',
    status: 'active',
  },
  {
    id: 'user-teacher-mwale',
    username: 'teacher.mwale',
    password: 'Teacher@123',
    email: 'teacher.mwale@uwezoeliteschool.ac.ke',
    displayName: 'Tr. David Mwale',
    role: 'TEACHER',
    associatedId: 'teacher-001',
    phoneNumber: '+254722111004',
    status: 'active',
  },
  {
    id: 'user-parent-kariuki',
    username: 'parent.kariuki',
    password: 'Parent@123',
    email: 'parent.kariuki@gmail.com',
    displayName: 'Eng. Francis Kariuki',
    role: 'PARENT',
    associatedId: 'parent-001',
    phoneNumber: '+254722998877',
    status: 'active',
  },
  {
    id: 'user-student-brian',
    username: 'student.brian',
    password: 'Student@123',
    email: 'brian.kariuki@students.uwezo.ac.ke',
    displayName: 'Brian Mwangi Kariuki',
    role: 'STUDENT',
    associatedId: 'student-001',
    status: 'active',
  },
  {
    id: 'user-registrar',
    username: 'registrar',
    password: 'Registrar@123',
    email: 'registrar@uwezoeliteschool.ac.ke',
    displayName: 'Agnes Muthoni',
    role: 'REGISTRAR',
    phoneNumber: '+254722111005',
    status: 'active',
  },
  {
    id: 'user-librarian',
    username: 'librarian',
    password: 'Library@123',
    email: 'library@uwezoeliteschool.ac.ke',
    displayName: 'Grace Achieng',
    role: 'LIBRARIAN',
    phoneNumber: '+254722111006',
    status: 'active',
  },
  {
    id: 'user-transport',
    username: 'transport',
    password: 'Transport@123',
    email: 'transport@uwezoeliteschool.ac.ke',
    displayName: 'Samuel Kiptoo',
    role: 'TRANSPORT_MANAGER',
    phoneNumber: '+254722111007',
    status: 'active',
  },
  {
    id: 'user-store',
    username: 'storekeeper',
    password: 'Store@123',
    email: 'store@uwezoeliteschool.ac.ke',
    displayName: 'Morris Mutua',
    role: 'STOREKEEPER',
    phoneNumber: '+254722111008',
    status: 'active',
  },
];

export async function ensureSeedUsersExist(): Promise<void> {
  try {
    const usersCol = collection(db, 'users');
    const existingSnap = await getDocs(usersCol);
    const existingIds = new Set(existingSnap.docs.map((d) => d.id));
    const existingUsernames = new Set(
      existingSnap.docs
        .map((d) => (d.data() as UserProfile).username?.toLowerCase())
        .filter(Boolean)
    );

    const batch = writeBatch(db);
    let needsCommit = false;

    for (const u of SEED_USERS) {
      if (!existingIds.has(u.id) && (!u.username || !existingUsernames.has(u.username.toLowerCase()))) {
        const uRef = doc(db, 'users', u.id);
        batch.set(uRef, u);
        needsCommit = true;
      }
    }

    if (needsCommit) {
      await batch.commit();
      console.log('Seeded missing default user accounts into Firestore.');
    }
  } catch (err) {
    console.warn('Could not auto-seed users:', err);
  }
}

export async function checkAndSeedInitialData(force = false): Promise<boolean> {
  try {
    // Always ensure user accounts exist
    await ensureSeedUsersExist();

    const studentsCol = collection(db, 'students');
    const existingSnap = await getDocs(query(studentsCol, limit(1)));
    if (!existingSnap.empty && !force) {
      console.log('Database already has data. Skipping automatic full seed.');
      return false;
    }

    console.log('Seeding initial Uwezo Elite School dataset to Firestore...');

    const batch = writeBatch(db);

    // 1. School Settings
    const settingsRef = doc(db, 'schoolSettings', 'main-settings');
    batch.set(settingsRef, INITIAL_SCHOOL_SETTINGS);

    // 2. Users
    for (const u of SEED_USERS) {
      const userRef = doc(db, 'users', u.id);
      batch.set(userRef, u);
    }

    // 3. Classes (Playgroup -> Grade 9)
    const gradeLevels: Array<{ name: string; level: any; room: string; teacher: string }> = [
      { name: 'Playgroup', level: 'Playgroup', room: 'Block A - 01', teacher: 'Tr. Lucy Nduta' },
      { name: 'PP1', level: 'PP1', room: 'Block A - 02', teacher: 'Tr. Mary Wambui' },
      { name: 'PP2', level: 'PP2', room: 'Block A - 03', teacher: 'Tr. Joyce Chebet' },
      { name: 'Grade 1', level: 'Grade 1', room: 'Block B - 101', teacher: 'Tr. Sarah Nekesa' },
      { name: 'Grade 2', level: 'Grade 2', room: 'Block B - 102', teacher: 'Tr. Anne Njeri' },
      { name: 'Grade 3', level: 'Grade 3', room: 'Block B - 103', teacher: 'Tr. John Mutua' },
      { name: 'Grade 4', level: 'Grade 4', room: 'Block C - 201', teacher: 'Tr. David Mwale' },
      { name: 'Grade 5', level: 'Grade 5', room: 'Block C - 202', teacher: 'Tr. Stephen Kiprono' },
      { name: 'Grade 6', level: 'Grade 6', room: 'Block C - 203', teacher: 'Tr. Catherine Omondi' },
      { name: 'Grade 7 (JSS 1)', level: 'Grade 7', room: 'JSS Wing - 301', teacher: 'Tr. Kennedy Odhiambo' },
      { name: 'Grade 8 (JSS 2)', level: 'Grade 8', room: 'JSS Wing - 302', teacher: 'Tr. Victor Korir' },
      { name: 'Grade 9 (JSS 3)', level: 'Grade 9', room: 'JSS Wing - 303', teacher: 'Tr. Paul Macharia' },
    ];

    for (const g of gradeLevels) {
      const classId = `class-${g.level.toLowerCase().replace(/\s+/g, '-')}`;
      const classRef = doc(db, 'classes', classId);
      batch.set(classRef, {
        id: classId,
        name: g.name,
        level: g.level,
        streamIds: ['East', 'West'],
        classTeacherName: g.teacher,
        capacity: 40,
        roomNumber: g.room,
        academicYear: '2025/2026',
      });
    }

    // 4. Kenyan CBC Subjects
    const subjectsData: Array<Partial<Subject>> = [
      { id: 'sub-eng', code: 'ENG', name: 'English Language Activities', category: 'Languages', isCore: true, applicableGrades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] },
      { id: 'sub-kis', code: 'KIS', name: 'Kiswahili na Insha / Lugha', category: 'Languages', isCore: true, applicableGrades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] },
      { id: 'sub-mth', code: 'MTH', name: 'Mathematics / Mathematical Activities', category: 'STEM', isCore: true, applicableGrades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] },
      { id: 'sub-sci', code: 'SCI', name: 'Science & Technology / Integrated Science', category: 'STEM', isCore: true, applicableGrades: ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] },
      { id: 'sub-soc', code: 'SST', name: 'Social Studies & Citizenship', category: 'Humanities', isCore: true, applicableGrades: ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] },
      { id: 'sub-cre', code: 'CRE', name: 'Christian Religious Education (CRE)', category: 'Humanities', isCore: true, applicableGrades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] },
      { id: 'sub-art', code: 'ART', name: 'Creative Arts & Sports', category: 'Creative & Technical', isCore: true, applicableGrades: ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] },
      { id: 'sub-agr', code: 'AGR', name: 'Agriculture & Nutrition', category: 'Pre-Vocational', isCore: true, applicableGrades: ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] },
      { id: 'sub-pts', code: 'PTS', name: 'Pre-Technical Studies & Business', category: 'Pre-Vocational', isCore: true, applicableGrades: ['Grade 7', 'Grade 8', 'Grade 9'] },
      { id: 'sub-cmp', code: 'CMP', name: 'Computer Studies / Digital Literacy', category: 'STEM', isCore: true, applicableGrades: ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] },
      { id: 'sub-ey-lang', code: 'EY-LANG', name: 'Language & Literacy Activities', category: 'Early Years', isCore: true, applicableGrades: ['Playgroup', 'PP1', 'PP2'] },
      { id: 'sub-ey-math', code: 'EY-MTH', name: 'Mathematical Concepts Activities', category: 'Early Years', isCore: true, applicableGrades: ['Playgroup', 'PP1', 'PP2'] },
      { id: 'sub-ey-env', code: 'EY-ENV', name: 'Environmental & Psychomotor Activities', category: 'Early Years', isCore: true, applicableGrades: ['Playgroup', 'PP1', 'PP2'] },
    ];

    for (const sub of subjectsData) {
      const subRef = doc(db, 'subjects', sub.id!);
      batch.set(subRef, sub);
    }

    // 5. Teachers
    const teachersData: Teacher[] = [
      {
        id: 'teacher-001',
        staffId: 'UES-T-001',
        firstName: 'David',
        lastName: 'Mwale',
        fullName: 'David Mwale',
        gender: 'Male',
        email: 'david.mwale@uwezoeliteschool.ac.ke',
        phone: '+254 722 345 678',
        tscNumber: 'TSC/748392',
        department: 'Science & STEM',
        assignedClasses: ['Grade 6', 'Grade 7', 'Grade 8'],
        assignedSubjects: ['Science & Technology / Integrated Science', 'Mathematics / Mathematical Activities'],
        qualification: 'B.Ed Science (Physics/Maths) - Kenyatta University',
        employmentDate: '2021-01-05',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
        status: 'Active',
      },
      {
        id: 'teacher-002',
        staffId: 'UES-T-002',
        firstName: 'Catherine',
        lastName: 'Omondi',
        fullName: 'Catherine Omondi',
        gender: 'Female',
        email: 'catherine.omondi@uwezoeliteschool.ac.ke',
        phone: '+254 733 456 789',
        tscNumber: 'TSC/629104',
        department: 'Languages',
        assignedClasses: ['Grade 5', 'Grade 6', 'Grade 9'],
        assignedSubjects: ['English Language Activities', 'Creative Arts & Sports'],
        qualification: 'B.Ed Arts (English/Literature) - University of Nairobi',
        employmentDate: '2020-05-12',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60',
        status: 'Active',
      },
      {
        id: 'teacher-003',
        staffId: 'UES-T-003',
        firstName: 'Kennedy',
        lastName: 'Odhiambo',
        fullName: 'Kennedy Odhiambo',
        gender: 'Male',
        email: 'kennedy.odhiambo@uwezoeliteschool.ac.ke',
        phone: '+254 720 987 654',
        tscNumber: 'TSC/891230',
        department: 'Junior Secondary (JSS)',
        assignedClasses: ['Grade 7', 'Grade 8', 'Grade 9'],
        assignedSubjects: ['Pre-Technical Studies & Business', 'Computer Studies / Digital Literacy'],
        qualification: 'B.Sc Computer Science with Education - JKUAT',
        employmentDate: '2022-02-01',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
        status: 'Active',
      },
      {
        id: 'teacher-004',
        staffId: 'UES-T-004',
        firstName: 'Lucy',
        lastName: 'Nduta',
        fullName: 'Lucy Nduta',
        gender: 'Female',
        email: 'lucy.nduta@uwezoeliteschool.ac.ke',
        phone: '+254 711 234 567',
        tscNumber: 'TSC/912834',
        department: 'Early Childhood Education (ECDE)',
        assignedClasses: ['Playgroup', 'PP1', 'PP2'],
        assignedSubjects: ['Language & Literacy Activities', 'Environmental & Psychomotor Activities'],
        qualification: 'Diploma in Early Childhood Development - Mount Kenya Univ',
        employmentDate: '2019-09-01',
        photoUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=60',
        status: 'Active',
      },
    ];

    for (const t of teachersData) {
      const tRef = doc(db, 'teachers', t.id);
      batch.set(tRef, t);
    }

    // 6. Students
    const studentsData: Student[] = [
      {
        id: 'student-001',
        admissionNumber: 'UES-2024-0101',
        firstName: 'Brian',
        middleName: 'Mwangi',
        lastName: 'Kariuki',
        fullName: 'Brian Mwangi Kariuki',
        dateOfBirth: '2013-05-14',
        gender: 'Male',
        currentClass: 'Grade 6',
        stream: 'East',
        admissionDate: '2024-01-08',
        birthCertificateNo: 'BC/2013/89201',
        upiNemisNo: 'UPI-9847291',
        previousSchool: 'Juja Preparatory School',
        medicalConditions: 'Mild Asthma (inhaler available)',
        bloodGroup: 'O+',
        emergencyContactName: 'Eng. Francis Kariuki (Father)',
        emergencyContactPhone: '+254 722 998 877',
        emergencyContactRelation: 'Father',
        parentId: 'parent-001',
        parentName: 'Eng. Francis Kariuki',
        parentPhone: '+254 722 998 877',
        parentEmail: 'parent.kariuki@gmail.com',
        residentialAddress: 'Membley Estate, Court 4, House 12',
        status: 'Active',
        academicYear: '2025/2026',
        totalFeesBilled: 48500,
        totalFeesPaid: 48500,
        feeBalance: 0,
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=60',
      },
      {
        id: 'student-002',
        admissionNumber: 'UES-2024-0102',
        firstName: 'Faith',
        middleName: 'Nekesa',
        lastName: 'Wanyonyi',
        fullName: 'Faith Nekesa Wanyonyi',
        dateOfBirth: '2012-09-20',
        gender: 'Female',
        currentClass: 'Grade 7',
        stream: 'West',
        admissionDate: '2024-01-08',
        birthCertificateNo: 'BC/2012/48190',
        upiNemisNo: 'UPI-1092837',
        previousSchool: 'Riara Springs Academy',
        bloodGroup: 'A+',
        emergencyContactName: 'Dr. Pamela Wanyonyi',
        emergencyContactPhone: '+254 733 881 122',
        emergencyContactRelation: 'Mother',
        parentId: 'parent-002',
        parentName: 'Dr. Pamela Wanyonyi',
        parentPhone: '+254 733 881 122',
        parentEmail: 'pamela.wanyonyi@gmail.com',
        residentialAddress: 'Ruiru Rainbow Gardens, Block D',
        status: 'Active',
        academicYear: '2025/2026',
        totalFeesBilled: 54000,
        totalFeesPaid: 35000,
        feeBalance: 19000,
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60',
      },
      {
        id: 'student-003',
        admissionNumber: 'UES-2024-0103',
        firstName: 'Kevin',
        middleName: 'Kimani',
        lastName: 'Njenga',
        fullName: 'Kevin Kimani Njenga',
        dateOfBirth: '2018-03-11',
        gender: 'Male',
        currentClass: 'Grade 2',
        stream: 'East',
        admissionDate: '2024-01-08',
        birthCertificateNo: 'BC/2018/12093',
        emergencyContactName: 'Jane Wambui Njenga',
        emergencyContactPhone: '+254 711 665 544',
        emergencyContactRelation: 'Mother',
        parentId: 'parent-003',
        parentName: 'Jane Wambui Njenga',
        parentPhone: '+254 711 665 544',
        residentialAddress: 'Kahawa Sukari, 4th South Ave',
        status: 'Active',
        academicYear: '2025/2026',
        totalFeesBilled: 42000,
        totalFeesPaid: 42000,
        feeBalance: 0,
        photoUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=60',
      },
      {
        id: 'student-004',
        admissionNumber: 'UES-2024-0104',
        firstName: 'Joy',
        middleName: 'Cherono',
        lastName: 'Kiprotich',
        fullName: 'Joy Cherono Kiprotich',
        dateOfBirth: '2011-11-04',
        gender: 'Female',
        currentClass: 'Grade 8',
        stream: 'East',
        admissionDate: '2024-01-08',
        birthCertificateNo: 'BC/2011/98124',
        emergencyContactName: 'Major Silas Kiprotich',
        emergencyContactPhone: '+254 722 443 322',
        emergencyContactRelation: 'Father',
        parentId: 'parent-004',
        parentName: 'Major Silas Kiprotich',
        parentPhone: '+254 722 443 322',
        residentialAddress: 'Kenyatta Road Estate',
        status: 'Active',
        academicYear: '2025/2026',
        totalFeesBilled: 56000,
        totalFeesPaid: 40000,
        feeBalance: 16000,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
      },
      {
        id: 'student-005',
        admissionNumber: 'UES-2024-0105',
        firstName: 'Ethan',
        middleName: 'Baraka',
        lastName: 'Oduor',
        fullName: 'Ethan Baraka Oduor',
        dateOfBirth: '2021-02-18',
        gender: 'Male',
        currentClass: 'PP1',
        stream: 'East',
        admissionDate: '2025-01-07',
        birthCertificateNo: 'BC/2021/77881',
        emergencyContactName: 'Mercy Auma Oduor',
        emergencyContactPhone: '+254 721 112 233',
        emergencyContactRelation: 'Mother',
        parentId: 'parent-005',
        parentName: 'Mercy Auma Oduor',
        parentPhone: '+254 721 112 233',
        residentialAddress: 'Mirema Drive, Roysambu',
        status: 'Active',
        academicYear: '2025/2026',
        totalFeesBilled: 38000,
        totalFeesPaid: 38000,
        feeBalance: 0,
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60',
      },
      {
        id: 'student-006',
        admissionNumber: 'UES-2024-0106',
        firstName: 'Trevor',
        middleName: 'Kibet',
        lastName: 'Ruto',
        fullName: 'Trevor Kibet Ruto',
        dateOfBirth: '2010-06-15',
        gender: 'Male',
        currentClass: 'Grade 9',
        stream: 'East',
        admissionDate: '2023-01-09',
        birthCertificateNo: 'BC/2010/55662',
        upiNemisNo: 'UPI-7788990',
        bloodGroup: 'B+',
        emergencyContactName: 'Hon. Philip Ruto',
        emergencyContactPhone: '+254 720 334 455',
        emergencyContactRelation: 'Father',
        parentId: 'parent-006',
        parentName: 'Hon. Philip Ruto',
        parentPhone: '+254 720 334 455',
        residentialAddress: 'Garden Estate, Oak Lane',
        status: 'Active',
        academicYear: '2025/2026',
        totalFeesBilled: 58000,
        totalFeesPaid: 58000,
        feeBalance: 0,
        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60',
      },
    ];

    for (const s of studentsData) {
      const sRef = doc(db, 'students', s.id);
      batch.set(sRef, s);
    }

    // 7. Fee Structures
    const feeStructures: FeeStructureItem[] = [
      {
        id: 'fee-playgroup',
        gradeLevel: 'Playgroup',
        academicYear: '2025/2026',
        term: 'Term 1',
        totalTermFee: 38000,
        items: [
          { categoryId: 'cat-tuition', categoryName: 'Tuition Fee', amount: 22000 },
          { categoryId: 'cat-lunch', categoryName: 'Hot Midday Meals & Snacks', amount: 8500 },
          { categoryId: 'cat-act', categoryName: 'Psychomotor & Play Activities', amount: 4500 },
          { categoryId: 'cat-dev', categoryName: 'School Development Fund', amount: 3000 },
        ],
      },
      {
        id: 'fee-grade-6',
        gradeLevel: 'Grade 6',
        academicYear: '2025/2026',
        term: 'Term 1',
        totalTermFee: 48500,
        items: [
          { categoryId: 'cat-tuition', categoryName: 'Tuition Fee', amount: 28000 },
          { categoryId: 'cat-lunch', categoryName: 'Hot Midday Meals', amount: 9500 },
          { categoryId: 'cat-act', categoryName: 'Co-Curricular & Sports', amount: 4000 },
          { categoryId: 'cat-exam', categoryName: 'KPSEA Prep & CBC Assessments', amount: 4000 },
          { categoryId: 'cat-dev', categoryName: 'ICT & Science Lab Levy', amount: 3000 },
        ],
      },
      {
        id: 'fee-grade-7-jss',
        gradeLevel: 'Grade 7',
        academicYear: '2025/2026',
        term: 'Term 1',
        totalTermFee: 54000,
        items: [
          { categoryId: 'cat-tuition', categoryName: 'JSS Tuition Fee', amount: 32000 },
          { categoryId: 'cat-lunch', categoryName: 'Hot Meals', amount: 9500 },
          { categoryId: 'cat-lab', categoryName: 'Integrated Science & Tech Lab', amount: 5500 },
          { categoryId: 'cat-act', categoryName: 'Clubs & Sports', amount: 4000 },
          { categoryId: 'cat-exam', categoryName: 'Continuous Assessments (CBE)', amount: 3000 },
        ],
      },
    ];

    for (const fs of feeStructures) {
      const fsRef = doc(db, 'feeStructures', fs.id);
      batch.set(fsRef, fs);
    }

    // 8. Payments
    const paymentsData: FeePayment[] = [
      {
        id: 'pay-001',
        receiptNumber: 'UES-REC-2025-0012',
        studentId: 'student-001',
        studentName: 'Brian Mwangi Kariuki',
        admissionNumber: 'UES-2024-0101',
        gradeLevel: 'Grade 6',
        amountPaid: 48500,
        paymentMethod: 'M-Pesa',
        transactionReference: 'SKE8941094',
        paymentDate: '2026-01-08',
        academicYear: '2025/2026',
        term: 'Term 1',
        recordedByUserId: 'user-accountant',
        recordedByUserName: 'Peter Otieno (CPA-K)',
        createdAt: '2026-01-08T09:30:00Z',
        notes: 'Full Term 1 Fees cleared via M-Pesa Paybill 522522',
      },
      {
        id: 'pay-002',
        receiptNumber: 'UES-REC-2025-0019',
        studentId: 'student-002',
        studentName: 'Faith Nekesa Wanyonyi',
        admissionNumber: 'UES-2024-0102',
        gradeLevel: 'Grade 7',
        amountPaid: 35000,
        paymentMethod: 'Bank',
        transactionReference: 'KCB-DEP-77491',
        paymentDate: '2026-01-09',
        academicYear: '2025/2026',
        term: 'Term 1',
        recordedByUserId: 'user-accountant',
        recordedByUserName: 'Peter Otieno (CPA-K)',
        createdAt: '2026-01-09T14:15:00Z',
        notes: 'Part payment Term 1 fees. Balance KES 19,000 to be cleared before mid-term.',
      },
    ];

    for (const p of paymentsData) {
      const pRef = doc(db, 'payments', p.id);
      batch.set(pRef, p);
    }

    // 9. Report Card for Brian Mwangi Kariuki
    const sampleReportCard: ReportCard = {
      id: 'report-brian-term1-2026',
      studentId: 'student-001',
      studentName: 'Brian Mwangi Kariuki',
      admissionNumber: 'UES-2024-0101',
      gradeLevel: 'Grade 6',
      stream: 'East',
      academicYear: '2025/2026',
      term: 'Term 1',
      attendanceSummary: {
        daysPresent: 64,
        daysAbsent: 1,
        totalDays: 65,
        percentage: 98.5,
      },
      subjectResults: [
        { subjectName: 'English Language Activities', score: 86, maxScore: 100, percentage: 86, grade: 'A', performanceLevel: 'Exceeding Expectations (4)', teacherRemark: 'Outstanding creative writing and comprehension skills.' },
        { subjectName: 'Kiswahili na Lugha', score: 82, maxScore: 100, percentage: 82, grade: 'A-', performanceLevel: 'Exceeding Expectations (4)', teacherRemark: 'Umahiri wa hali ya juu katika Insha na Sarufi.' },
        { subjectName: 'Mathematics', score: 91, maxScore: 100, percentage: 91, grade: 'A', performanceLevel: 'Exceeding Expectations (4)', teacherRemark: 'Exceptional problem-solving and mathematical reasoning.' },
        { subjectName: 'Science & Technology', score: 88, maxScore: 100, percentage: 88, grade: 'A', performanceLevel: 'Exceeding Expectations (4)', teacherRemark: 'Demonstrates deep scientific curiosity in practical investigations.' },
        { subjectName: 'Social Studies & CRE', score: 84, maxScore: 100, percentage: 84, grade: 'A-', performanceLevel: 'Exceeding Expectations (4)', teacherRemark: 'Good grasp of civic responsibilities and community values.' },
        { subjectName: 'Creative Arts & Sports', score: 89, maxScore: 100, percentage: 89, grade: 'A', performanceLevel: 'Exceeding Expectations (4)', teacherRemark: 'Talented in visual artwork and active in athletics.' },
        { subjectName: 'Agriculture & Nutrition', score: 85, maxScore: 100, percentage: 85, grade: 'A', performanceLevel: 'Exceeding Expectations (4)', teacherRemark: 'Active participant in school farming plots and projects.' },
      ],
      competencies: [
        { title: 'Communication and Collaboration', level: 'Exceeding Expectations' },
        { title: 'Critical Thinking & Problem Solving', level: 'Exceeding Expectations' },
        { title: 'Creativity and Imagination', level: 'Exceeding Expectations' },
        { title: 'Digital Literacy', level: 'Meeting Expectations' },
        { title: 'Learning to Learn & Self-Efficacy', level: 'Exceeding Expectations' },
      ],
      values: [
        { title: 'Respect and Integrity', rating: 'Exemplary' },
        { title: 'Responsibility and Diligence', rating: 'Exemplary' },
        { title: 'Unity and Patriotism', rating: 'Good' },
        { title: 'Peace and Harmony', rating: 'Exemplary' },
      ],
      totalMarks: 605,
      maxPossibleMarks: 700,
      averagePercentage: 86.4,
      classPosition: 2,
      totalStudentsInStream: 38,
      classTeacherRemarks: 'Brian is an exemplary, disciplined, and intellectually gifted learner. Consistently participates in class and assists peers.',
      headTeacherRemarks: 'Outstanding term performance. Keep up the brilliant standard of excellence and leadership.',
      openingDateNextTerm: '2026-05-04',
      issuedDate: '2026-04-10',
      status: 'Published',
    };

    const repRef = doc(db, 'reportCards', sampleReportCard.id);
    batch.set(repRef, sampleReportCard);

    // 10. Announcements
    const announcementsData: Announcement[] = [
      {
        id: 'ann-001',
        title: 'Mid-Term Break & Academic Progress Consultation Day',
        content: 'Dear Uwezo Elite School Community, our Term 1 Mid-Term Consultation Day is scheduled for Friday from 8:00 AM to 3:30 PM. All parents are warmly invited to review learner assessment portfolios with respective class teachers.',
        targetAudience: 'All',
        priority: 'High',
        publishedDate: '2026-02-15',
        authorName: 'Dr. Josephat Mwangi',
        authorRole: 'Principal',
        isPinned: true,
      },
      {
        id: 'ann-002',
        title: 'Junior Secondary School (JSS) Science Fair & Robotics Club',
        content: 'Registration is now open for the Annual Inter-School JSS Science & Innovation Exhibition. Learners in Grades 7-9 should submit their project abstracts to Tr. Kennedy Odhiambo.',
        targetAudience: 'Specific Grade',
        targetGrade: 'Grade 7',
        priority: 'Normal',
        publishedDate: '2026-02-18',
        authorName: 'Tr. Kennedy Odhiambo',
        authorRole: 'Head of STEM',
      },
    ];

    for (const a of announcementsData) {
      const aRef = doc(db, 'announcements', a.id);
      batch.set(aRef, a);
    }

    // 11. Library Books
    const libraryBooks: LibraryBook[] = [
      { id: 'book-001', title: 'Longhorn CBC Science & Tech Grade 6', author: 'Dr. F. W. Kariuki', isbn: '978-9966-56-112-8', category: 'Textbooks', applicableGrades: ['Grade 6'], shelfLocation: 'Section B-3', totalCopies: 45, availableCopies: 41, borrowedCopies: 4 },
      { id: 'book-002', title: 'Kiswahili Sanifu Gredi ya Saba (JSS)', author: 'Wallah Bin Wallah', isbn: '978-9966-22-491-0', category: 'Textbooks', applicableGrades: ['Grade 7'], shelfLocation: 'Section A-1', totalCopies: 50, availableCopies: 48, borrowedCopies: 2 },
      { id: 'book-003', title: 'The River Between - Young Readers Ed.', author: 'Ngũgĩ wa Thiong\'o', isbn: '978-0435-905-484', category: 'Fiction', applicableGrades: ['Grade 8', 'Grade 9'], shelfLocation: 'Section F-4', totalCopies: 30, availableCopies: 26, borrowedCopies: 4 },
      { id: 'book-004', title: 'Nelson Thornes Primary Mathematics Level 5', author: 'Linda Bostock', isbn: '978-1408-504-221', category: 'CBC Readers', applicableGrades: ['Grade 5'], shelfLocation: 'Section M-2', totalCopies: 40, availableCopies: 39, borrowedCopies: 1 },
    ];

    for (const b of libraryBooks) {
      const bRef = doc(db, 'books', b.id);
      batch.set(bRef, b);
    }

    // 12. School Transport
    const transportVehicles: TransportVehicle[] = [
      { id: 'veh-001', registrationNumber: 'KDC 341U', vehicleType: 'Bus', seatingCapacity: 52, driverName: 'John Kamau Karanja', driverPhone: '+254 722 889 900', assistantName: 'Mama Brenda', insuranceExpiry: '2026-11-30', status: 'Active' },
      { id: 'veh-002', registrationNumber: 'KDB 782P', vehicleType: 'Mini-Bus', seatingCapacity: 33, driverName: 'Hassan Omar Ali', driverPhone: '+254 733 991 122', assistantName: 'Mary Atieno', insuranceExpiry: '2026-10-15', status: 'Active' },
    ];

    for (const v of transportVehicles) {
      const vRef = doc(db, 'vehicles', v.id);
      batch.set(vRef, v);
    }

    const transportRoutes: TransportRoute[] = [
      {
        id: 'route-001',
        name: 'Route 1: Membley - Ruiru Bypass - Toll Station',
        vehicleId: 'veh-001',
        vehicleReg: 'KDC 341U',
        driverName: 'John Kamau Karanja',
        driverPhone: '+254 722 889 900',
        assignedStudentsCount: 42,
        stops: [
          { stopName: 'Membley Court 4 Gate', pickupTime: '06:30 AM', dropoffTime: '04:45 PM', monthlyFee: 4500 },
          { stopName: 'Eastern Bypass Delta', pickupTime: '06:45 AM', dropoffTime: '04:30 PM', monthlyFee: 4500 },
          { stopName: 'Ruiru Toll Estate', pickupTime: '07:05 AM', dropoffTime: '04:15 PM', monthlyFee: 5000 },
        ],
      },
      {
        id: 'route-002',
        name: 'Route 2: Kahawa Sukari - Mirema - Zimmerman',
        vehicleId: 'veh-002',
        vehicleReg: 'KDB 782P',
        driverName: 'Hassan Omar Ali',
        driverPhone: '+254 733 991 122',
        assignedStudentsCount: 28,
        stops: [
          { stopName: 'Kahawa Sukari Roundabout', pickupTime: '06:35 AM', dropoffTime: '04:40 PM', monthlyFee: 4800 },
          { stopName: 'Mirema Drive Shell', pickupTime: '06:50 AM', dropoffTime: '04:25 PM', monthlyFee: 5200 },
        ],
      },
    ];

    for (const r of transportRoutes) {
      const rRef = doc(db, 'routes', r.id);
      batch.set(rRef, r);
    }

    // 13. Inventory
    const inventoryItems: InventoryItem[] = [
      { id: 'inv-001', name: 'A4 200 Pages Ruled Exercise Books', category: 'Exercise books', skuCode: 'EB-A4-200', quantityInStock: 840, unit: 'Pieces', unitCost: 120, reorderLevel: 200, supplierName: 'Kenafric Book Division' },
      { id: 'inv-002', name: 'Official School Blazer (Navy Blue - Size 30)', category: 'Uniforms', skuCode: 'UNIF-BLZ-30', quantityInStock: 65, unit: 'Pieces', unitCost: 2800, reorderLevel: 20, supplierName: 'Elite School Outfitters' },
      { id: 'inv-003', name: 'Standard Match Football (Size 4)', category: 'Sports equipment', skuCode: 'SPT-FB-04', quantityInStock: 24, unit: 'Pieces', unitCost: 1900, reorderLevel: 8, supplierName: 'Nairobi Sports House' },
      { id: 'inv-004', name: 'A4 Printing & Photocopy Paper (80gsm)', category: 'Stationery', skuCode: 'STN-PPR-A4', quantityInStock: 48, unit: 'Reams', unitCost: 650, reorderLevel: 15, supplierName: 'OfficeMart Kenya' },
    ];

    for (const item of inventoryItems) {
      const itemRef = doc(db, 'inventory', item.id);
      batch.set(itemRef, item);
    }

    // Commit all items in batch
    await batch.commit();
    console.log('Successfully committed Uwezo Elite School initial dataset to Firestore.');
    return true;
  } catch (error) {
    console.error('Failed to seed initial data:', error);
    return false;
  }
}
