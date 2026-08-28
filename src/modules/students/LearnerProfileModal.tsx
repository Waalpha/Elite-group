import React, { useState } from 'react';
import {
  X,
  User,
  GraduationCap,
  CalendarCheck,
  Wallet,
  FileText,
  ShieldAlert,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Heart,
  Award,
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Student, FeePayment, AttendanceRecord } from '../../types';
import { StudentBiodataPrint } from '../../components/print/StudentBiodataPrint';
import { FeeStatementPrint } from '../../components/print/FeeStatementPrint';

interface LearnerProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onPrintID?: (student: Student) => void;
  onRecordFee?: (student: Student) => void;
  onPrintBiodata?: (student: Student) => void;
  onPrintFeeStatement?: (student: Student) => void;
}

type TabKey = 'OVERVIEW' | 'ACADEMIC' | 'ATTENDANCE' | 'FEES' | 'DOCUMENTS' | 'DISCIPLINE' | 'COMMUNICATION';

export const LearnerProfileModal: React.FC<LearnerProfileModalProps> = ({
  student,
  isOpen,
  onClose,
  onPrintID,
  onRecordFee,
  onPrintBiodata,
  onPrintFeeStatement,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('OVERVIEW');
  const [newNote, setNewNote] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [isBiodataPrintOpen, setIsBiodataPrintOpen] = useState(false);
  const [isStatementPrintOpen, setIsStatementPrintOpen] = useState(false);
  const [sentMessages, setSentMessages] = useState<
    { id: string; date: string; recipient: string; message: string; status: string }[]
  >([
    {
      id: 'msg-1',
      date: '2025-08-20 09:30 AM',
      recipient: student?.parentPhone || '+254712345678',
      message: 'Dear Parent, Term 1 mid-term assessment reports are ready on the Uwezo Elite School portal.',
      status: 'DELIVERED',
    },
    {
      id: 'msg-2',
      date: '2025-08-10 02:15 PM',
      recipient: student?.parentPhone || '+254712345678',
      message: 'UWEZO ELITE SCHOOL: Fee payment received with thanks. Receipt REC-2025-8812.',
      status: 'DELIVERED',
    },
  ]);

  const [disciplineRecords, setDisciplineRecords] = useState<
    { id: string; date: string; type: 'COMMENDATION' | 'DISCIPLINE'; title: string; notes: string; staff: string }[]
  >([
    {
      id: 'd-1',
      date: '2025-08-18',
      type: 'COMMENDATION',
      title: 'Mathematics Olympiad 1st Runner Up',
      notes: 'Demonstrated exceptional problem-solving in the regional Junior CBC Math challenge.',
      staff: 'Mr. David Mutua (HOD STEM)',
    },
    {
      id: 'd-2',
      date: '2025-08-04',
      type: 'COMMENDATION',
      title: 'School Cleanliness & Environmental Care',
      notes: 'Active leadership in the Uwezo Environmental Club tree planting initiative.',
      staff: 'Madam Sarah Mwangi',
    },
  ]);

  if (!isOpen || !student) return null;

  const handleSendSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsMessage.trim()) return;
    setSentMessages([
      {
        id: `msg-${Date.now()}`,
        date: new Date().toLocaleString(),
        recipient: student.parentPhone || '+254712345678',
        message: smsMessage,
        status: 'SENT',
      },
      ...sentMessages,
    ]);
    setSmsMessage('');
  };

  const handleAddDiscipline = (type: 'COMMENDATION' | 'DISCIPLINE') => {
    if (!newNote.trim()) return;
    setDisciplineRecords([
      {
        id: `d-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type,
        title: type === 'COMMENDATION' ? 'Institutional Merit / Award' : 'Behavioral Observation Note',
        notes: newNote,
        staff: 'Administrator',
      },
      ...disciplineRecords,
    ]);
    setNewNote('');
  };

  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'OVERVIEW', label: 'Overview', icon: User },
    { key: 'ACADEMIC', label: 'Academic & CBC', icon: GraduationCap },
    { key: 'ATTENDANCE', label: 'Attendance', icon: CalendarCheck },
    { key: 'FEES', label: 'Fees & Invoicing', icon: Wallet },
    { key: 'DOCUMENTS', label: 'Documents', icon: FileText },
    { key: 'DISCIPLINE', label: 'Commendations', icon: ShieldAlert },
    { key: 'COMMUNICATION', label: 'Communication', icon: MessageSquare },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Card */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 border-2 border-emerald-400/40 text-white flex items-center justify-center font-serif text-2xl font-bold uppercase shrink-0 shadow-md">
              {student.firstName[0]}
              {student.lastName[0]}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {student.firstName} {student.middleName ? `${student.middleName} ` : ''}
                  {student.lastName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {student.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {student.gender}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300 font-medium">
                <span>
                  Adm No: <strong className="text-white font-mono">{student.admissionNumber}</strong>
                </span>
                <span>
                  NEMIS UPI: <strong className="text-white font-mono">{student.nemisUpi || 'UPI-PENDING'}</strong>
                </span>
                <span>
                  Grade:{' '}
                  <strong className="text-emerald-300 font-semibold">
                    {(student.grade || student.gradeLevel || 'GRADE_1').replace('_', ' ')} • Stream {student.stream || 'East'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Quick Action in Header */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0">
              <button
                onClick={() => {
                  if (onPrintBiodata) onPrintBiodata(student);
                  else setIsBiodataPrintOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                title="Print Official Learner Biodata Sheet on A4 Paper"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Print A4 Biodata</span>
              </button>

              <button
                onClick={() => {
                  if (onPrintFeeStatement) onPrintFeeStatement(student);
                  else setIsStatementPrintOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                title="Print Fee Statement & Ledger on A4 Paper"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Print Statement</span>
              </button>

              {onPrintID && (
                <button
                  onClick={() => onPrintID(student)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ID Badge</span>
                </button>
              )}
              {onRecordFee && (
                <button
                  onClick={() => onRecordFee(student)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Record Fee</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Biodata & Identifiers */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    Biodata & National Identifiers
                  </h3>
                  <div className="space-y-2 text-slate-700 divide-y divide-slate-100">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Date of Birth:</span>
                      <span className="font-semibold text-slate-900">{student.dob}</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Birth Certificate No:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {student.birthCertificateNo || 'BC-6638192'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Admission Date:</span>
                      <span className="font-semibold text-slate-900">{student.admissionDate}</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Residential Address:</span>
                      <span className="font-semibold text-slate-900">{student.address || 'Nairobi, Kenya'}</span>
                    </div>
                  </div>
                </div>

                {/* Parent / Guardian Contacts */}
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    Parent & Guardian Information
                  </h3>
                  <div className="space-y-2 text-slate-700 divide-y divide-slate-100">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Guardian Name:</span>
                      <span className="font-semibold text-slate-900">{student.parentName}</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Primary Phone:</span>
                      <span className="font-mono font-semibold text-emerald-700">{student.parentPhone}</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Email Address:</span>
                      <span className="font-semibold text-slate-900">{student.parentEmail || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-500">Emergency Phone:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {student.emergencyContact || student.parentPhone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health & Transport Route */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <h3 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Heart className="w-4 h-4 text-amber-600" />
                    Medical Notes & Allergies
                  </h3>
                  <p className="text-slate-800">
                    {student.medicalConditions && student.medicalConditions !== 'None'
                      ? student.medicalConditions
                      : 'No chronic allergies or medical conditions on record. Routine health certified.'}
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium">Blood Group: O+ • Emergency hospital: MP Shah Nairobi</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <h3 className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Transport Route & Dropoff
                  </h3>
                  <p className="text-slate-800 font-semibold">
                    Route 3 - Westlands / Parklands (Bus KDA 240B)
                  </p>
                  <p className="text-[11px] text-emerald-700">Driver: Jackson Mwangi • Morning Pickup: 06:45 AM</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC & CBC */}
          {activeTab === 'ACADEMIC' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">CBC Learning Areas Assessment (Term 1 2025)</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Exceeding Expectations (EE)
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                        <th className="pb-2">Learning Area</th>
                        <th className="pb-2">Formative Score</th>
                        <th className="pb-2">CBC Rubric Performance</th>
                        <th className="pb-2 text-right">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      <tr>
                        <td className="py-2.5 font-semibold">Mathematics & Logic</td>
                        <td className="py-2.5 font-bold text-emerald-700">88%</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                            Exceeding Expectations (EE)
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-slate-500">Superb analytical skills</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-semibold">English Language & Literacy</td>
                        <td className="py-2.5 font-bold text-emerald-700">82%</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                            Meeting Expectations (ME)
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-slate-500">Fluent comprehension</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-semibold">Kiswahili & Insha</td>
                        <td className="py-2.5 font-bold text-emerald-700">79%</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                            Meeting Expectations (ME)
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-slate-500">Good vocabulary</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-semibold">Science & Technology</td>
                        <td className="py-2.5 font-bold text-emerald-700">91%</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                            Exceeding Expectations (EE)
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-slate-500">Outstanding STEM project</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-slate-600 font-semibold text-[11px]">Term 1 Attendance</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">98.4%</p>
                  <p className="text-[10px] text-emerald-700">62 of 63 Sessions Present</p>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-slate-600 font-semibold text-[11px]">On-Time Rate</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">96.8%</p>
                  <p className="text-[10px] text-blue-700">Punctual roll call</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-slate-600 font-semibold text-[11px]">Excused Absences</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">1 Day</p>
                  <p className="text-[10px] text-amber-700">Medical note verified</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Recent Attendance Activity</h4>
                <div className="space-y-1.5">
                  {['2025-08-28', '2025-08-27', '2025-08-26', '2025-08-25', '2025-08-22'].map((d, i) => (
                    <div key={d} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-slate-700">
                      <span className="font-mono">{d}</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Present (07:45 AM)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEES & INVOICING */}
          {activeTab === 'FEES' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Outstanding Fee Balance</p>
                  <p className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
                    KES {(student.feeBalance || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500">Term 1 2025/2026 Invoiced</p>
                </div>
                {onRecordFee && (
                  <button
                    onClick={() => onRecordFee(student)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-xs cursor-pointer"
                  >
                    Record Payment
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900">Fee Statement & Payment Receipts</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[10px] uppercase">
                        <th className="pb-2">Receipt</th>
                        <th className="pb-2">Method / Ref</th>
                        <th className="pb-2">Amount (KES)</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 font-mono font-bold text-slate-900">REC-2025-8812</td>
                        <td className="py-2.5">
                          <span className="font-mono text-[11px] text-slate-600">MPESA: QJH9284KZ</span>
                        </td>
                        <td className="py-2.5 font-bold text-emerald-700">KES 22,000</td>
                        <td className="py-2.5 text-slate-500">2025-08-10</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                            SUCCESS
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <FileText className="w-6 h-6 text-emerald-600" />
                  <p className="font-bold text-slate-900">Birth Certificate</p>
                  <p className="text-[10px] text-slate-500">Verified official copy on file</p>
                  <button className="text-xs text-emerald-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <p className="font-bold text-slate-900">NEMIS Admission Letter</p>
                  <p className="text-[10px] text-slate-500">Ministry of Education UPI record</p>
                  <button className="text-xs text-blue-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                  <p className="font-bold text-slate-900">Medical / Immunization Record</p>
                  <p className="text-[10px] text-slate-500">Certified health report</p>
                  <button className="text-xs text-purple-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DISCIPLINE & COMMENDATIONS */}
          {activeTab === 'DISCIPLINE' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record an award, merit, or observational note..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddDiscipline('COMMENDATION')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  + Add Merit
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDiscipline('DISCIPLINE')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  + Note
                </button>
              </div>

              <div className="space-y-2.5">
                {disciplineRecords.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border ${
                      item.type === 'COMMENDATION'
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-amber-50/70 border-amber-200'
                    } space-y-1`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.type === 'COMMENDATION'
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] text-slate-500">{item.date}</span>
                    </div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-slate-700">{item.notes}</p>
                    <p className="text-[10px] text-slate-500 pt-1">Logged by: {item.staff}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: COMMUNICATION */}
          {activeTab === 'COMMUNICATION' && (
            <div className="space-y-4">
              <form onSubmit={handleSendSMS} className="space-y-2">
                <label className="block font-bold text-slate-800">
                  Send Instant SMS / Notification to Parent ({student.parentPhone})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Type SMS broadcast or update to parent..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send SMS</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Communication History</h4>
                <div className="space-y-2">
                  {sentMessages.map((msg) => (
                    <div key={msg.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-600">{msg.recipient}</span>
                        <span className="text-slate-400">{msg.date}</span>
                      </div>
                      <p className="text-slate-800">{msg.message}</p>
                      <div className="flex justify-end">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                          {msg.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Uwezo Elite School • CBC Integrated ERP Dossier
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>

      {/* Render A4 Print Modals */}
      {isBiodataPrintOpen && (
        <StudentBiodataPrint
          student={student}
          isOpen={isBiodataPrintOpen}
          onClose={() => setIsBiodataPrintOpen(false)}
        />
      )}

      {isStatementPrintOpen && (
        <FeeStatementPrint
          student={student}
          isOpen={isStatementPrintOpen}
          onClose={() => setIsStatementPrintOpen(false)}
        />
      )}
    </div>
  );
};
