import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  GraduationCap,
  Download,
  CreditCard,
  Edit2,
  Trash2,
  Eye,
  ArrowRight,
  Printer,
  ChevronDown,
  Phone,
  Mail,
  UserCheck,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { StudentIDCardPrint } from '../../components/print/StudentIDCardPrint';
import { StudentBiodataPrint } from '../../components/print/StudentBiodataPrint';
import { FeeStatementPrint } from '../../components/print/FeeStatementPrint';
import { LearnerProfileModal } from './LearnerProfileModal';
import {
  listenToStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  promoteStudent,
} from '../../services/firebaseService';
import { Student, GradeLevel, StreamName, Gender, StudentStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const GRADE_OPTIONS: { label: string; value: GradeLevel }[] = [
  { label: 'Playgroup (Ages 2-3)', value: 'PLAYGROUP' },
  { label: 'PP1 - Pre-Primary 1 (Ages 4)', value: 'PP1' },
  { label: 'PP2 - Pre-Primary 2 (Ages 5)', value: 'PP2' },
  { label: 'Grade 1 (Lower Primary)', value: 'GRADE_1' },
  { label: 'Grade 2 (Lower Primary)', value: 'GRADE_2' },
  { label: 'Grade 3 (Lower Primary)', value: 'GRADE_3' },
  { label: 'Grade 4 (Middle Primary)', value: 'GRADE_4' },
  { label: 'Grade 5 (Middle Primary)', value: 'GRADE_5' },
  { label: 'Grade 6 (Middle Primary / KPSEA)', value: 'GRADE_6' },
  { label: 'Grade 7 (Junior Secondary / JSS)', value: 'GRADE_7' },
  { label: 'Grade 8 (Junior Secondary / JSS)', value: 'GRADE_8' },
  { label: 'Grade 9 (Junior Secondary / KJSEA)', value: 'GRADE_9' },
];

const STREAM_OPTIONS: StreamName[] = ['EAST', 'WEST', 'NORTH', 'SOUTH'];

export const StudentsModule: React.FC = () => {
  const { currentUser, isAdmin, isTeacher, isRegistrar } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [streamFilter, setStreamFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isPrintIDModalOpen, setIsPrintIDModalOpen] = useState(false);
  const [isBiodataModalOpen, setIsBiodataModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [idCardsToPrint, setIdCardsToPrint] = useState<Student[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<Student>>({
    admissionNumber: '',
    nemisUpi: '',
    birthCertificateNo: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'MALE',
    dob: '2016-01-01',
    grade: 'GRADE_1',
    stream: 'EAST',
    admissionDate: new Date().toISOString().split('T')[0],
    parentName: '',
    parentPhone: '+2547',
    parentEmail: '',
    parentNationalId: '',
    address: 'Nairobi, Kenya',
    emergencyContact: '',
    medicalConditions: 'None',
    status: 'ACTIVE',
    feeBalance: 0,
  });

  // Promote form state
  const [promoteGrade, setPromoteGrade] = useState<GradeLevel>('GRADE_2');
  const [promoteStream, setPromoteStream] = useState<StreamName>('EAST');
  const [promoteReason, setPromoteReason] = useState('End of Academic Year Progression');

  useEffect(() => {
    const unsub = listenToStudents((data) => {
      setStudents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = [...students];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          (s.firstName || '').toLowerCase().includes(q) ||
          (s.lastName || '').toLowerCase().includes(q) ||
          (s.admissionNumber || '').toLowerCase().includes(q) ||
          (s.nemisUpi && s.nemisUpi.toLowerCase().includes(q)) ||
          (s.parentPhone || '').includes(q) ||
          (s.parentName || '').toLowerCase().includes(q)
      );
    }

    if (gradeFilter !== 'ALL') {
      result = result.filter((s) => s.grade === gradeFilter);
    }

    if (streamFilter !== 'ALL') {
      result = result.filter((s) => s.stream === streamFilter);
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((s) => s.status === statusFilter);
    }

    setFilteredStudents(result);
  }, [students, search, gradeFilter, streamFilter, statusFilter]);

  const handleOpenAddModal = () => {
    const nextNum = String(students.length + 101).padStart(4, '0');
    setFormData({
      admissionNumber: `UES-2025-${nextNum}`,
      nemisUpi: `UPI-${Math.floor(100000 + Math.random() * 900000)}`,
      birthCertificateNo: `BC-${Math.floor(1000000 + Math.random() * 9000000)}`,
      firstName: '',
      middleName: '',
      lastName: '',
      gender: 'MALE',
      dob: '2016-05-12',
      grade: 'GRADE_1',
      stream: 'EAST',
      admissionDate: new Date().toISOString().split('T')[0],
      parentName: '',
      parentPhone: '+254712000000',
      parentEmail: '',
      parentNationalId: '12345678',
      address: 'Nairobi, Kenya',
      emergencyContact: '+254722000000',
      medicalConditions: 'None',
      status: 'ACTIVE',
      feeBalance: 25000,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.admissionNumber) {
      alert('Please fill all required student details');
      return;
    }

    try {
      await addStudent({
        ...formData,
        feeBalance: Number(formData.feeBalance) || 0,
      } as Omit<Student, 'id' | 'createdAt' | 'updatedAt'>);
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(`Error saving student: ${err.message}`);
    }
  };

  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({ ...student });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      await updateStudent(selectedStudent.id, {
        ...formData,
        feeBalance: Number(formData.feeBalance) || 0,
      });
      setIsEditModalOpen(false);
      setSelectedStudent(null);
    } catch (err: any) {
      alert(`Error updating student: ${err.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;
    try {
      await deleteStudent(selectedStudent.id);
      setIsDeleteConfirmOpen(false);
      setSelectedStudent(null);
    } catch (err: any) {
      alert(`Error deleting student: ${err.message}`);
    }
  };

  const handleOpenPromote = (student: Student) => {
    setSelectedStudent(student);
    // Find next grade
    const sGrade = student.grade || student.currentClass;
    const currentIndex = GRADE_OPTIONS.findIndex((g) => g.value === sGrade);
    const nextGrade = currentIndex < GRADE_OPTIONS.length - 1 ? GRADE_OPTIONS[currentIndex + 1].value : sGrade;
    setPromoteGrade(nextGrade);
    setPromoteStream(student.stream);
    setPromoteReason('Academic Year 2025/2026 Progression');
    setIsPromoteModalOpen(true);
  };

  const handleExecutePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      await promoteStudent(selectedStudent.id, promoteGrade, promoteStream, promoteReason);
      setIsPromoteModalOpen(false);
      setSelectedStudent(null);
    } catch (err: any) {
      alert(`Error promoting learner: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Learner Directory & Enrolment
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive Kenyan CBC student records, NEMIS UPI identifiers, and biometric profiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="print-all-id-cards-btn"
            onClick={() => {
              if (filteredStudents.length > 0) {
                setIdCardsToPrint(filteredStudents);
                setIsPrintIDModalOpen(true);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
            title="Print A4 batch ID cards for filtered learners"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print All ID Cards (A4)</span>
          </button>

          {(isAdmin || isRegistrar) && (
            <button
              id="add-new-student-btn"
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Learner</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="student-search-input"
              type="text"
              placeholder="Search by name, Adm No, UPI, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
            />
          </div>

          {/* Grade Selector */}
          <div>
            <select
              id="student-grade-filter"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
            >
              <option value="ALL">All Grades (Playgroup - Grade 9)</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stream Selector */}
          <div>
            <select
              id="student-stream-filter"
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
            >
              <option value="ALL">All Streams (East / West)</option>
              {STREAM_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  Stream {st}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div>
            <select
              id="student-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Learners</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="GRADUATED">Graduated</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Count Pill */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> learners
          </span>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            NEMIS UPI Synchronized
          </span>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Adm No / UPI</th>
                <th className="py-3 px-4">Learner Name</th>
                <th className="py-3 px-4">Grade & Stream</th>
                <th className="py-3 px-4">Gender / DOB</th>
                <th className="py-3 px-4">Parent / Guardian</th>
                <th className="py-3 px-4">Fee Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition group">
                  {/* Adm No & UPI */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{s.admissionNumber}</span>
                    <span className="text-[10px] font-mono text-slate-400 block">{s.nemisUpi || 'UPI Pending'}</span>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                        {s.firstName[0]}
                        {s.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {s.firstName} {s.middleName ? `${s.middleName} ` : ''}{s.lastName}
                        </p>
                        <span className="text-[10px] text-slate-500">{s.medicalConditions !== 'None' ? `⚠️ ${s.medicalConditions}` : 'Standard Profile'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Grade & Stream */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-800 text-[11px]">
                      {(s.grade || s.gradeLevel || '').replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-medium">Stream {s.stream}</span>
                  </td>

                  {/* Gender / DOB */}
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-medium text-slate-800">{s.gender}</span>
                    <span className="text-[10px] text-slate-400 block">{s.dob}</span>
                  </td>

                  {/* Parent */}
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900">{s.parentName}</p>
                    <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-emerald-600" />
                      {s.parentPhone}
                    </p>
                  </td>

                  {/* Fee Balance */}
                  <td className="py-3 px-4">
                    <span
                      className={`font-mono font-bold ${
                        (s.feeBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      KES {(s.feeBalance || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'GRADUATED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                      {/* Quick View Button */}
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setIsProfileModalOpen(true);
                        }}
                        title="Open Learner Dossier & Quick View"
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 rounded-lg flex items-center gap-1.5 transition cursor-pointer border border-emerald-200/70 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Quick View</span>
                      </button>

                      {/* Print ID Card (Single) */}
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setIdCardsToPrint([s]);
                          setIsPrintIDModalOpen(true);
                        }}
                        title="Print A4 Student ID Card"
                        className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>

                      {/* Promote Student */}
                      {(isAdmin || isTeacher) && (
                        <button
                          onClick={() => handleOpenPromote(s)}
                          title="Promote / Transfer Learner"
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Edit */}
                      {(isAdmin || isRegistrar) && (
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          title="Edit Learner Information"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setIsDeleteConfirmOpen(true);
                          }}
                          title="Delete Student Record"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No learners match the specified search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll New Learner (Playgroup → Grade 9)"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          {/* Section 1: Academic & Identifiers */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-emerald-800">
              1. Institutional & NEMIS Identifiers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Number *</label>
                <input
                  type="text"
                  required
                  value={formData.admissionNumber}
                  onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NEMIS UPI Number</label>
                <input
                  type="text"
                  value={formData.nemisUpi}
                  onChange={(e) => setFormData({ ...formData, nemisUpi: e.target.value })}
                  placeholder="e.g. UPI-984210"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Birth Certificate No</label>
                <input
                  type="text"
                  value={formData.birthCertificateNo}
                  onChange={(e) => setFormData({ ...formData, birthCertificateNo: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grade Level *</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value as GradeLevel })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stream *</label>
                <select
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value as StreamName })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                >
                  {STREAM_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      Stream {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Date</label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Learner Biodata */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-emerald-800">
              2. Learner Biodata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical Conditions / Allergies</label>
                <input
                  type="text"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  placeholder="e.g. Asthma, Peanuts allergy, None"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Parent / Guardian Info */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-emerald-800">
              3. Parent / Guardian Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Phone (M-Pesa SMS) *</label>
                <input
                  type="tel"
                  required
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="+254712345678"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Email</label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  placeholder="parent@gmail.com"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">National ID / Passport</label>
                <input
                  type="text"
                  value={formData.parentNationalId}
                  onChange={(e) => setFormData({ ...formData, parentNationalId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opening Fee Balance (KES)</label>
                <input
                  type="number"
                  value={formData.feeBalance}
                  onChange={(e) => setFormData({ ...formData, feeBalance: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
            >
              Complete Enrollment
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Learner: ${selectedStudent?.firstName} ${selectedStudent?.lastName}`}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          {/* Section 1: Academic & Status */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-emerald-800">
              1. Enrolment & Identifiers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Number</label>
                <input
                  type="text"
                  value={formData.admissionNumber || ''}
                  onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NEMIS UPI</label>
                <input
                  type="text"
                  value={formData.nemisUpi || ''}
                  onChange={(e) => setFormData({ ...formData, nemisUpi: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Birth Certificate No</label>
                <input
                  type="text"
                  value={formData.birthCertificateNo || ''}
                  onChange={(e) => setFormData({ ...formData, birthCertificateNo: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grade Level *</label>
                <select
                  value={formData.grade || 'GRADE_1'}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value as GradeLevel })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stream *</label>
                <select
                  value={formData.stream || 'EAST'}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value as StreamName })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900"
                >
                  {STREAM_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      Stream {st}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Enrolment Status</label>
                <select
                  value={formData.status || 'ACTIVE'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="TRANSFERRED">TRANSFERRED</option>
                  <option value="GRADUATED">GRADUATED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Biodata */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-emerald-800">
              2. Learner Biodata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName || ''}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={formData.gender || 'MALE'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob || '2016-01-01'}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical Conditions / Allergies</label>
                <input
                  type="text"
                  value={formData.medicalConditions || 'None'}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Parent & Financials */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-emerald-800">
              3. Parent / Guardian & Billing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.parentName || ''}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Phone (M-Pesa SMS) *</label>
                <input
                  type="tel"
                  required
                  value={formData.parentPhone || ''}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Email</label>
                <input
                  type="email"
                  value={formData.parentEmail || ''}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent National ID</label>
                <input
                  type="text"
                  value={formData.parentNationalId || ''}
                  onChange={(e) => setFormData({ ...formData, parentNationalId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Balance (KES)</label>
                <input
                  type="number"
                  value={formData.feeBalance ?? 0}
                  onChange={(e) => setFormData({ ...formData, feeBalance: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-emerald-800"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            >
              Save Learner Updates
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Profile Overview Modal */}
      {selectedStudent && (
        <LearnerProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          student={selectedStudent}
          onPrintID={(st) => {
            setSelectedStudent(st);
            setIdCardsToPrint([st]);
            setIsPrintIDModalOpen(true);
          }}
          onPrintBiodata={(st) => {
            setSelectedStudent(st);
            setIsBiodataModalOpen(true);
          }}
          onPrintFeeStatement={(st) => {
            setSelectedStudent(st);
            setIsStatementModalOpen(true);
          }}
          onRecordFee={(st) => {
            setSelectedStudent(st);
            setIsProfileModalOpen(false);
          }}
        />
      )}

      {/* Promotion Workflow Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isPromoteModalOpen}
          onClose={() => setIsPromoteModalOpen(false)}
          title={`Promote / Transition Learner: ${selectedStudent.firstName} ${selectedStudent.lastName}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleExecutePromote} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
              <p className="font-semibold">
                Current Class: <strong>{(selectedStudent.grade || selectedStudent.gradeLevel || '').replace('_', ' ')} (Stream {selectedStudent.stream})</strong>
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Promoting will automatically update class rosters and preserve historical performance in the student dossier.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Grade Level *</label>
                <select
                  value={promoteGrade}
                  onChange={(e) => setPromoteGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Stream *</label>
                <select
                  value={promoteStream}
                  onChange={(e) => setPromoteStream(e.target.value as StreamName)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900"
                >
                  {STREAM_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      Stream {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transition Note / Reason</label>
                <input
                  type="text"
                  value={promoteReason}
                  onChange={(e) => setPromoteReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPromoteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
              >
                Execute Promotion
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Print Student ID Card Modal (Single or Bulk Batch) */}
      <StudentIDCardPrint
        students={idCardsToPrint.length > 0 ? idCardsToPrint : selectedStudent ? [selectedStudent] : filteredStudents.slice(0, 8)}
        isOpen={isPrintIDModalOpen}
        onClose={() => {
          setIsPrintIDModalOpen(false);
          setIdCardsToPrint([]);
        }}
      />

      {/* Print Official Learner Biodata Sheet Modal (A4) */}
      {selectedStudent && (
        <StudentBiodataPrint
          student={selectedStudent}
          isOpen={isBiodataModalOpen}
          onClose={() => setIsBiodataModalOpen(false)}
        />
      )}

      {/* Print Student Fee Statement Modal (A4) */}
      {selectedStudent && (
        <FeeStatementPrint
          student={selectedStudent}
          isOpen={isStatementModalOpen}
          onClose={() => setIsStatementModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Learner Record"
        message={`Are you sure you want to permanently delete learner record ${selectedStudent?.admissionNumber} (${selectedStudent?.firstName} ${selectedStudent?.lastName})? This action cannot be undone.`}
        confirmText="Yes, Delete Record"
        confirmVariant="danger"
      />
    </div>
  );
};
