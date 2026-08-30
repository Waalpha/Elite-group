import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  UserPlus,
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Printer,
  Sparkles,
  UserCheck2,
  GraduationCap,
  BookOpen,
  Phone,
  Mail,
  UserX,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink,
  ChevronDown,
  FileSpreadsheet,
  Download,
  Key,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchoolSettings } from '../../contexts/SettingsContext';
import { UserProfile, UserRole, Student, Teacher } from '../../types';
import { firestoreService, listenToUsers } from '../../services/firebaseService';
import { SEED_USERS, checkAndSeedInitialData } from '../../services/seedService';
import { Modal } from '../../components/common/Modal';

export const UserLoginsModule: React.FC = () => {
  const { currentUser, switchPersona, isAdmin } = useAuth();
  const { settings } = useSchoolSettings();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'suspended'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [isBulkGenModalOpen, setIsBulkGenModalOpen] = useState(false);
  const [isPrintSlipsOpen, setIsPrintSlipsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New User Form State
  const [newUserData, setNewUserData] = useState<{
    displayName: string;
    username: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    password: string;
    associatedId: string;
    status: 'active' | 'suspended';
  }>({
    displayName: '',
    username: '',
    email: '',
    phoneNumber: '',
    role: 'TEACHER',
    password: 'School@2025',
    associatedId: '',
    status: 'active',
  });

  // Edit User Form State
  const [editUserData, setEditUserData] = useState<{
    displayName: string;
    username: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    password?: string;
    associatedId: string;
    status: 'active' | 'suspended';
  }>({
    displayName: '',
    username: '',
    email: '',
    phoneNumber: '',
    role: 'TEACHER',
    password: '',
    associatedId: '',
    status: 'active',
  });

  // Password reset state
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Bulk generation state
  const [bulkTarget, setBulkTarget] = useState<'STUDENTS' | 'TEACHERS' | 'PARENTS'>('STUDENTS');
  const [bulkClassFilter, setBulkClassFilter] = useState('ALL');
  const [bulkDefaultPass, setBulkDefaultPass] = useState('Student@123');

  // Load users, students, teachers from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubUsers = listenToUsers((data) => {
      const merged: UserProfile[] = [...SEED_USERS];
      if (data && data.length > 0) {
        for (const u of data) {
          const idx = merged.findIndex(
            (m) =>
              m.id === u.id ||
              (u.username && m.username?.toLowerCase() === u.username.toLowerCase())
          );
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...u };
          } else {
            merged.push(u);
          }
        }
      }
      setUsers(merged);
      setLoading(false);
    });

    const unsubStudents = firestoreService.subscribeCollection<Student>('students', (data) => {
      setStudents(data || []);
    });

    const unsubTeachers = firestoreService.subscribeCollection<Teacher>('teachers', (data) => {
      setTeachers(data || []);
    });

    return () => {
      unsubUsers();
      unsubStudents();
      unsubTeachers();
    };
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const generateRandomPassword = (length = 10) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Open Add Modal with smart defaults
  const handleOpenAddModal = () => {
    setNewUserData({
      displayName: '',
      username: '',
      email: '',
      phoneNumber: '',
      role: 'TEACHER',
      password: generateRandomPassword(8),
      associatedId: '',
      status: 'active',
    });
    setIsAddModalOpen(true);
  };

  // Create Single User Login
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.displayName.trim() || !newUserData.username.trim()) {
      showFeedback('error', 'Please enter a valid display name and username.');
      return;
    }

    const cleanUsername = newUserData.username.trim().toLowerCase();

    // Check duplicate username
    const existing = users.find((u) => u.username?.toLowerCase() === cleanUsername);
    if (existing) {
      showFeedback('error', `Username "${cleanUsername}" is already in use by ${existing.displayName}.`);
      return;
    }

    setProcessing(true);
    try {
      const userDocId = `user-${Date.now()}`;
      const newUser: UserProfile = {
        id: userDocId,
        displayName: newUserData.displayName.trim(),
        username: cleanUsername,
        email: newUserData.email.trim() || `${cleanUsername}@uwezoeliteschool.ac.ke`,
        phoneNumber: newUserData.phoneNumber.trim() || '',
        role: newUserData.role,
        password: newUserData.password || 'Admin@123',
        associatedId: newUserData.associatedId || '',
        status: newUserData.status,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.displayName || 'Super Admin',
      };

      await firestoreService.setDocument('users', userDocId, newUser);

      // Audit Log
      await firestoreService.logAudit({
        userId: currentUser?.id || 'admin',
        userName: currentUser?.displayName || 'Admin',
        userRole: currentUser?.role || 'SUPER_ADMIN',
        action: 'USER_LOGIN_CREATED',
        targetCollection: 'users',
        recordId: userDocId,
        details: `Created new user login account: ${newUser.displayName} (@${newUser.username}) with role ${newUser.role}`,
        timestamp: new Date().toISOString(),
      });

      setIsAddModalOpen(false);
      showFeedback('success', `User account @${newUser.username} successfully created!`);
    } catch (err: any) {
      console.error('Failed to create user login:', err);
      showFeedback('error', `Failed to create user: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setEditUserData({
      displayName: user.displayName,
      username: user.username || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      password: user.password || '',
      associatedId: user.associatedId || '',
      status: user.status === 'suspended' ? 'suspended' : 'active',
    });
    setIsEditModalOpen(true);
  };

  // Update User Login
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setProcessing(true);
    try {
      const cleanUsername = editUserData.username.trim().toLowerCase();
      const updatedUser: Partial<UserProfile> = {
        displayName: editUserData.displayName.trim(),
        username: cleanUsername,
        email: editUserData.email.trim(),
        phoneNumber: editUserData.phoneNumber.trim(),
        role: editUserData.role,
        password: editUserData.password || selectedUser.password || 'Admin@123',
        associatedId: editUserData.associatedId || '',
        status: editUserData.status,
      };

      await firestoreService.updateDocument('users', selectedUser.id, updatedUser);

      // Audit Log
      await firestoreService.logAudit({
        userId: currentUser?.id || 'admin',
        userName: currentUser?.displayName || 'Admin',
        userRole: currentUser?.role || 'SUPER_ADMIN',
        action: 'USER_LOGIN_UPDATED',
        targetCollection: 'users',
        recordId: selectedUser.id,
        details: `Updated user account @${cleanUsername} (${editUserData.displayName})`,
        timestamp: new Date().toISOString(),
      });

      setIsEditModalOpen(false);
      showFeedback('success', `User account @${cleanUsername} updated successfully.`);
    } catch (err: any) {
      console.error('Failed to update user login:', err);
      showFeedback('error', `Failed to update user: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Toggle Suspend / Reactivate
  const handleToggleSuspend = async (user: UserProfile) => {
    const isCurrentlySuspended = user.status === 'suspended';
    const newStatus = isCurrentlySuspended ? 'active' : 'suspended';
    const actionText = isCurrentlySuspended ? 'reactivate' : 'suspend';

    if (
      !confirm(
        `Are you sure you want to ${actionText} login access for ${user.displayName} (@${user.username})?`
      )
    ) {
      return;
    }

    try {
      await firestoreService.updateDocument('users', user.id, {
        status: newStatus,
      });

      await firestoreService.logAudit({
        userId: currentUser?.id || 'admin',
        userName: currentUser?.displayName || 'Admin',
        userRole: currentUser?.role || 'SUPER_ADMIN',
        action: isCurrentlySuspended ? 'USER_LOGIN_REACTIVATED' : 'USER_LOGIN_SUSPENDED',
        targetCollection: 'users',
        recordId: user.id,
        details: `${isCurrentlySuspended ? 'Reactivated' : 'Suspended'} user login access for ${user.displayName} (@${user.username})`,
        timestamp: new Date().toISOString(),
      });

      showFeedback(
        'success',
        `User @${user.username} is now ${newStatus === 'active' ? 'Active' : 'Suspended'}.`
      );
    } catch (err: any) {
      showFeedback('error', `Failed to update user status: ${err.message}`);
    }
  };

  // Open Reset Password Modal
  const handleOpenResetPass = (user: UserProfile) => {
    setSelectedUser(user);
    setNewPasswordValue(generateRandomPassword(8));
    setIsResetPassModalOpen(true);
  };

  // Execute Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPasswordValue.trim()) return;

    setProcessing(true);
    try {
      await firestoreService.updateDocument('users', selectedUser.id, {
        password: newPasswordValue.trim(),
      });

      await firestoreService.logAudit({
        userId: currentUser?.id || 'admin',
        userName: currentUser?.displayName || 'Admin',
        userRole: currentUser?.role || 'SUPER_ADMIN',
        action: 'USER_PASSWORD_RESET',
        targetCollection: 'users',
        recordId: selectedUser.id,
        details: `Reset password for user @${selectedUser.username} (${selectedUser.displayName})`,
        timestamp: new Date().toISOString(),
      });

      setIsResetPassModalOpen(false);
      showFeedback(
        'success',
        `Password for @${selectedUser.username} reset to "${newPasswordValue.trim()}".`
      );
    } catch (err: any) {
      showFeedback('error', `Failed to reset password: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Delete User Account
  const handleDeleteUser = async (user: UserProfile) => {
    if (user.role === 'SUPER_ADMIN' && users.filter((u) => u.role === 'SUPER_ADMIN').length <= 1) {
      alert('Cannot delete the last remaining Super Admin account.');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to permanently delete the login account for ${user.displayName} (@${user.username})? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await firestoreService.deleteDocument('users', user.id);

      await firestoreService.logAudit({
        userId: currentUser?.id || 'admin',
        userName: currentUser?.displayName || 'Admin',
        userRole: currentUser?.role || 'SUPER_ADMIN',
        action: 'USER_LOGIN_DELETED',
        targetCollection: 'users',
        recordId: user.id,
        details: `Deleted user login account @${user.username} (${user.displayName})`,
        timestamp: new Date().toISOString(),
      });

      showFeedback('success', `User account @${user.username} deleted.`);
    } catch (err: any) {
      showFeedback('error', `Failed to delete user: ${err.message}`);
    }
  };

  // Re-seed default users
  const handleReseedUsers = async () => {
    if (
      !confirm(
        'Re-sync and seed default institutional user logins (Super Admin, Principal, Accountant, Teachers, Parents, Students)?'
      )
    ) {
      return;
    }
    setProcessing(true);
    try {
      for (const u of SEED_USERS) {
        await firestoreService.setDocument('users', u.id, u);
      }
      showFeedback('success', 'Default institutional user accounts successfully re-seeded!');
    } catch (err: any) {
      showFeedback('error', `Failed to seed users: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Bulk Generate Logins for Students/Teachers/Parents
  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    let createdCount = 0;

    try {
      if (bulkTarget === 'STUDENTS') {
        const targetStudents =
          bulkClassFilter === 'ALL'
            ? students
            : students.filter((s) => s.grade === bulkClassFilter || s.classId === bulkClassFilter);

        for (const st of targetStudents) {
          const admClean = (st.admissionNumber || st.id).toLowerCase().replace(/[^a-z0-9]/g, '');
          const username = `student.${admClean}`;
          const existing = users.find((u) => u.username?.toLowerCase() === username);

          if (!existing) {
            const userDocId = `user-student-${st.id}`;
            const studentUser: UserProfile = {
              id: userDocId,
              displayName: `${st.firstName} ${st.lastName}`,
              username,
              email: `${username}@students.uwezo.ac.ke`,
              role: 'STUDENT',
              password: bulkDefaultPass || 'Student@123',
              associatedId: st.id,
              status: 'active',
              createdAt: new Date().toISOString(),
              createdBy: currentUser?.displayName || 'Bulk Generator',
            };
            await firestoreService.setDocument('users', userDocId, studentUser);
            createdCount++;
          }
        }
      } else if (bulkTarget === 'TEACHERS') {
        for (const t of teachers) {
          const namePart = (t.lastName || t.firstName).toLowerCase().replace(/[^a-z0-9]/g, '');
          const username = `teacher.${namePart}`;
          const existing = users.find((u) => u.username?.toLowerCase() === username);

          if (!existing) {
            const userDocId = `user-teacher-${t.id}`;
            const teacherUser: UserProfile = {
              id: userDocId,
              displayName: `${t.firstName} ${t.lastName}`,
              username,
              email: t.email || `${username}@uwezoeliteschool.ac.ke`,
              phoneNumber: t.phone || '',
              role: 'TEACHER',
              password: bulkDefaultPass || 'Teacher@123',
              associatedId: t.id,
              status: 'active',
              createdAt: new Date().toISOString(),
              createdBy: currentUser?.displayName || 'Bulk Generator',
            };
            await firestoreService.setDocument('users', userDocId, teacherUser);
            createdCount++;
          }
        }
      } else if (bulkTarget === 'PARENTS') {
        const parentsMap = new Map<string, Student>();
        students.forEach((st) => {
          if (st.parentPhone || st.parentName) {
            const key = st.parentPhone || st.parentName || st.id;
            if (!parentsMap.has(key)) parentsMap.set(key, st);
          }
        });

        for (const [, st] of parentsMap) {
          const parentNameClean = (st.parentName || 'parent').toLowerCase().replace(/[^a-z0-9]/g, '.');
          const username = `parent.${parentNameClean.substring(0, 15)}`;
          const existing = users.find((u) => u.username?.toLowerCase() === username);

          if (!existing) {
            const userDocId = `user-parent-${st.id}`;
            const parentUser: UserProfile = {
              id: userDocId,
              displayName: st.parentName || `Guardian of ${st.firstName}`,
              username,
              email: st.parentEmail || `${username}@uwezofamily.ke`,
              phoneNumber: st.parentPhone || '',
              role: 'PARENT',
              password: bulkDefaultPass || 'Parent@123',
              associatedId: st.id,
              status: 'active',
              createdAt: new Date().toISOString(),
              createdBy: currentUser?.displayName || 'Bulk Generator',
            };
            await firestoreService.setDocument('users', userDocId, parentUser);
            createdCount++;
          }
        }
      }

      setIsBulkGenModalOpen(false);
      showFeedback('success', `Successfully provisioned ${createdCount} new user login accounts!`);
    } catch (err: any) {
      showFeedback('error', `Bulk generation failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'ADMIN' &&
        ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL'].includes(u.role)) ||
      (roleFilter === 'TEACHER' && u.role === 'TEACHER') ||
      (roleFilter === 'ACCOUNTANT' && u.role === 'ACCOUNTANT') ||
      (roleFilter === 'PARENT' && u.role === 'PARENT') ||
      (roleFilter === 'STUDENT' && u.role === 'STUDENT') ||
      (roleFilter === 'OPERATIONS' &&
        ['REGISTRAR', 'LIBRARIAN', 'STOREKEEPER', 'TRANSPORT_MANAGER'].includes(u.role)) ||
      u.role === roleFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'active' && u.status !== 'suspended') ||
      (statusFilter === 'suspended' && u.status === 'suspended');

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate Metrics
  const totalAccounts = users.length;
  const activeCount = users.filter((u) => u.status !== 'suspended').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const staffCount = users.filter((u) =>
    ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'REGISTRAR', 'LIBRARIAN', 'STOREKEEPER', 'TRANSPORT_MANAGER'].includes(u.role)
  ).length;
  const parentCount = users.filter((u) => u.role === 'PARENT').length;
  const studentCount = users.filter((u) => u.role === 'STUDENT').length;

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'PRINCIPAL':
      case 'DEPUTY_PRINCIPAL':
      case 'SCHOOL_ADMIN':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'ACCOUNTANT':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'TEACHER':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'PARENT':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'STUDENT':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '👑';
      case 'PRINCIPAL':
      case 'DEPUTY_PRINCIPAL':
      case 'SCHOOL_ADMIN':
        return '🎓';
      case 'ACCOUNTANT':
        return '💰';
      case 'TEACHER':
        return '📚';
      case 'PARENT':
        return '👨‍👩‍👧';
      case 'STUDENT':
        return '🎒';
      case 'REGISTRAR':
        return '📝';
      case 'LIBRARIAN':
        return '📖';
      case 'STOREKEEPER':
        return '📦';
      case 'TRANSPORT_MANAGER':
        return '🚌';
      default:
        return '👤';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-3 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-700 px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-200/60 mb-2">
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span>Institutional Access & Identity Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 tracking-tight">
            User Accounts & Logins
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Create, provision, configure, and audit login credentials for School Administrators, Teaching Faculty, Bursary Accountants, Parents, and CBC Students.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            id="btn-reseed-users"
            type="button"
            onClick={handleReseedUsers}
            disabled={processing}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
            title="Re-seed Default Credentials"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Default Users</span>
          </button>

          <button
            id="btn-print-login-slips"
            type="button"
            onClick={() => setIsPrintSlipsOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Print Login Slips</span>
          </button>

          <button
            id="btn-bulk-gen-logins"
            type="button"
            onClick={() => setIsBulkGenModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Bulk Provision Logins</span>
          </button>

          <button
            id="btn-add-user-login"
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add User Login</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Logins</p>
          <h3 className="mt-1 text-2xl font-black text-slate-900">{totalAccounts}</h3>
          <p className="mt-1 text-[11px] text-emerald-700 font-semibold">{activeCount} Active</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Staff & Faculty</p>
          <h3 className="mt-1 text-2xl font-black text-indigo-700">{staffCount}</h3>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">Admin, Trs & Bursar</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parent Accounts</p>
          <h3 className="mt-1 text-2xl font-black text-teal-700">{parentCount}</h3>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">Guardian Portals</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Logins</p>
          <h3 className="mt-1 text-2xl font-black text-purple-700">{studentCount}</h3>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">CBC Learner Portals</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Status</p>
          <h3 className="mt-1 text-2xl font-black text-emerald-600">{activeCount}</h3>
          <p className="mt-1 text-[11px] text-emerald-700 font-semibold">100% Authorized</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Suspended</p>
          <h3 className="mt-1 text-2xl font-black text-rose-600">{suspendedCount}</h3>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">Blocked Logins</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="user-logins-search-input"
            type="text"
            placeholder="Search name, username, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-slate-900 placeholder-slate-400 font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
            {[
              { id: 'ALL', label: 'All Users' },
              { id: 'ADMIN', label: 'Admins' },
              { id: 'TEACHER', label: 'Teachers' },
              { id: 'ACCOUNTANT', label: 'Accounts' },
              { id: 'PARENT', label: 'Parents' },
              { id: 'STUDENT', label: 'Students' },
              { id: 'OPERATIONS', label: 'Operations' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  roleFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-hidden shrink-0"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">User Account & Name</th>
                <th className="py-3.5 px-4">Username & Email</th>
                <th className="py-3.5 px-4">Role & Portal</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Password Credentials</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    Loading user login accounts from database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700">No user accounts found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search criteria or click "+ Add User Login" to create one.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  const isPassVisible = showPasswordMap[user.id] || false;
                  const displayPass = user.password || 'Admin@123';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {user.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{user.displayName}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {user.phoneNumber || 'No phone set'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Username & Email */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            <span>@{user.username || user.id}</span>
                            <button
                              onClick={() => handleCopy(user.username || '', `un-${user.id}`)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
                              title="Copy username"
                            >
                              {copiedId === `un-${user.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                            {user.email || '—'}
                          </p>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold tracking-tight ${getRoleBadgeStyle(
                            user.role
                          )}`}
                        >
                          <span>{getRoleIcon(user.role)}</span>
                          <span>{user.role.replace(/_/g, ' ')}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {user.status === 'suspended' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Password Preview */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200 flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>{isPassVisible ? displayPass : '••••••••'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                            title={isPassVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isPassVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(displayPass, `pass-${user.id}`)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                            title="Copy Password"
                          >
                            {copiedId === `pass-${user.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Last Login Activity */}
                      <td className="py-3 px-4 text-[11px] text-slate-500">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never logged in'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Test Login as this user */}
                          <button
                            type="button"
                            onClick={() => switchPersona(user.role)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Simulate / Log in as this persona"
                          >
                            <Key className="w-3 h-3" />
                            <span>Test Login</span>
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenResetPass(user)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                            title="Reset Password"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit User */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="Edit User Details"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Reactivate */}
                          <button
                            type="button"
                            onClick={() => handleToggleSuspend(user)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              user.status === 'suspended'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={user.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
                          >
                            {user.status === 'suspended' ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <UserX className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete Account */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Account"
                          >
                            <UserX className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD USER LOGIN */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New User Login Account"
        subtitle="Provision a secure authentication profile for staff, teacher, student, or parent"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Display Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tr. Susan Wambui"
                value={newUserData.displayName}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewUserData((prev) => {
                    const autoUsername = val
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, '.')
                      .replace(/\.+/g, '.');
                    return {
                      ...prev,
                      displayName: val,
                      username: prev.username ? prev.username : autoUsername,
                    };
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username / Login ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. teacher.susan"
                value={newUserData.username}
                onChange={(e) =>
                  setNewUserData((prev) => ({
                    ...prev,
                    username: e.target.value.toLowerCase().replace(/\s+/g, ''),
                  }))
                }
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                System Role & Access Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={newUserData.role}
                onChange={(e) =>
                  setNewUserData((prev) => ({ ...prev, role: e.target.value as UserRole }))
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden font-medium"
              >
                <option value="SUPER_ADMIN">Super Admin (Universal Operations)</option>
                <option value="PRINCIPAL">Principal / Head Teacher</option>
                <option value="DEPUTY_PRINCIPAL">Deputy Principal</option>
                <option value="SCHOOL_ADMIN">School Administrator</option>
                <option value="TEACHER">Teaching Faculty / CBC Assessor</option>
                <option value="ACCOUNTANT">Accountant / Bursar</option>
                <option value="REGISTRAR">Registrar / Admissions</option>
                <option value="LIBRARIAN">Librarian</option>
                <option value="STOREKEEPER">Storekeeper / Inventory</option>
                <option value="TRANSPORT_MANAGER">Transport Manager</option>
                <option value="PARENT">Parent / Guardian Portal</option>
                <option value="STUDENT">Student CBC Portal</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setNewUserData((prev) => ({
                      ...prev,
                      password: generateRandomPassword(8),
                    }))
                  }
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={newUserData.password}
                onChange={(e) =>
                  setNewUserData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                placeholder="e.g. susan.wambui@uwezoeliteschool.ac.ke"
                value={newUserData.email}
                onChange={(e) =>
                  setNewUserData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (M-Pesa SMS)</label>
              <input
                type="text"
                placeholder="e.g. +254 722 000 111"
                value={newUserData.phoneNumber}
                onChange={(e) =>
                  setNewUserData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Account Status */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Initial Account Status</p>
              <p className="text-[11px] text-slate-500">Allow this user to sign in immediately upon creation</p>
            </div>
            <select
              value={newUserData.status}
              onChange={(e) =>
                setNewUserData((prev) => ({ ...prev, status: e.target.value as any }))
              }
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
            >
              <option value="active">Active & Authorized</option>
              <option value="suspended">Suspended / Inactive</option>
            </select>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              {processing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT USER LOGIN */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Login Details"
        subtitle={`Modify credentials and access for @${selectedUser?.username}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={editUserData.displayName}
                onChange={(e) =>
                  setEditUserData((prev) => ({ ...prev, displayName: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={editUserData.username}
                onChange={(e) =>
                  setEditUserData((prev) => ({ ...prev, username: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
              <select
                value={editUserData.role}
                onChange={(e) =>
                  setEditUserData((prev) => ({ ...prev, role: e.target.value as UserRole }))
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden font-medium"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="PRINCIPAL">Principal</option>
                <option value="DEPUTY_PRINCIPAL">Deputy Principal</option>
                <option value="SCHOOL_ADMIN">School Admin</option>
                <option value="TEACHER">Teacher</option>
                <option value="ACCOUNTANT">Accountant / Bursar</option>
                <option value="REGISTRAR">Registrar</option>
                <option value="LIBRARIAN">Librarian</option>
                <option value="STOREKEEPER">Storekeeper</option>
                <option value="TRANSPORT_MANAGER">Transport Manager</option>
                <option value="PARENT">Parent</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={editUserData.status}
                onChange={(e) =>
                  setEditUserData((prev) => ({ ...prev, status: e.target.value as any }))
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden font-medium"
              >
                <option value="active">Active & Authorized</option>
                <option value="suspended">Suspended (Blocked)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={editUserData.email}
                onChange={(e) =>
                  setEditUserData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={editUserData.phoneNumber}
                onChange={(e) =>
                  setEditUserData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              {processing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RESET PASSWORD */}
      <Modal
        isOpen={isResetPassModalOpen}
        onClose={() => setIsResetPassModalOpen(false)}
        title="Reset User Password"
        subtitle={`Set a new temporary or permanent password for ${selectedUser?.displayName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs">
            <p className="font-bold">Resetting password for @{selectedUser?.username}</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              The user can use this password to immediately log in via the login modal or portal.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">New Password</label>
              <button
                type="button"
                onClick={() => setNewPasswordValue(generateRandomPassword(8))}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                Generate New
              </button>
            </div>
            <input
              type="text"
              required
              value={newPasswordValue}
              onChange={(e) => setNewPasswordValue(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden bg-slate-50"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsResetPassModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              {processing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Apply New Password</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: BULK PROVISION LOGINS */}
      <Modal
        isOpen={isBulkGenModalOpen}
        onClose={() => setIsBulkGenModalOpen(false)}
        title="Bulk Provision User Logins"
        subtitle="Automatically generate portal credentials for all registered students, teachers, or parents"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleBulkGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Group</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'STUDENTS', label: 'Students', icon: '🎒', desc: `${students.length} Learners` },
                { id: 'TEACHERS', label: 'Teachers', icon: '📚', desc: `${teachers.length} Staff` },
                { id: 'PARENTS', label: 'Parents', icon: '👨‍👩‍👧', desc: 'Guardians' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setBulkTarget(item.id as any);
                    if (item.id === 'STUDENTS') setBulkDefaultPass('Student@123');
                    else if (item.id === 'TEACHERS') setBulkDefaultPass('Teacher@123');
                    else setBulkDefaultPass('Parent@123');
                  }}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                    bulkTarget === item.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className="text-[10px] text-slate-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {bulkTarget === 'STUDENTS' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Filter by Class / Grade</label>
              <select
                value={bulkClassFilter}
                onChange={(e) => setBulkClassFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden font-medium"
              >
                <option value="ALL">All Grades (Full School)</option>
                <option value="Playgroup">Playgroup</option>
                <option value="PP1">PP1</option>
                <option value="PP2">PP2</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7 (JSS)</option>
                <option value="Grade 8">Grade 8 (JSS)</option>
                <option value="Grade 9">Grade 9 (JSS)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Default Temporary Password
            </label>
            <input
              type="text"
              required
              value={bulkDefaultPass}
              onChange={(e) => setBulkDefaultPass(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden bg-slate-50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Learners and parents can use this password to sign in to their respective portals.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBulkGenModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              {processing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Run Bulk Provisioning</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: PRINT LOGIN SLIPS */}
      <Modal
        isOpen={isPrintSlipsOpen}
        onClose={() => setIsPrintSlipsOpen(false)}
        title="Printable User Login Credential Slips"
        subtitle="Standardized cards with QR scan and login details for learners, teachers, and parents"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <p className="text-xs text-slate-500">
              Showing {filteredUsers.length} printable login credential cards. Press Print to print on standard A4 paper.
            </p>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Print All Cards</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-2">
            {filteredUsers.slice(0, 24).map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl p-4 border border-slate-300 shadow-2xs flex flex-col justify-between space-y-3 print:border-slate-800 print:break-inside-avoid"
              >
                {/* School Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 font-serif">
                      {settings.schoolName || 'UWEZO ELITE SCHOOL'}
                    </h4>
                    <p className="text-[10px] text-slate-500">Student & Staff Portal Credential Slip</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {user.role}
                  </span>
                </div>

                {/* Account Details */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Full Name:</span>
                    <strong className="text-slate-900">{user.displayName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Username:</span>
                    <strong className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                      {user.username || user.id}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Password:</span>
                    <strong className="font-mono text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded">
                      {user.password || 'Admin@123'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Portal URL:</span>
                    <span className="text-slate-600 font-mono text-[10px]">uwezoeliteschool.ac.ke/portal</span>
                  </div>
                </div>

                {/* Notice */}
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                  Keep this credential slip confidential. Change default password upon first login.
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
