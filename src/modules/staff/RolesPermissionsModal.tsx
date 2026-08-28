import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Users,
  CheckCircle2,
  XCircle,
  Lock,
  Save,
  Plus,
  Trash2,
  Search,
  Key,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useSchoolSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, PermissionKey, PermissionDefinition, UserProfile } from '../../types';
import {
  listenToUsers,
  addUser,
  updateUser,
  deleteUser,
  firestoreService,
} from '../../services/firebaseService';

const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Students
  { key: 'students:view', label: 'View Learners', description: 'Browse student list, profiles, and basic details', category: 'Students' },
  { key: 'students:create', label: 'Register Learners', description: 'Create and register new student records', category: 'Students' },
  { key: 'students:edit', label: 'Edit Learners', description: 'Update student demographics, medical, and parent info', category: 'Students' },
  { key: 'students:delete', label: 'Delete Learners', description: 'Remove or archive student records', category: 'Students' },
  { key: 'admissions:manage', label: 'Manage Admissions', description: 'Review online applications, approve, and enroll', category: 'Students' },

  // Academics & Exams
  { key: 'attendance:view', label: 'View Attendance', description: 'View daily student & staff attendance registers', category: 'Academics & Exams' },
  { key: 'attendance:record', label: 'Mark Attendance & QR Kiosk', description: 'Take class attendance and operate QR scanner kiosk', category: 'Academics & Exams' },
  { key: 'academics:view', label: 'View Curriculum & Timetables', description: 'Browse CBC strands, subjects, and master timetables', category: 'Academics & Exams' },
  { key: 'academics:manage', label: 'Manage Classes & Strands', description: 'Create classes, streams, and curriculum subjects', category: 'Academics & Exams' },
  { key: 'exams:view', label: 'View Gradebook & Results', description: 'Inspect assessment scores and analytics', category: 'Academics & Exams' },
  { key: 'exams:enter_marks', label: 'Enter & Edit Marks', description: 'Input CBC formative ratings and summative scores', category: 'Academics & Exams' },
  { key: 'exams:publish', label: 'Publish & Print Report Cards', description: 'Finalize CBC summative report cards and transcripts', category: 'Academics & Exams' },

  // Finance
  { key: 'finance:view', label: 'View Fee Balances', description: 'View student fee accounts, fee structures, and summaries', category: 'Finance' },
  { key: 'finance:collect', label: 'Record Fee Payments', description: 'Enter cash, M-Pesa, or Bank fee receipts and generate invoices', category: 'Finance' },
  { key: 'finance:manage_structures', label: 'Manage Fee Structures', description: 'Create and adjust tuition, boarding, and activity levies', category: 'Finance' },

  // Staff & HR
  { key: 'staff:view', label: 'View Staff Directory', description: 'Browse teacher profiles, qualifications, and contacts', category: 'Staff & HR' },
  { key: 'staff:create', label: 'Add Faculty & Staff', description: 'Hire and onboard new teachers and non-teaching personnel', category: 'Staff & HR' },
  { key: 'staff:edit', label: 'Edit Staff Details', description: 'Modify TSC number, classes, and specialization', category: 'Staff & HR' },
  { key: 'staff:suspend', label: 'Suspend / Reactivate Staff', description: 'Enforce disciplinary suspension or reinstate faculty', category: 'Staff & HR' },
  { key: 'staff:delete', label: 'Delete Staff Records', description: 'Permanently remove staff records from system', category: 'Staff & HR' },

  // Facilities & Operations
  { key: 'facilities:manage', label: 'Manage Facilities', description: 'Oversee Library books, Inventory store, and Transport fleet', category: 'Facilities' },
  { key: 'announcements:manage', label: 'Publish Announcements', description: 'Broadcast school notices to parents, teachers, and students', category: 'Facilities' },

  // System & CMS
  { key: 'settings:manage', label: 'Manage School Settings', description: 'Configure school logo, MOE codes, and term dates', category: 'System & CMS' },
  { key: 'website:manage', label: 'Control Public Website CMS', description: 'Edit homepage hero, admissions banner, news, and testimonials', category: 'System & CMS' },
  { key: 'audit:view', label: 'View Security Audit Logs', description: 'Inspect timestamped user action and transaction logs', category: 'System & CMS' },
];

const CATEGORIES: ('Students' | 'Academics & Exams' | 'Finance' | 'Staff & HR' | 'Facilities' | 'System & CMS')[] = [
  'Students',
  'Academics & Exams',
  'Finance',
  'Staff & HR',
  'Facilities',
  'System & CMS',
];

interface RolesPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolesPermissionsModal: React.FC<RolesPermissionsModalProps> = ({ isOpen, onClose }) => {
  const { rolePermissions, updateRolePermission } = useSchoolSettings();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'matrix' | 'users'>('matrix');
  const [selectedRole, setSelectedRole] = useState<UserRole>('TEACHER');
  const [currentPerms, setCurrentPerms] = useState<PermissionKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // User Accounts State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserProfile | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [showPasswordsMap, setShowPasswordsMap] = useState<Record<string, boolean>>({});

  const [newUserForm, setNewUserForm] = useState({
    displayName: '',
    username: '',
    password: '',
    email: '',
    phoneNumber: '+254 7',
    role: 'TEACHER' as UserRole,
    status: 'active' as 'active' | 'suspended' | 'inactive',
  });

  // Sync selected role permissions
  useEffect(() => {
    const config = rolePermissions.find((r) => r.role === selectedRole);
    if (config) {
      setCurrentPerms(config.permissions);
    } else {
      setCurrentPerms([]);
    }
  }, [selectedRole, rolePermissions]);

  // Listen to Users
  useEffect(() => {
    const unsub = listenToUsers((data) => {
      setUsers(data);
    });
    return () => unsub();
  }, []);

  const handleTogglePermission = (key: PermissionKey) => {
    setCurrentPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSelectAll = (category?: string) => {
    if (category) {
      const catKeys = ALL_PERMISSIONS.filter((p) => p.category === category).map((p) => p.key);
      const allSelected = catKeys.every((k) => currentPerms.includes(k));
      if (allSelected) {
        setCurrentPerms((prev) => prev.filter((k) => !catKeys.includes(k)));
      } else {
        setCurrentPerms((prev) => Array.from(new Set([...prev, ...catKeys])));
      }
    } else {
      const allKeys = ALL_PERMISSIONS.map((p) => p.key);
      if (currentPerms.length === allKeys.length) {
        setCurrentPerms([]);
      } else {
        setCurrentPerms(allKeys);
      }
    }
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      await updateRolePermission(selectedRole, currentPerms);
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaving(false);
      alert(`Error updating role permissions: ${err.message}`);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUser(userId, { role: newRole });
    } catch (err: any) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'inactive') => {
    try {
      await updateUser(userId, { status: newStatus });
    } catch (err: any) {
      alert(`Failed to update user status: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user account "${userName}"? This cannot be undone.`)) {
      try {
        await deleteUser(userId);
      } catch (err: any) {
        alert(`Error deleting user: ${err.message}`);
      }
    }
  };

  const handleOpenResetPassword = (user: UserProfile) => {
    setSelectedUserForReset(user);
    setNewPasswordValue('Uwezo@2025');
    setIsResetPassModalOpen(true);
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset || !newPasswordValue.trim()) return;
    try {
      await updateUser(selectedUserForReset.id, {
        password: newPasswordValue.trim(),
        updatedAt: new Date().toISOString(),
      });
      alert(`Password for @${selectedUserForReset.username || selectedUserForReset.displayName} successfully updated to: ${newPasswordValue.trim()}`);
      setIsResetPassModalOpen(false);
      setSelectedUserForReset(null);
    } catch (err: any) {
      alert(`Failed to update password: ${err.message}`);
    }
  };

  const toggleShowPassword = (userId: string) => {
    setShowPasswordsMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.displayName || !newUserForm.email) {
      alert('Please fill in user name and email.');
      return;
    }

    const defaultUsername = newUserForm.username.trim() || newUserForm.displayName.toLowerCase().replace(/\s+/g, '.');
    const defaultPassword = newUserForm.password.trim() || 'Admin@123';

    try {
      await addUser({
        ...newUserForm,
        username: defaultUsername,
        password: defaultPassword,
        createdBy: currentUser?.id || 'super-admin',
        createdAt: new Date().toISOString(),
      });
      alert(`User account created successfully!\nUsername: ${defaultUsername}\nPassword: ${defaultPassword}`);
      setIsAddUserModalOpen(false);
      setNewUserForm({
        displayName: '',
        username: '',
        password: '',
        email: '',
        phoneNumber: '+254 7',
        role: 'TEACHER',
        status: 'active',
      });
    } catch (err: any) {
      alert(`Failed to create user: ${err.message}`);
    }
  };

  const selectedRoleConfig = rolePermissions.find((r) => r.role === selectedRole);

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Role-Based Access Control (RBAC) & User Permissions"
      size="5xl"
    >
      <div className="space-y-5 text-slate-800">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-2.5 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'matrix'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Role Permissions Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2.5 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts & Role Assignments ({users.length})</span>
          </button>
        </div>

        {/* TAB 1: Role Permissions Matrix */}
        {activeTab === 'matrix' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Roles Selector (Left Sidebar) */}
            <div className="md:col-span-4 bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1.5 max-h-[520px] overflow-y-auto">
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2 mb-2">
                System User Roles
              </p>
              {rolePermissions.map((rp) => {
                const isSelected = selectedRole === rp.role;
                return (
                  <button
                    key={rp.role}
                    onClick={() => setSelectedRole(rp.role)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{rp.roleTitle || rp.role.replace('_', ' ')}</p>
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {rp.permissions.length} active permissions
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Permissions Checklists (Right Panel) */}
            <div className="md:col-span-8 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 max-h-[520px] overflow-y-auto">
              {/* Header for Selected Role */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    {selectedRoleConfig?.roleTitle || selectedRole}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedRoleConfig?.description || 'Assign granular access capabilities to this role.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAll()}
                    className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    {currentPerms.length === ALL_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Matrix'}</span>
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Permissions successfully updated for {selectedRoleConfig?.roleTitle}!</span>
                </div>
              )}

              {/* Grouped Permissions */}
              <div className="space-y-4">
                {CATEGORIES.map((cat) => {
                  const catPerms = ALL_PERMISSIONS.filter((p) => p.category === cat);
                  const isAllCatSelected = catPerms.every((p) => currentPerms.includes(p.key));

                  return (
                    <div key={cat} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                          {cat}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectAll(cat)}
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold"
                        >
                          {isAllCatSelected ? 'Clear Category' : 'Select Category'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catPerms.map((perm) => {
                          const isChecked = currentPerms.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs transition cursor-pointer ${
                                isChecked
                                  ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 font-medium'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/60'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePermission(perm.key)}
                                className="mt-0.5 w-3.5 h-3.5 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                              />
                              <div className="min-w-0 flex-1 leading-tight">
                                <p className="font-bold text-[11px]">{perm.label}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{perm.description}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: User Accounts & Role Assignments */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* User Search & Add User Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add User Account</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3">User & Contact</th>
                      <th className="px-4 py-3">Login Username</th>
                      <th className="px-4 py-3">Password Credentials</th>
                      <th className="px-4 py-3">Assigned Role</th>
                      <th className="px-4 py-3">Account Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => {
                      const isShowingPass = showPasswordsMap[user.id] || false;
                      const userPass = user.password || 'Admin@123';
                      const userUname = user.username || user.displayName.toLowerCase().replace(/\s+/g, '.');

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                                {(user.displayName || 'U')[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{user.displayName || 'Unnamed User'}</p>
                                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                                {user.phoneNumber && (
                                  <p className="text-[10px] text-slate-400">{user.phoneNumber}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Login Username */}
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/80">
                              @{userUname}
                            </span>
                          </td>

                          {/* Password Credentials */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                                {isShowingPass ? userPass : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleShowPassword(user.id)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition cursor-pointer"
                                title={isShowingPass ? 'Hide password' : 'Show password'}
                              >
                                {isShowingPass ? '👁️' : '🔒'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenResetPassword(user)}
                                className="px-2 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition cursor-pointer"
                                title="Reset user password"
                              >
                                Reset
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <select
                              value={user.role}
                              onChange={(e) => handleUserRoleChange(user.id, e.target.value as UserRole)}
                              className="px-2 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            >
                              {rolePermissions.map((rp) => (
                                <option key={rp.role} value={rp.role}>
                                  {rp.roleTitle || rp.role.replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-3">
                            <select
                              value={user.status || 'active'}
                              onChange={(e) =>
                                handleUserStatusChange(
                                  user.id,
                                  e.target.value as 'active' | 'suspended' | 'inactive'
                                )
                              }
                              className={`px-2 py-1 text-xs font-bold rounded-lg border focus:outline-hidden ${
                                user.status === 'suspended'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : user.status === 'inactive'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <option value="active">Active (Full Access)</option>
                              <option value="suspended">Suspended (Access Blocked)</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteUser(user.id, user.displayName)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          No users found matching search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {isResetPassModalOpen && selectedUserForReset && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                Reset Password for {selectedUserForReset.displayName}
              </h3>
              <p className="text-xs text-slate-500">
                Super Admin: assign a new login password for username{' '}
                <strong className="text-slate-900 font-mono">@{selectedUserForReset.username || selectedUserForReset.displayName}</strong>.
              </p>

              <form onSubmit={handleConfirmResetPassword} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">New Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uwezo@2025"
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-sm font-semibold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetPassModalOpen(false);
                      setSelectedUserForReset(null);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                Add New System User Account & Credentials
              </h3>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tr. Beatrice Wanjiku"
                    value={newUserForm.displayName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const suggestedUname = name.toLowerCase().trim().replace(/\s+/g, '.');
                      setNewUserForm({
                        ...newUserForm,
                        displayName: name,
                        username: newUserForm.username ? newUserForm.username : suggestedUname,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Login Username *</label>
                    <input
                      type="text"
                      placeholder="e.g. teacher.wanjiku"
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Login Password *</label>
                    <input
                      type="text"
                      placeholder="e.g. Pass@123"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. beatrice@uwezoelite.ac.ke"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+254 722 000 000"
                    value={newUserForm.phoneNumber}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Assigned Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                    >
                      {rolePermissions.map((rp) => (
                        <option key={rp.role} value={rp.role}>
                          {rp.roleTitle || rp.role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status</label>
                    <select
                      value={newUserForm.status}
                      onChange={(e) =>
                        setNewUserForm({
                          ...newUserForm,
                          status: e.target.value as 'active' | 'suspended' | 'inactive',
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-xs"
                  >
                    Create User & Credentials
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
