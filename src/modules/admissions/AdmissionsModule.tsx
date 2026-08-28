import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Printer,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import {
  listenToApplications,
  addApplication,
  updateApplicationStatus,
  addStudent,
} from '../../services/firebaseService';
import { AdmissionApplication, GradeLevel } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const GRADE_LABELS: Record<string, string> = {
  PLAYGROUP: 'Playgroup',
  PP1: 'PP1 (Pre-Primary 1)',
  PP2: 'PP2 (Pre-Primary 2)',
  GRADE_1: 'Grade 1',
  GRADE_2: 'Grade 2',
  GRADE_3: 'Grade 3',
  GRADE_4: 'Grade 4',
  GRADE_5: 'Grade 5',
  GRADE_6: 'Grade 6',
  GRADE_7: 'Grade 7 (JSS)',
  GRADE_8: 'Grade 8 (JSS)',
  GRADE_9: 'Grade 9 (JSS)',
};

export const AdmissionsModule: React.FC = () => {
  const { currentUser, isAdmin, isRegistrar } = useAuth();
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [filtered, setFiltered] = useState<AdmissionApplication[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    applicantFirstName: '',
    applicantLastName: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    dob: '2018-04-10',
    gradeApplying: 'GRADE_1' as GradeLevel,
    parentName: '',
    parentPhone: '+2547',
    parentEmail: '',
    previousSchool: '',
    academicYear: '2025/2026',
    notes: '',
  });

  useEffect(() => {
    const unsub = listenToApplications((data) => setApplications(data));
    return () => unsub();
  }, []);

  useEffect(() => {
    let list = [...applications];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          (a.applicantFirstName || '').toLowerCase().includes(q) ||
          (a.applicantLastName || '').toLowerCase().includes(q) ||
          (a.parentName || '').toLowerCase().includes(q) ||
          (a.parentPhone || '').includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((a) => a.status === statusFilter);
    }
    setFiltered(list);
  }, [applications, search, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      applicantFirstName: '',
      applicantLastName: '',
      gender: 'MALE',
      dob: '2018-04-10',
      gradeApplying: 'GRADE_1',
      parentName: '',
      parentPhone: '+2547',
      parentEmail: '',
      previousSchool: '',
      academicYear: '2025/2026',
      notes: 'Prospective applicant for 2025 intake',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicantFirstName || !formData.applicantLastName || !formData.parentPhone) {
      alert('Please provide applicant name and parent phone');
      return;
    }
    try {
      await addApplication({
        ...formData,
        status: 'PENDING',
        targetTerm: 'TERM_1',
      } as any);
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(`Error saving application: ${err.message}`);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: AdmissionApplication['status']) => {
    try {
      await updateApplicationStatus(appId, newStatus);
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Convert accepted applicant to fully enrolled student
  const handleEnrollApplicant = async (app: AdmissionApplication) => {
    if (!confirm(`Enroll applicant ${app.applicantFirstName} ${app.applicantLastName} into Uwezo Elite School database?`)) return;

    try {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const admNo = `UES-2025-${randomNum}`;
      await addStudent({
        admissionNumber: admNo,
        nemisUpi: `UPI-${Math.floor(100000 + Math.random() * 900000)}`,
        birthCertificateNo: `BC-${Math.floor(1000000 + Math.random() * 9000000)}`,
        firstName: app.applicantFirstName,
        middleName: '',
        lastName: app.applicantLastName,
        gender: app.gender,
        dob: app.dob,
        grade: app.gradeApplying,
        stream: 'EAST',
        admissionDate: new Date().toISOString().split('T')[0],
        parentName: app.parentName,
        parentPhone: app.parentPhone,
        parentEmail: app.parentEmail || '',
        parentNationalId: '12345678',
        address: 'Nairobi, Kenya',
        emergencyContact: app.parentPhone,
        medicalConditions: 'None',
        status: 'ACTIVE',
        feeBalance: 32000,
      });

      await updateApplicationStatus(app.id, 'ENROLLED');
      alert(`Successfully enrolled! Assigned Admission Number: ${admNo}`);
    } catch (err: any) {
      alert(`Error enrolling applicant: ${err.message}`);
    }
  };

  const handlePrintLetter = (app: AdmissionApplication) => {
    setSelectedApp(app);
    setIsLetterModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-emerald-600" />
            Admissions & Student Intake
          </h1>
          <p className="text-xs text-slate-500">
            Process candidate applications, interview scheduling, acceptance letters, and official enrollment into Uwezo Elite School.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Application / Inquiry</span>
        </button>
      </div>

      {/* Pipeline Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Pending Review', count: applications.filter((a) => a.status === 'PENDING').length, color: 'bg-amber-50 text-amber-900 border-amber-200' },
          { label: 'Interview Booked', count: applications.filter((a) => a.status === 'INTERVIEW_SCHEDULED').length, color: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
          { label: 'Accepted', count: applications.filter((a) => a.status === 'ACCEPTED').length, color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
          { label: 'Enrolled to School', count: applications.filter((a) => a.status === 'ENROLLED').length, color: 'bg-blue-50 text-blue-900 border-blue-200' },
          { label: 'Declined', count: applications.filter((a) => a.status === 'REJECTED').length, color: 'bg-rose-50 text-rose-900 border-rose-200' },
        ].map((item, idx) => (
          <div key={idx} className={`p-3 rounded-xl border ${item.color} flex flex-col justify-between`}>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            <span className="text-2xl font-black font-serif mt-1">{item.count}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, parent phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="ENROLLED">Enrolled</option>
            <option value="REJECTED">Declined</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Applicant Name</th>
                <th className="py-3 px-4">Grade Applying</th>
                <th className="py-3 px-4">Parent / Contact</th>
                <th className="py-3 px-4">Previous School</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">
                      {app.applicantFirstName} {app.applicantLastName}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {app.gender} • DOB: {app.dob}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-block font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                      {GRADE_LABELS[app.gradeApplying] || app.gradeApplying}
                    </span>
                    <span className="block text-[10px] text-slate-500">{app.academicYear} Intake</span>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">{app.parentName}</p>
                    <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-emerald-600" />
                      {app.parentPhone}
                    </p>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {app.previousSchool || 'New Entry (EYE)'}
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                        app.status === 'ENROLLED'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : app.status === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : app.status === 'INTERVIEW_SCHEDULED'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <option value="PENDING">Pending Review</option>
                      <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="ENROLLED">Enrolled</option>
                      <option value="REJECTED">Declined</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handlePrintLetter(app)}
                        title="Generate Official Admission Offer Letter"
                        className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Offer Letter</span>
                      </button>

                      {app.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleEnrollApplicant(app)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Enroll to School</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No admission applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Application Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Admission Application / Inquiry"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveApp} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Applicant First Name *</label>
              <input
                type="text"
                required
                value={formData.applicantFirstName}
                onChange={(e) => setFormData({ ...formData, applicantFirstName: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Applicant Last Name *</label>
              <input
                type="text"
                required
                value={formData.applicantLastName}
                onChange={(e) => setFormData({ ...formData, applicantLastName: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">DOB</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grade Applying *</label>
              <select
                value={formData.gradeApplying}
                onChange={(e) => setFormData({ ...formData, gradeApplying: e.target.value as any })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              >
                {Object.entries(GRADE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parent Phone (M-Pesa SMS) *</label>
              <input
                type="tel"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parent Email</label>
              <input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Previous School Attended</label>
              <input
                type="text"
                value={formData.previousSchool}
                onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                placeholder="e.g. St. Jude Academy"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Save Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Official Admission Letter Modal */}
      {selectedApp && (
        <Modal
          isOpen={isLetterModalOpen}
          onClose={() => setIsLetterModalOpen(false)}
          title="Printable Official Admission Letter"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Letter (A4)</span>
              </button>
            </div>

            {/* A4 Letter Paper View */}
            <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-lg text-slate-900 text-xs font-sans leading-relaxed space-y-4 printable-doc">
              {/* Letter Header with Seal */}
              <div className="text-center border-b-2 border-emerald-900 pb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950 flex items-center justify-center text-amber-400 font-serif font-black text-xl border-2 border-amber-400">
                    UES
                  </div>
                  <div>
                    <h1 className="text-xl font-black font-serif uppercase tracking-tight text-emerald-950">
                      Uwezo Elite School
                    </h1>
                    <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest">
                      Excellence • Integrity • Innovation
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  P.O. Box 45892-00100 Nairobi, Kenya • Tel: +254 700 000 000 • Email: admissions@uwezoelite.ac.ke
                </p>
                <p className="text-[10px] font-mono text-emerald-800 mt-1">
                  Ministry of Education Reg No: MOE/PRI/2024/098 • KNEC Centre Code: 204581
                </p>
              </div>

              {/* Date & Ref */}
              <div className="flex justify-between font-mono text-[11px] pt-2">
                <span>Ref: UES/ADM/2025/{selectedApp.id.slice(0, 6).toUpperCase()}</span>
                <span>Date: {new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              {/* Addressee */}
              <div className="space-y-0.5">
                <p className="font-bold">To: Mr./Mrs. {selectedApp.parentName}</p>
                <p className="text-slate-600">Parent/Guardian to: <strong>{selectedApp.applicantFirstName} {selectedApp.applicantLastName}</strong></p>
                <p className="text-slate-600">Contact: {selectedApp.parentPhone}</p>
              </div>

              {/* Subject */}
              <div className="py-1 border-b border-slate-200">
                <p className="font-bold font-serif text-sm uppercase text-emerald-950 underline text-center">
                  RE: LETTER OF ADMISSION & OFFER OF PLACE IN {GRADE_LABELS[selectedApp.gradeApplying] || selectedApp.gradeApplying} (ACADEMIC YEAR {selectedApp.academicYear})
                </p>
              </div>

              {/* Body Content */}
              <p>
                We are pleased to inform you that following your application and subsequent academic review, <strong>{selectedApp.applicantFirstName} {selectedApp.applicantLastName}</strong> has been offered a place at <strong>Uwezo Elite School</strong> in <strong>{GRADE_LABELS[selectedApp.gradeApplying] || selectedApp.gradeApplying}</strong> for the upcoming academic session.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                <p className="font-bold text-slate-800">Key Admission Conditions & Requirements:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  <li>Submission of official Birth Certificate copy and previous school assessment reports.</li>
                  <li>Payment of Admission & First Term Tuition fee to School Paybill <strong>247247</strong> (Account: <strong>{selectedApp.applicantFirstName}</strong>).</li>
                  <li>Reporting Date: First day of Term 1, 2025 at 7:30 AM in complete official school uniform.</li>
                </ul>
              </div>

              <p>
                We take immense pride in fostering holistic competency-based development, spiritual values, and academic excellence. Please confirm acceptance by settling the initial commitment fee within fourteen (14) days.
              </p>

              {/* Signatures */}
              <div className="pt-6 flex justify-between items-end border-t border-slate-200">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 pb-8 text-[11px] font-bold">
                    <span className="font-serif italic text-emerald-900">Dr. Mary Wanjiku</span>
                  </div>
                  <p className="font-bold text-[10px] mt-1 text-slate-900">Principal / Head Teacher</p>
                  <p className="text-[9px] text-slate-500">Uwezo Elite School</p>
                </div>

                <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center text-[9px] text-emerald-800 font-bold uppercase text-center p-1">
                  Official Institutional Seal
                </div>

                <div className="text-center">
                  <div className="w-32 border-b border-slate-800 pb-8 text-[11px] font-bold">
                    <span className="font-serif italic text-emerald-900">Peter Omondi</span>
                  </div>
                  <p className="font-bold text-[10px] mt-1 text-slate-900">Registrar of Admissions</p>
                  <p className="text-[9px] text-slate-500">Uwezo Elite School</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
