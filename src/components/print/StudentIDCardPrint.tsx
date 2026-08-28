import React, { useState } from 'react';
import { Student, SchoolSettings } from '../../types';
import { Printer, CreditCard, X } from 'lucide-react';
import { printA4Element } from '../../utils/printA4';

interface StudentIDCardPrintProps {
  students: Student[];
  settings?: SchoolSettings;
  isOpen?: boolean;
  onClose?: () => void;
}

export const StudentIDCardPrint: React.FC<StudentIDCardPrintProps> = ({
  students,
  settings,
  isOpen = true,
  onClose,
}) => {
  const [layoutMode, setLayoutMode] = useState<'single' | 'sheet'>('single');

  if (isOpen === false || students.length === 0) return null;

  const handlePrint = () => {
    printA4Element('printable-id-cards', {
      title: `Student_ID_Cards_${students.length}_Learners`,
      orientation: 'portrait',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Control Bar */}
        <div className="no-print sticky top-0 z-50 bg-slate-900 text-white px-5 py-3.5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Official Student ID Card Generator (A4 Print Preview)</h3>
            <span className="bg-emerald-800 text-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {students.length} {students.length === 1 ? 'Card' : 'Cards'} Selected
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-slate-800 rounded-xl p-0.5 border border-slate-700 flex text-xs">
              <button
                onClick={() => setLayoutMode('single')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  layoutMode === 'single' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Single Card
              </button>
              <button
                onClick={() => setLayoutMode('sheet')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  layoutMode === 'sheet' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                A4 Bulk Grid (4 Cards/Sheet)
              </button>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm cursor-pointer transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 ID Cards</span>
            </button>
          </div>
        </div>

        {/* Cards Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
          <div id="printable-id-cards" className="max-w-4xl mx-auto">
            <div
              className={
                layoutMode === 'sheet'
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                  : 'flex flex-col items-center gap-6'
              }
            >
              {students.map((student) => {
                const fullName = `${student.firstName} ${student.middleName ? `${student.middleName} ` : ''}${student.lastName}`;
                const gradeName = (student.grade || (student as any).gradeLevel || '').replace('_', ' ');

                return (
                  <div
                    key={student.id}
                    className="w-[360px] h-[225px] bg-linear-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl shadow-xl border-2 border-amber-400/50 p-3.5 relative overflow-hidden flex flex-col justify-between break-inside-avoid"
                  >
                    {/* Background watermark badge */}
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none flex items-center justify-center font-serif text-5xl font-black text-white/5">
                      UES
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-xs font-serif shadow-sm">
                          UES
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black tracking-wider uppercase font-serif text-amber-300">
                            {settings?.schoolName || 'UWEZO ELITE SCHOOL'}
                          </h4>
                          <p className="text-[7.5px] text-slate-300 uppercase tracking-widest font-semibold">
                            Official Student Identification Card
                          </p>
                        </div>
                      </div>
                      <span className="text-[8.5px] bg-emerald-700/90 text-emerald-100 px-2 py-0.5 rounded-md font-mono border border-emerald-500/40">
                        AY 2025/2026
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex items-center gap-3 my-auto">
                      {/* Photo */}
                      <div className="w-18 h-22 rounded-xl overflow-hidden border-2 border-amber-400/80 bg-slate-800 shrink-0 shadow-md">
                        <img
                          src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=60'}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-xs min-w-0 flex-1">
                        <div>
                          <span className="text-[8px] text-amber-300/90 block uppercase font-bold">Learner Name</span>
                          <h5 className="font-bold text-white text-xs tracking-tight truncate">
                            {fullName}
                          </h5>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
                          <div>
                            <span className="text-slate-400 block text-[7.5px] uppercase font-semibold">Adm No:</span>
                            <span className="font-mono font-bold text-amber-300">{student.admissionNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[7.5px] uppercase font-semibold">Class:</span>
                            <span className="font-semibold text-white">{gradeName} - {student.stream}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[7.5px] uppercase font-semibold">NEMIS UPI:</span>
                            <span className="font-mono text-emerald-200 text-[8px] truncate block">{student.nemisUpi || 'UPI-REG'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[7.5px] uppercase font-semibold">Gender / Blood:</span>
                            <span className="font-semibold text-white">{student.gender} • {student.bloodGroup || 'O+'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/15 pt-1.5 flex items-center justify-between text-[8.5px] text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white p-0.5 rounded-sm flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                              `UES:${student.admissionNumber}:${fullName}`
                            )}`}
                            alt={`QR Code ${student.admissionNumber}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <span className="text-[7.5px] text-slate-400 block">Emergency Line:</span>
                          <span className="font-semibold text-amber-300 font-mono text-[8.5px]">
                            {student.parentPhone || settings?.phone || '+254 722 000 111'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[7.5px] text-slate-400 block">Principal Signature</span>
                        <span className="font-serif italic text-[9px] text-slate-200">
                          {settings?.principalName || 'Dr. Mwangi'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
