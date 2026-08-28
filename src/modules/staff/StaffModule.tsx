import React, { useState, useEffect } from 'react';
import {
  UserCheck2,
  Search,
  Plus,
  Phone,
  Mail,
  Award,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Ban,
  RotateCcw,
  Key,
  DollarSign,
  Calendar,
  Filter,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import {
  listenToTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  suspendTeacher,
  reactivateTeacher,
} from '../../services/firebaseService';
import { Teacher, GradeLevel, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { RolesPermissionsModal } from './RolesPermissionsModal';

const AVAILABLE_GRADES: { id: GradeLevel; label: string }[] = [
  { id: 'PLAYGROUP', label: 'Playgroup' },
  { id: 'PP1', label: 'PP1 (Pre-Primary 1)' },
  { id: 'PP2', label: 'PP2 (Pre-Primary 2)' },
  { id: 'GRADE_1', label: 'Grade 1' },
  { id: 'GRADE_2', label: 'Grade 2' },
  { id: 'GRADE_3', label: 'Grade 3' },
  { id: 'GRADE_4', label: 'Grade 4' },
  { id: 'GRADE_5', label: 'Grade 5' },
  { id: 'GRADE_6', label: 'Grade 6' },
  { id: 'GRADE_7', label: 'Grade 7 (JSS)' },
  { id: 'GRADE_8', label: 'Grade 8 (JSS)' },
  { id: 'GRADE_9', label: 'Grade 9 (JSS)' },
];

export const StaffModule: React.FC = () => {
  const { isAdmin, currentUser } = useAuth();
  const [staffList, setStaffList] = useState<Teacher[]>([]);
  const [filtered, setFiltered] = useState<Teacher[]>([]);
  const [search, setSearch] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'TEACHERS' | 'JSS' | 'ADMIN' | 'SUSPENDED'>('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Teacher | null>(null);

  // Suspension Form State
  const [suspensionReason, setSuspensionReason] = useState('Administrative Review');
  const [suspensionNotes, setSuspensionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    tscNumber: '',
    nationalId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'FEMALE' as 'MALE' | 'FEMALE',
    qualification: '',
    specializationString: '',
    assignedGrades: [] as GradeLevel[],
    department: 'PRIMARY_ACADEMICS',
    role: 'TEACHER' as UserRole,
    status: 'ACTIVE' as 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'SUSPENDED',
    salary: 65000,
    notes: '',
  });

  useEffect(() => {
    const unsub = listenToTeachers((data) => setStaffList(data));
    return () => unsub();
  }, []);

  useEffect(() => {
    let list = [...staffList];

    // Tab filter
    if (activeTabFilter === 'TEACHERS') {
      list = list.filter((t) => (t.department || '').includes('ACADEMICS') || t.tscNumber);
    } else if (activeTabFilter === 'JSS') {
      list = list.filter((t) => t.department === 'JSS_ACADEMICS' || (t.assignedGrades || []).some((g) => ['GRADE_7', 'GRADE_8', 'GRADE_9'].includes(g)));
    } else if (activeTabFilter === 'ADMIN') {
      list = list.filter((t) => t.department === 'ADMINISTRATION' || t.role === 'PRINCIPAL' || t.role === 'DEPUTY_PRINCIPAL' || t.role === 'ACCOUNTANT');
    } else if (activeTabFilter === 'SUSPENDED') {
      list = list.filter((t) => t.status === 'SUSPENDED' || (t.status as string) === 'Suspended');
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.firstName || '').toLowerCase().includes(q) ||
          (t.lastName || '').toLowerCase().includes(q) ||
          (t.tscNumber && t.tscNumber.toLowerCase().includes(q)) ||
          (t.nationalId && t.nationalId.includes(q)) ||
          (t.phone || '').includes(q) ||
          (t.email || '').toLowerCase().includes(q)
      );
    }

    // Dropdown dept filter
    if (deptFilter !== 'ALL') {
      list = list.filter((t) => t.department === deptFilter);
    }

    setFiltered(list);
  }, [staffList, search, activeTabFilter, deptFilter]);

  const handleOpenAdd = () => {
    const randomTSC = `TSC-${Math.floor(100000 + Math.random() * 900000)}`;
    setFormData({
      tscNumber: randomTSC,
      nationalId: String(Math.floor(10000000 + Math.random() * 90000000)),
      firstName: '',
      lastName: '',
      email: '',
      phone: '+254 7',
      gender: 'FEMALE',
      qualification: 'B.Ed Science - Kenyatta University',
      specializationString: 'Integrated Science, Pre-Technical Studies',
      assignedGrades: ['GRADE_7', 'GRADE_8'],
      department: 'JSS_ACADEMICS',
      role: 'TEACHER',
      status: 'ACTIVE',
      salary: 65000,
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setSelectedStaff(teacher);
    setFormData({
      tscNumber: teacher.tscNumber || '',
      nationalId: teacher.nationalId || '',
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      gender: (teacher.gender as any) || 'FEMALE',
      qualification: teacher.qualification || '',
      specializationString: Array.isArray(teacher.specialization)
        ? (teacher.specialization as string[]).join(', ')
        : (teacher.specialization as string) || '',
      assignedGrades: (teacher.assignedGrades as GradeLevel[]) || [],
      department: (teacher.department as any) || 'PRIMARY_ACADEMICS',
      role: (teacher.role as UserRole) || 'TEACHER',
      status: (teacher.status as any) || 'ACTIVE',
      salary: teacher.salary || 65000,
      notes: teacher.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenSuspend = (teacher: Teacher) => {
    setSelectedStaff(teacher);
    setSuspensionReason(teacher.suspensionReason || 'Pending Administrative Review');
    setSuspensionNotes('');
    setIsSuspendModalOpen(true);
  };

  const handleOpenDelete = (teacher: Teacher) => {
    setSelectedStaff(teacher);
    setIsDeleteModalOpen(true);
  };

  const toggleGradeSelection = (grade: GradeLevel) => {
    setFormData((prev) => {
      const exists = prev.assignedGrades.includes(grade);
      return {
        ...prev,
        assignedGrades: exists
          ? prev.assignedGrades.filter((g) => g !== grade)
          : [...prev.assignedGrades, grade],
      };
    });
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      alert('Please enter staff name and phone number');
      return;
    }
    setIsProcessing(true);
    try {
      const specializations = formData.specializationString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await addTeacher({
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        tscNumber: formData.tscNumber,
        nationalId: formData.nationalId,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        qualification: formData.qualification,
        specialization: specializations,
        assignedGrades: formData.assignedGrades,
        department: formData.department,
        role: formData.role,
        status: formData.status,
        salary: Number(formData.salary || 0),
        notes: formData.notes,
        hireDate: new Date().toISOString().split('T')[0],
      });
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(`Error adding staff: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff?.id) return;
    setIsProcessing(true);
    try {
      const specializations = formData.specializationString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateTeacher(selectedStaff.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        tscNumber: formData.tscNumber,
        nationalId: formData.nationalId,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        qualification: formData.qualification,
        specialization: specializations,
        assignedGrades: formData.assignedGrades,
        department: formData.department,
        role: formData.role,
        status: formData.status,
        salary: Number(formData.salary || 0),
        notes: formData.notes,
      });
      setIsEditModalOpen(false);
      setSelectedStaff(null);
    } catch (err: any) {
      alert(`Error updating staff: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!selectedStaff?.id) return;
    setIsProcessing(true);
    try {
      await suspendTeacher(
        selectedStaff.id,
        suspensionNotes ? `${suspensionReason} - ${suspensionNotes}` : suspensionReason,
        currentUser
          ? {
              userId: currentUser.id,
              userName: currentUser.displayName,
              role: currentUser.role,
            }
          : undefined
      );
      setIsSuspendModalOpen(false);
      setSelectedStaff(null);
    } catch (err: any) {
      alert(`Error suspending staff member: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async (teacher: Teacher) => {
    if (confirm(`Reactivate and restore full active faculty status for ${teacher.firstName} ${teacher.lastName}?`)) {
      try {
        await reactivateTeacher(
          teacher.id,
          currentUser
            ? {
                userId: currentUser.id,
                userName: currentUser.displayName,
                role: currentUser.role,
              }
            : undefined
        );
      } catch (err: any) {
        alert(`Error reactivating staff: ${err.message}`);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStaff?.id) return;
    setIsProcessing(true);
    try {
      await deleteTeacher(selectedStaff.id);
      setIsDeleteModalOpen(false);
      setSelectedStaff(null);
    } catch (err: any) {
      alert(`Error deleting staff member: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats
  const totalCount = staffList.length;
  const activeCount = staffList.filter((s) => s.status === 'ACTIVE' || s.status === 'Active').length;
  const suspendedCount = staffList.filter((s) => s.status === 'SUSPENDED' || (s.status as string) === 'Suspended').length;
  const jssCount = staffList.filter((s) => s.department === 'JSS_ACADEMICS').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck2 className="w-6 h-6 text-emerald-600" />
            Teachers & Staff Faculty Management
          </h1>
          <p className="text-xs text-slate-500">
            Hire, edit, suspend, manage TSC credentials, assigned CBC grades, and assign access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsRolesModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Key className="w-4 h-4 text-amber-400" />
                <span>Roles & Permissions</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Teacher / Staff</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metric Cards Top Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <UserCheck2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">{totalCount}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase">Total Faculty</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">{activeCount}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase">Active In Duty</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">{jssCount}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase">JSS Specialists</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">{suspendedCount}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase">Suspended / Inactive</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'All Faculty & Staff' },
              { id: 'TEACHERS', label: 'Teachers (TSC)' },
              { id: 'JSS', label: 'Junior Secondary (JSS)' },
              { id: 'ADMIN', label: 'Administration' },
              { id: 'SUSPENDED', label: `Suspended (${suspendedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTabFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Department dropdown */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
          >
            <option value="ALL">All Departments</option>
            <option value="PRIMARY_ACADEMICS">Primary CBC Academics</option>
            <option value="JSS_ACADEMICS">Junior Secondary (JSS)</option>
            <option value="EARLY_YEARS">Early Childhood (EYE)</option>
            <option value="ADMINISTRATION">Administration & Bursary</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by faculty name, TSC number, national ID, phone, or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const isSuspended = t.status === 'SUSPENDED' || (t.status as string) === 'Suspended';
          const isOnLeave = t.status === 'ON_LEAVE' || (t.status as string) === 'On Leave';

          return (
            <div
              key={t.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs hover:shadow-md transition flex flex-col justify-between relative ${
                isSuspended ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {t.tscNumber || (t.nationalId ? `ID: ${t.nationalId}` : 'Direct Faculty')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        isSuspended
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isOnLeave
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isSuspended && <Ban className="w-2.5 h-2.5" />}
                      {t.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>

                {/* Suspension Banner if Suspended */}
                {isSuspended && (
                  <div className="mb-3 p-2 rounded-xl bg-rose-100/80 border border-rose-200 text-rose-900 text-[11px] space-y-0.5">
                    <p className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      Suspension Notice:
                    </p>
                    <p className="text-[10px] text-rose-800 pl-4">
                      {t.suspensionReason || 'Administrative disciplinary suspension active.'}
                    </p>
                  </div>
                )}

                {/* Name & Avatar */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl text-amber-300 flex items-center justify-center font-serif font-bold text-base shadow-xs shrink-0 ${
                      isSuspended
                        ? 'bg-slate-700'
                        : 'bg-gradient-to-br from-emerald-700 to-emerald-950'
                    }`}
                  >
                    {t.firstName?.[0] || 'T'}
                    {t.lastName?.[0] || 'S'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-slate-900 truncate">
                      {t.firstName} {t.lastName}
                    </h2>
                    <p className="text-[11px] text-slate-500 truncate">{t.qualification}</p>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-sm">
                      {t.role ? t.role.replace('_', ' ') : 'FACULTY'}
                    </span>
                  </div>
                </div>

                {/* Contact Box */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-mono">{t.phone}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{t.email}</span>
                  </p>
                </div>

                {/* Teaching Areas / Specialization */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Teaching Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(t.specialization) ? t.specialization : [t.specialization]).filter(Boolean).map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit, Suspend/Reactivate, Delete */}
              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  Assigned: {(t.assignedGrades || []).length} Grades
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Suspend / Reactivate Action */}
                  {isAdmin && (
                    <>
                      {isSuspended ? (
                        <button
                          type="button"
                          onClick={() => handleReactivate(t)}
                          title="Reactivate Staff"
                          className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reactivate</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenSuspend(t)}
                          title="Suspend Staff Member"
                          className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Ban className="w-3 h-3 text-rose-600" />
                          <span>Suspend</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* Edit Action */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(t)}
                    title="Edit Staff Member"
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Action */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(t)}
                      title="Delete Staff Member"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <UserCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No staff members found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or department filter.</p>
        </div>
      )}

      {/* MODAL 1: Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Teacher / Faculty Member"
        size="2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">TSC Number (Teachers)</label>
              <input
                type="text"
                value={formData.tscNumber}
                onChange={(e) => setFormData({ ...formData, tscNumber: e.target.value })}
                placeholder="TSC-123456"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">National ID / Passport</label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@uwezoelite.ac.ke"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              >
                <option value="PRIMARY_ACADEMICS">Primary CBC Academics</option>
                <option value="JSS_ACADEMICS">Junior Secondary (JSS)</option>
                <option value="EARLY_YEARS">Early Childhood (EYE)</option>
                <option value="ADMINISTRATION">Administration & Bursary</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              >
                <option value="TEACHER">Teacher</option>
                <option value="PRINCIPAL">Principal</option>
                <option value="DEPUTY_PRINCIPAL">Deputy Principal</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="REGISTRAR">Registrar</option>
                <option value="LIBRARIAN">Librarian</option>
                <option value="STOREKEEPER">Storekeeper</option>
                <option value="TRANSPORT_MANAGER">Transport Manager</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
              >
                <option value="ACTIVE">Active (On Duty)</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="RESIGNED">Resigned / Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Highest Academic Qualification</label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="e.g. B.Ed Arts (English/Literature) - University of Nairobi"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Subject Specializations (Comma Separated)
            </label>
            <input
              type="text"
              value={formData.specializationString}
              onChange={(e) => setFormData({ ...formData, specializationString: e.target.value })}
              placeholder="e.g. Mathematics, Integrated Science, Agriculture"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Assigned CBC Grades / Classes
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
              {AVAILABLE_GRADES.map((g) => {
                const isSelected = formData.assignedGrades.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGradeSelection(g.id)}
                    className={`p-1.5 text-[11px] rounded-lg text-left font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-3 h-3 rounded-xs text-emerald-600 pointer-events-none"
                    />
                    <span className="truncate">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isProcessing ? 'Adding...' : 'Save & Onboard Faculty'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Edit Staff Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Staff Details - ${selectedStaff?.firstName} ${selectedStaff?.lastName}`}
        size="2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">TSC Number</label>
              <input
                type="text"
                value={formData.tscNumber}
                onChange={(e) => setFormData({ ...formData, tscNumber: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">National ID</label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              >
                <option value="PRIMARY_ACADEMICS">Primary CBC Academics</option>
                <option value="JSS_ACADEMICS">Junior Secondary (JSS)</option>
                <option value="EARLY_YEARS">Early Childhood (EYE)</option>
                <option value="ADMINISTRATION">Administration & Bursary</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              >
                <option value="TEACHER">Teacher</option>
                <option value="PRINCIPAL">Principal</option>
                <option value="DEPUTY_PRINCIPAL">Deputy Principal</option>
                <option value="ACCOUNTANT">Accountant</option>
                <option value="REGISTRAR">Registrar</option>
                <option value="LIBRARIAN">Librarian</option>
                <option value="STOREKEEPER">Storekeeper</option>
                <option value="TRANSPORT_MANAGER">Transport Manager</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
              >
                <option value="ACTIVE">Active (On Duty)</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="RESIGNED">Resigned / Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Academic Qualification</label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Subject Specializations (Comma Separated)
            </label>
            <input
              type="text"
              value={formData.specializationString}
              onChange={(e) => setFormData({ ...formData, specializationString: e.target.value })}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Assigned CBC Grades / Classes
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
              {AVAILABLE_GRADES.map((g) => {
                const isSelected = formData.assignedGrades.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGradeSelection(g.id)}
                    className={`p-1.5 text-[11px] rounded-lg text-left font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-3 h-3 rounded-xs text-emerald-600 pointer-events-none"
                    />
                    <span className="truncate">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-xs"
            >
              {isProcessing ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Suspend Staff Modal */}
      <Modal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title="Suspend Faculty Member"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Suspend {selectedStaff?.firstName} {selectedStaff?.lastName}?
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Suspending will flag this account, remove active class attendance permissions, and document the administrative action in the audit log.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Suspension *</label>
            <select
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden"
            >
              <option value="Administrative Review">Administrative Review</option>
              <option value="Pending Disciplinary Hearing">Pending Disciplinary Hearing</option>
              <option value="Breach of School Policy / Code of Conduct">Breach of School Policy / Code of Conduct</option>
              <option value="TSC / Accreditation Credential Verification">TSC / Accreditation Credential Verification</option>
              <option value="Extended Unpaid Leave of Absence">Extended Unpaid Leave of Absence</option>
              <option value="Other Disciplinary Measures">Other Disciplinary Measures</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Additional Notes / Remarks</label>
            <textarea
              rows={3}
              value={suspensionNotes}
              onChange={(e) => setSuspensionNotes(e.target.value)}
              placeholder="e.g. Effective from March 1st pending board inquiry report..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSuspendModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSuspend}
              disabled={isProcessing}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Ban className="w-4 h-4" />
              <span>{isProcessing ? 'Suspending...' : 'Confirm Suspension'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Delete Staff Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Staff Record"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Permanently delete staff record?</p>
              <p className="text-[11px] text-rose-800 mt-1">
                You are about to delete <strong>{selectedStaff?.firstName} {selectedStaff?.lastName}</strong> ({selectedStaff?.tscNumber || 'Direct Faculty'}).
                This action is permanent and will remove associated teaching profiles.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isProcessing}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isProcessing ? 'Deleting...' : 'Confirm Delete'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: Roles & Permissions Matrix Modal */}
      <RolesPermissionsModal
        isOpen={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
      />
    </div>
  );
};
