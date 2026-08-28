import React, { createContext, useContext, useEffect, useState } from 'react';
import { SchoolSettings, WebsiteSettings, RolePermissionConfig, PermissionKey, UserRole } from '../types';
import {
  listenToSchoolSettings,
  updateSchoolSettings as updateFirestoreSettings,
  listenToWebsiteSettings,
  updateWebsiteSettings as updateFirestoreWebsiteSettings,
  listenToRolePermissions,
  updateRolePermission as updateFirestoreRolePermission,
} from '../services/firebaseService';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  id: 'schoolProfile',
  schoolName: 'UWEZO ELITE SCHOOL',
  motto: 'Excellence in Character, Innovation and Leadership',
  schoolType: 'Co-Educational Day & Boarding CBC & JSS Academy',
  curriculum: 'Competency Based Curriculum (CBC) & Junior Secondary School (JSS)',
  moeRegNumber: 'MOE/PRI/2024/098',
  knecCode: '204581',
  phone: '+254 700 000 000 / +254 722 123 456',
  email: 'info@uwezoelite.ac.ke',
  website: 'https://uwezoelite.ac.ke',
  postalAddress: 'P.O. Box 45892-00100 Nairobi, Kenya',
  physicalLocation: 'Ruiru / Membley, Nairobi Metro, Kenya',
  address: 'Ruiru / Membley, Nairobi Metro, Kenya',
  currentAcademicYear: '2025/2026',
  currentTerm: 'Term 1',
  termStartDate: '2025-01-08',
  termEndDate: '2025-04-04',
  nextTermStartDate: '2025-05-05',
  principalName: 'Dr. Arthur M. Kariuki, PhD',
  logoUrl: '',
  mpesaPaybillNumber: '247247',
  bankAccountDetails: 'Equity Bank - Acc: 1450289104821',
};

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  id: 'websiteSettings',
  heroBadge: '🎓 Admissions Open for 2025/2026 Academic Year',
  heroTitle: 'Nurturing Future Leaders with',
  heroHighlight: 'Excellence & Innovation',
  heroSubtitle:
    'A premier CBC and Junior Secondary School in Nairobi Metro offering an enriched curriculum, world-class STEM robotics, ultra-modern science laboratories, and high-impact values-based holistic education.',
  heroImageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80',
  heroCtaText: 'Apply for Admission',
  heroSecondaryCta: 'Explore CBC Curriculum',
  tagline: 'Premier CBC & Junior Secondary Excellence',
  heroHeadline: 'Nurturing Future Leaders with Excellence, Character & Technology',
  heroBackgroundImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&auto=format&fit=crop&q=80',

  heroSlides: [
    {
      id: 'slide-1',
      tag: 'Premier CBC & Junior Secondary Excellence',
      headline: 'Nurturing Future Leaders with Excellence, Character & Technology',
      subtitle:
        'A world-class co-educational day and boarding institution in Kenya empowering learners through modern CBC, STEM innovation, and values.',
      ctaText: 'Enroll / Apply for Admission',
      ctaLink: '#admissions',
      secondaryText: 'Explore CBC Curriculum',
      secondaryLink: '#academics',
      bgImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&auto=format&fit=crop&q=80',
      badgeColor: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      order: 1,
      active: true,
    },
    {
      id: 'slide-2',
      tag: 'Junior Secondary (JSS) & STEM Hub',
      headline: 'State-of-the-Art Science Labs, Coding & Pre-Technical Workshops',
      subtitle:
        'Our Grade 7, 8 & 9 Junior Secondary learners gain hands-on technical skills, robotics, digital literacy, and holistic scientific inquiry with certified TSC master faculty.',
      ctaText: 'Discover JSS Programs',
      ctaLink: '#academics',
      secondaryText: 'View Facilities',
      secondaryLink: '#facilities',
      bgImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80',
      badgeColor: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
      order: 2,
      active: true,
    },
    {
      id: 'slide-3',
      tag: 'Holistic Talents & Character Development',
      headline: 'Championing Athletics, Music, Creative Arts & Global Leadership',
      subtitle:
        'Beyond top academic performance, our learners excel in swimming, performing arts, drama, chess, debate, and values-rooted leadership development.',
      ctaText: 'Explore Co-Curriculars',
      ctaLink: '#facilities',
      secondaryText: 'Admissions Inquiries',
      secondaryLink: '#admissions',
      bgImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&auto=format&fit=crop&q=80',
      badgeColor: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
      order: 3,
      active: true,
    },
  ],

  admissionsOpen: true,
  admissionsBannerText: 'Limited vacancies available for PP1, PP2, Grade 1-6 & Junior Secondary School (Grade 7-9). Early assessments underway!',
  admissionsDeadline: 'Rolling Admissions & Term 2 Transfers Open',
  admissionsIntakeTerm: 'Term 1 & Term 2 2025/2026',

  aboutTitle: 'Empowering Every Learner to Excel Beyond Boundaries',
  aboutStory:
    'Founded with an uncompromising commitment to academic mastery and ethical integrity, Uwezo Elite School provides an empowering learning ecosystem. We combine the Kenya Competency Based Curriculum (CBC) with world-standard digital literacy, international sports, arts, and leadership mentorship.',
  aboutImageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80',
  establishedYear: '2016',
  accreditationBadge: 'Fully Accredited by the Ministry of Education & KNEC Certified Assessment Centre',

  principalName: 'Dr. Arthur M. Kariuki, PhD',
  principalTitle: 'Executive Head of School & Principal',
  principalQualifications: 'PhD in Educational Leadership, M.Ed (Kenyatta University)',
  principalMessage:
    'Welcome to Uwezo Elite School. Our mission is to inspire, nurture, and prepare young minds to thrive in a dynamically changing global society. Every child who enters our gates is recognized as a unique talent destined for greatness.',
  principalPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',

  vision: 'To be the leading center of academic excellence, technological innovation, and value-based holistic leadership development in East Africa.',
  mission: 'To provide high-quality learner-centered CBC education that ignites creativity, critical thinking, moral uprightness, and global competitiveness.',
  coreValues: [
    'Integrity & Moral Rectitude',
    'Academic & Creative Excellence',
    'Innovation, Coding & STEM Mastery',
    'Respect, Inclusivity & Teamwork',
    'Environmental Stewardship & Leadership',
  ],

  stats: [
    { label: 'Enrolled Learners', value: '1,250+', sublabel: 'Nurtured Across All Grades' },
    { label: 'Certified TSC Faculty', value: '75+', sublabel: 'Expert CBC Educators' },
    { label: 'KPSEA Distinction Rate', value: '98.4%', sublabel: 'Top National Tier' },
    { label: 'Campus Acres & Labs', value: '15+', sublabel: 'State-of-the-Art Facilities' },
  ],

  programs: [
    {
      id: 'early-years',
      title: 'Early Years Education (EYE)',
      level: 'Playgroup, PP1 & PP2',
      ageGroup: 'Ages 3 - 5 Years',
      description:
        'Play-based, child-centered environment fostering psychomotor skills, language development, foundational numeracy, and positive social interaction.',
      features: ['Phonics & Pre-Braille Reading', 'Montessori Sensory Activities', 'Creative Arts & Music', 'Safe Indoor/Outdoor Playgrounds'],
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'middle-school',
      title: 'Primary CBC Education',
      level: 'Grade 1 to Grade 6',
      ageGroup: 'Ages 6 - 11 Years',
      description:
        'Rigorous CBC curriculum developing foundational competencies, scientific investigation, indigenous & foreign languages, and digital literacy.',
      features: ['Mathematics & Science Lab Practicals', 'French, German & Kiswahili', 'Coding & Digital Devices in Class', 'KPSEA Assessment Preparation'],
      imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'junior-secondary',
      title: 'Junior Secondary School (JSS)',
      level: 'Grade 7, 8 & Grade 9',
      ageGroup: 'Ages 12 - 15 Years',
      description:
        'Specialized pathways preparing learners for Senior School with modern Pre-Technical workshops, Robotics, Agriculture farms, and Performing Arts.',
      features: ['Pre-Technical & Engineering Foundations', 'Integrated Science Laboratories', 'Robotics & AI Club', 'Leadership & Community Service'],
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
    },
  ],

  facilities: [
    {
      id: 'science-labs',
      name: 'Ultra-Modern Science & JSS Laboratories',
      category: 'Academics & Research',
      description: 'Fully equipped Physics, Chemistry, Biology, and Integrated Science lab benches with safety fume hoods and individual digital microscopes.',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
      featured: true,
    },
    {
      id: 'ict-robotics',
      name: 'ICT Innovation Hub & Robotics Studio',
      category: 'Technology & STEM',
      description: 'High-speed fiber-connected iMac/PC stations, Arduino & Raspberry Pi kits, 3D printing equipment, and LEGO Education robotics modules.',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
      featured: true,
    },
    {
      id: 'olympic-pool',
      name: 'Semi-Olympic Heated Swimming Pool',
      category: 'Sports & Wellness',
      description: 'Clean, heated pool with certified life guards, competitive swimming coaching, and separate splash zones for early years learners.',
      imageUrl: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=600&auto=format&fit=crop&q=80',
      featured: true,
    },
    {
      id: 'school-fleet',
      name: 'GPS-Tracked Safe School Fleet',
      category: 'Logistics & Safety',
      description: 'Modern fleet of branded school buses equipped with live speed governors, seatbelts on all seats, dedicated bus attendants, and real-time parent tracking.',
      imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80',
      featured: true,
    },
    {
      id: 'library-hub',
      name: 'CBC Resource Centre & Digital Library',
      category: 'Research & Literature',
      description: 'Over 10,000 curated titles, interactive e-readers, quiet study carrels, and multimedia research pods for independent learning.',
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80',
      featured: true,
    },
  ],

  testimonials: [
    {
      id: 't-1',
      author: 'Eng. Francis & Mrs. Wanjiku Kariuki',
      role: 'Parents of Grade 4 & Grade 7 Learners',
      content:
        'The transformation in our children has been remarkable. Their confidence in public speaking, computational thinking, and moral clarity reflects Uwezo Elite’s dedication to true holistic education.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      date: 'January 2025',
    },
    {
      id: 't-2',
      author: 'Dr. Beatrice Ochieng',
      role: 'Parent of PP2 Learner',
      content:
        'The early years program is phenomenal! The teachers are patient, the facilities are pristine, and the daily communication via the school portal keeps us connected to every milestone.',
      rating: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      date: 'February 2025',
    },
  ],

  news: [
    {
      id: 'news-1',
      title: 'Uwezo Elite Triumphs at National STEM & Robotics Olympiad',
      category: 'Achievement',
      date: 'Feb 15, 2025',
      summary: 'Our Junior Secondary robotics team secured first position with their automated solar irrigation project at the National Science Fair.',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
      published: true,
    },
    {
      id: 'news-2',
      title: 'Annual CBC Talent, Music & Culture Showcase Announced',
      category: 'Events',
      date: 'March 28, 2025',
      summary: 'Join us for an exciting day celebrating traditional arts, contemporary music, karate, and creative writing from learners across all grades.',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      published: true,
    },
  ],

  socialLinks: {
    facebook: 'https://facebook.com/uwezoeliteschool',
    twitter: 'https://twitter.com/uwezoelite',
    instagram: 'https://instagram.com/uwezoeliteschool',
    youtube: 'https://youtube.com/@uwezoeliteschool',
    whatsapp: '+254700000000',
  },

  contact: {
    phone: '+254 700 000 000 / +254 722 123 456',
    emergencyPhone: '+254 733 456 789',
    email: 'info@uwezoelite.ac.ke',
    admissionsEmail: 'admissions@uwezoelite.ac.ke',
    address: 'Uwezo Academic Boulevard, Off Eastern Bypass, Ruiru/Membley, Nairobi Metro, Kenya',
    officeHours: 'Monday - Friday: 7:00 AM - 5:00 PM | Saturday: 8:00 AM - 1:00 PM',
    mapLocationQuery: 'Uwezo Elite School Ruiru Nairobi',
  },
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionConfig[] = [
  {
    role: 'SUPER_ADMIN',
    roleTitle: 'Super Administrator',
    description: 'Universal unrestricted access across all school ERP modules, databases, user management, and CMS.',
    permissions: [
      'students:view', 'students:create', 'students:edit', 'students:delete',
      'admissions:manage', 'attendance:view', 'attendance:record',
      'academics:view', 'academics:manage', 'exams:view', 'exams:enter_marks', 'exams:publish',
      'finance:view', 'finance:collect', 'finance:manage_structures',
      'staff:view', 'staff:create', 'staff:edit', 'staff:suspend', 'staff:delete',
      'facilities:manage', 'announcements:manage', 'settings:manage', 'website:manage', 'audit:view'
    ],
  },
  {
    role: 'SCHOOL_ADMIN',
    roleTitle: 'School Administrator',
    description: 'Full administrative access to manage daily operations, admissions, academic records, staff, and website.',
    permissions: [
      'students:view', 'students:create', 'students:edit', 'students:delete',
      'admissions:manage', 'attendance:view', 'attendance:record',
      'academics:view', 'academics:manage', 'exams:view', 'exams:enter_marks', 'exams:publish',
      'finance:view', 'finance:collect',
      'staff:view', 'staff:create', 'staff:edit', 'staff:suspend',
      'facilities:manage', 'announcements:manage', 'settings:manage', 'website:manage', 'audit:view'
    ],
  },
  {
    role: 'PRINCIPAL',
    roleTitle: 'Principal / Headteacher',
    description: 'Executive supervision over all academic, disciplinary, faculty, examination reports, and school public profile.',
    permissions: [
      'students:view', 'students:create', 'students:edit',
      'admissions:manage', 'attendance:view', 'attendance:record',
      'academics:view', 'academics:manage', 'exams:view', 'exams:publish',
      'finance:view',
      'staff:view', 'staff:create', 'staff:edit', 'staff:suspend',
      'facilities:manage', 'announcements:manage', 'settings:manage', 'website:manage', 'audit:view'
    ],
  },
  {
    role: 'DEPUTY_PRINCIPAL',
    roleTitle: 'Deputy Principal',
    description: 'Management of curriculum execution, daily attendance, class timetables, discipline, and examinations.',
    permissions: [
      'students:view', 'students:create', 'students:edit',
      'admissions:manage', 'attendance:view', 'attendance:record',
      'academics:view', 'academics:manage', 'exams:view', 'exams:enter_marks', 'exams:publish',
      'staff:view', 'facilities:manage', 'announcements:manage'
    ],
  },
  {
    role: 'TEACHER',
    roleTitle: 'Teacher / Faculty Member',
    description: 'Record daily attendance, assess learning competencies, enter examination marks, and manage classroom assignments.',
    permissions: [
      'students:view', 'attendance:view', 'attendance:record',
      'academics:view', 'exams:view', 'exams:enter_marks', 'announcements:manage'
    ],
  },
  {
    role: 'ACCOUNTANT',
    roleTitle: 'Bursar / School Accountant',
    description: 'Process M-Pesa & Bank fee payments, generate financial statements, manage fee structures, and view balances.',
    permissions: [
      'students:view', 'finance:view', 'finance:collect', 'finance:manage_structures', 'audit:view'
    ],
  },
  {
    role: 'REGISTRAR',
    roleTitle: 'Registrar / Admissions Officer',
    description: 'Process prospective learner applications, enroll applicants, assign admission numbers, and maintain student files.',
    permissions: [
      'students:view', 'students:create', 'students:edit', 'admissions:manage', 'announcements:manage'
    ],
  },
  {
    role: 'LIBRARIAN',
    roleTitle: 'School Librarian',
    description: 'Issue and return CBC textbooks, manage digital catalogue, and track resource inventory.',
    permissions: ['students:view', 'facilities:manage'],
  },
  {
    role: 'STOREKEEPER',
    roleTitle: 'Store & Inventory Keeper',
    description: 'Manage school consumables, laboratory supplies, sports equipment, and requisitions.',
    permissions: ['facilities:manage'],
  },
  {
    role: 'TRANSPORT_MANAGER',
    roleTitle: 'Transport & Fleet Manager',
    description: 'Oversee school buses, route allocations, driver assignments, and vehicle maintenance.',
    permissions: ['students:view', 'facilities:manage'],
  },
  {
    role: 'PARENT',
    roleTitle: 'Parent / Guardian',
    description: 'Access child portal to view academic report cards, fee statements, and attendance records.',
    permissions: ['attendance:view', 'exams:view', 'finance:view'],
  },
  {
    role: 'STUDENT',
    roleTitle: 'Learner / Student',
    description: 'Access student portal for homework, class timetables, and library loans.',
    permissions: ['attendance:view', 'exams:view'],
  },
];

interface SettingsContextType {
  settings: SchoolSettings;
  updateSettings: (newSettings: Partial<SchoolSettings>) => Promise<void>;
  websiteSettings: WebsiteSettings;
  updateWebsiteSettings: (newSettings: Partial<WebsiteSettings>) => Promise<void>;
  rolePermissions: RolePermissionConfig[];
  updateRolePermission: (role: UserRole, permissions: PermissionKey[]) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    try {
      const cached = localStorage.getItem('uwezo_school_settings');
      if (cached) return { ...DEFAULT_SCHOOL_SETTINGS, ...JSON.parse(cached) };
    } catch {
      // ignore
    }
    return DEFAULT_SCHOOL_SETTINGS;
  });

  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() => {
    try {
      const cached = localStorage.getItem('uwezo_website_settings');
      if (cached) return { ...DEFAULT_WEBSITE_SETTINGS, ...JSON.parse(cached) };
    } catch {
      // ignore
    }
    return DEFAULT_WEBSITE_SETTINGS;
  });

  const [rolePermissions, setRolePermissions] = useState<RolePermissionConfig[]>(DEFAULT_ROLE_PERMISSIONS);
  const [loading, setLoading] = useState(true);

  // Listen to School Profile Settings
  useEffect(() => {
    const unsubSchool = listenToSchoolSettings((data) => {
      if (data) {
        setSettings((prev) => ({ ...prev, ...data }));
        try {
          localStorage.setItem('uwezo_school_settings', JSON.stringify(data));
        } catch {
          // ignore
        }
      }
    });

    const unsubWeb = listenToWebsiteSettings((data) => {
      if (data) {
        setWebsiteSettings((prev) => ({ ...DEFAULT_WEBSITE_SETTINGS, ...prev, ...data }));
        try {
          localStorage.setItem('uwezo_website_settings', JSON.stringify(data));
        } catch {
          // ignore
        }
      }
    });

    const unsubRoles = listenToRolePermissions((data) => {
      if (data && data.length > 0) {
        setRolePermissions(data);
      }
    });

    setLoading(false);

    return () => {
      unsubSchool();
      unsubWeb();
      unsubRoles();
    };
  }, []);

  const updateSettings = async (newSettings: Partial<SchoolSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem('uwezo_school_settings', JSON.stringify(updated));
    } catch {
      // ignore
    }
    await updateFirestoreSettings(newSettings);
  };

  const updateWebsite = async (newSettings: Partial<WebsiteSettings>) => {
    const updated = { ...websiteSettings, ...newSettings };
    setWebsiteSettings(updated);
    try {
      localStorage.setItem('uwezo_website_settings', JSON.stringify(updated));
    } catch {
      // ignore
    }
    await updateFirestoreWebsiteSettings(updated);
  };

  const updateRolePerms = async (role: UserRole, permissions: PermissionKey[]) => {
    const updated = rolePermissions.map((rp) => {
      if (rp.role === role) {
        return { ...rp, permissions, updatedAt: new Date().toISOString() };
      }
      return rp;
    });
    setRolePermissions(updated);
    const target = updated.find((rp) => rp.role === role);
    if (target) {
      await updateFirestoreRolePermission(role, target);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        websiteSettings,
        updateWebsiteSettings: updateWebsite,
        rolePermissions,
        updateRolePermission: updateRolePerms,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSchoolSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSchoolSettings must be used within a SettingsProvider');
  }
  return context;
};

export const useSettings = useSchoolSettings;

