import React from 'react';
import { Student, SchoolSettings } from '../../types';
import { Printer, X, User, QrCode } from 'lucide-react';
import { printA4Element } from '../../utils/printA4';

interface StudentBiodataPrintProps {
  student: Student | null;
  settings?: SchoolSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentBiodataPrint: React.FC<StudentBiodataPrintProps> = ({
  student,
  settings,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    printA4Element('printable-student-biodata', {
      title: `Learner_Dossier_${student.admissionNumber}_${student.firstName}_${student.lastName}`,
      orientation: 'portrait',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Official Learner Enrolment Profile & Biodata (A4 Preview)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Biodata</span>
            </button>
          </div>
        </div>

        {/* Sheet Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
          <div
            id="printable-student-biodata"
            className="max-w-[720px] mx-auto p-6 sm:p-8 bg-white border border-slate-300 shadow-md rounded-xl text-slate-900 text-xs font-sans space-y-4"
          >
            {/* School Header */}
            <div className="text-center border-b-2 border-emerald-950 pb-3">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 flex items-center justify-center text-amber-400 font-serif font-black text-xl border-2 border-amber-400">
                  UES
                </div>
                <div>
                  <h1 className="text-xl font-black font-serif uppercase tracking-tight text-emerald-950">
                    {settings?.schoolName || 'UWEZO ELITE SCHOOL'}
                  </h1>
                  <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest">
                    "{settings?.motto || 'Excellence in Character, Innovation and Leadership'}"
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-600">
                {settings?.physicalLocation || 'Ruiru/Membley, Nairobi Metro, Kenya'} • Tel: {settings?.phone || '+254 722 000 111'}
              </p>
              <div className="mt-2 inline-block bg-emerald-900 text-white px-4 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                CONFIDENTIAL LEARNER ADMISSION & BIODATA DOSSIER
              </div>
            </div>

            {/* Top Identity Section */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-emerald-800 bg-slate-200 shrink-0 shadow-sm">
                <img
                  src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=60'}
                  alt={student.firstName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Official Full Name</span>
                  <h2 className="text-lg font-black text-slate-900 font-serif">
                    {student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Admission Number</span>
                    <span className="font-mono font-black text-emerald-900">{student.admissionNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">NEMIS / UPI No</span>
                    <span className="font-mono font-bold text-slate-800">{student.nemisUpi || 'UPI-REGISTERED'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Birth Certificate</span>
                    <span className="font-mono font-bold text-slate-800">{student.birthCertificateNo || 'BC-VERIFIED'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Class / Grade</span>
                    <span className="font-bold text-slate-900">{(student.grade || (student as any).gradeLevel || '').replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Stream</span>
                    <span className="font-bold text-slate-900">Stream {student.stream}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Status</span>
                    <span className="font-bold text-emerald-800">{student.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demographic & Medical Details */}
            <div className="border border-slate-200 rounded-xl p-3 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b pb-1">
                Demographic & Medical Profile
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">Gender</span>
                  <span className="font-bold text-slate-800">{student.gender}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">Date of Birth</span>
                  <span className="font-bold text-slate-800">{student.dob}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">Admission Date</span>
                  <span className="font-bold text-slate-800">{student.admissionDate || '2025-01-08'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">Blood Group</span>
                  <span className="font-bold text-slate-800">{student.bloodGroup || 'O+'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">Residential Address</span>
                  <span className="font-semibold text-slate-800">{student.address || 'Membley Estate, Ruiru, Kenya'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">Special Medical / Allergy Notes</span>
                  <span className="font-semibold text-slate-800">{student.medicalConditions || 'None / Fit for physical curriculum'}</span>
                </div>
              </div>
            </div>

            {/* Parent & Guardian Contact Information */}
            <div className="border border-slate-200 rounded-xl p-3 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b pb-1">
                Parent & Emergency Contacts
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">Primary Guardian</span>
                  <span className="font-bold text-slate-900">{student.parentName || 'Parent Name'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">Primary Phone</span>
                  <span className="font-mono font-bold text-slate-900">{student.parentPhone}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">Email Address</span>
                  <span className="font-semibold text-slate-800">{student.parentEmail || 'parent@domain.com'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">Emergency Helpline</span>
                  <span className="font-mono font-bold text-emerald-800">{student.emergencyContact || student.emergencyContactPhone || student.parentPhone}</span>
                </div>
              </div>
            </div>

            {/* CBC Learning Pathways & Competencies */}
            <div className="border border-slate-200 rounded-xl p-3 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b pb-1">
                CBC Competency Enrollment & Electives
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[9px] text-slate-500 uppercase font-semibold block">Curriculum Tier</span>
                  <span className="font-bold text-emerald-950">Kenyan CBC (KICD Compliant)</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[9px] text-slate-500 uppercase font-semibold block">Languages Enrolled</span>
                  <span className="font-bold text-slate-800">English, Kiswahili, French</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[9px] text-slate-500 uppercase font-semibold block">Digital Literacy</span>
                  <span className="font-bold text-slate-800">ICT Lab / Robotics / Coding</span>
                </div>
              </div>
            </div>

            {/* Official Certification Footer */}
            <div className="pt-3 border-t-2 border-slate-300 flex items-center justify-between text-[11px] text-slate-600">
              <div className="space-y-1">
                <p className="font-bold text-slate-900">Registrar Certification:</p>
                <p className="text-[10px] text-slate-500">Certified true institutional record under Uwezo Elite School ERP registry.</p>
              </div>

              <div className="flex items-center gap-6 text-center">
                <div>
                  <div className="w-24 border-b border-slate-700 mb-1 h-6 flex items-end justify-center">
                    <span className="font-serif italic text-xs text-slate-700">A. K. Mutiso</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">Registrar of Admissions</span>
                </div>
                <div className="w-20 h-10 border-2 border-dashed border-emerald-900 rounded-md flex items-center justify-center text-[9px] font-bold text-emerald-950 uppercase">
                  School Seal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
