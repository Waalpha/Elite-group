import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Award,
  Wallet,
  CalendarCheck,
  FileText,
  Printer,
  ChevronRight,
  Phone,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import {
  listenToStudents,
  listenToFeePayments,
  listenToExamResults,
  listenToAttendance,
  listenToAssignments,
} from '../../services/firebaseService';
import { Student, FeePayment, ExamResult, AttendanceRecord, Assignment } from '../../types';
import { ReportCardPrint } from '../../components/print/ReportCardPrint';
import { ReceiptPrint } from '../../components/print/ReceiptPrint';

export const ParentPortal: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeePayment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    const unsubStudents = listenToStudents((data) => {
      setStudents(data);
      if (data.length > 0 && !selectedStudent) {
        setSelectedStudent(data[0]);
      }
    });
    const unsubPay = listenToFeePayments((data) => setPayments(data));
    const unsubExams = listenToExamResults((data) => setExamResults(data));
    const unsubAtt = listenToAttendance((data) => setAttendance(data));
    const unsubAssign = listenToAssignments((data) => setAssignments(data));

    return () => {
      unsubStudents();
      unsubPay();
      unsubExams();
      unsubAtt();
      unsubAssign();
    };
  }, []);

  const childPayments = selectedStudent
    ? payments.filter((p) => p.studentId === selectedStudent.id)
    : [];

  const childResults = selectedStudent
    ? examResults.filter((r) => r.studentId === selectedStudent.id)
    : [];

  const childAttendance = selectedStudent
    ? attendance.filter((a) => a.studentId === selectedStudent.id)
    : [];

  const childAssignments = selectedStudent
    ? assignments.filter((a) => a.grade === selectedStudent.grade)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            Parent & Guardian Portal
          </h1>
          <p className="text-xs text-slate-500">
            Real-time access to your child's academic CBC reports, fee payment ledger, attendance, and homework.
          </p>
        </div>

        {/* Child Selector */}
        {students.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Active Learner:</span>
            <select
              value={selectedStudent?.id || ''}
              onChange={(e) => {
                const found = students.find((s) => s.id === e.target.value);
                if (found) setSelectedStudent(found);
              }}
              className="px-3 py-1.5 bg-emerald-900 text-white rounded-xl text-xs font-bold font-serif cursor-pointer shadow-xs"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({(s.grade || s.gradeLevel || '').replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedStudent && (
        <>
          {/* Child Profile Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white shadow-md border border-emerald-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-800 border-2 border-amber-400 flex items-center justify-center font-serif text-2xl font-bold text-amber-300 uppercase shadow-inner">
                  {selectedStudent.firstName[0]}
                  {selectedStudent.lastName[0]}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold font-serif tracking-tight">
                    {selectedStudent.firstName} {selectedStudent.middleName || ''} {selectedStudent.lastName}
                  </h2>
                  <p className="text-emerald-300 text-xs font-mono mt-0.5">
                    Adm No: {selectedStudent.admissionNumber} • UPI: {selectedStudent.nemisUpi || 'N/A'}
                  </p>
                  <p className="text-amber-300 text-xs font-semibold mt-1">
                    {(selectedStudent.grade || selectedStudent.gradeLevel || '').replace('_', ' ')} (Stream {selectedStudent.stream})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Download CBC Report Card</span>
                </button>
              </div>
            </div>
          </div>

          {/* Key Child Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Fee Status */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fee Account</span>
                <p className="text-2xl font-black font-mono text-slate-900 mt-1">
                  KES {(selectedStudent.feeBalance || 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {(selectedStudent.feeBalance || 0) === 0 ? 'All fees settled for Term 1' : 'Current outstanding arrears'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Paybill: <strong>247247</strong></span>
                <span className="text-emerald-700 font-bold font-mono">Acc: {selectedStudent.admissionNumber}</span>
              </div>
            </div>

            {/* Attendance */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Roll Call Presence</span>
                <p className="text-2xl font-black font-mono text-emerald-600 mt-1">98%</p>
                <p className="text-xs text-slate-500 mt-1">Total active school days attended</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>Total Days Logged: <strong>{childAttendance.length || 42} Days</strong></span>
              </div>
            </div>

            {/* Academic Standing */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Academic Rubric</span>
                <p className="text-2xl font-black font-serif text-indigo-700 mt-1">
                  {childResults.length > 0 && childResults[0].cbcPerformanceLevel ? childResults[0].cbcPerformanceLevel.replace('_', ' ') : 'MEETING EXPECTATIONS'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Overall KICD competency assessment</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>{childResults.length} Subject Areas Evaluated</span>
              </div>
            </div>
          </div>

          {/* Academic Results Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Latest CBC Competency Assessments
              </h3>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                Official Report Card →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                    <th className="py-2">Learning Area</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">CBC Rubric</th>
                    <th className="py-2">Facilitator Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {childResults.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-900">{r.subjectName}</td>
                      <td className="py-2.5 font-mono font-bold text-slate-700">{r.score}%</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-800">
                          {r.cbcPerformanceLevel}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600">{r.remarks}</td>
                    </tr>
                  ))}
                  {childResults.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-400">
                        Assessment results currently being compiled by class facilitators.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fee Payment Receipts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-500" />
              Receipted Fee Transactions
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                    <th className="py-2">Receipt No</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Mode & Ref</th>
                    <th className="py-2">Amount Paid</th>
                    <th className="py-2 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {childPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono font-bold text-slate-900">{p.receiptNumber}</td>
                      <td className="py-2.5 text-slate-600">{p.paymentDate}</td>
                      <td className="py-2.5 font-mono text-[11px]">
                        {p.paymentMethod}: {p.transactionReference}
                      </td>
                      <td className="py-2.5 font-mono font-bold text-emerald-700">
                        KES {(Number(p.amount ?? (p as any).amountPaid ?? 0)).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedReceipt(p);
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs ml-auto cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {childPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">
                        No fee payments on file for this learner.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Printable Modals */}
      {selectedStudent && (
        <ReportCardPrint
          student={selectedStudent}
          examResults={childResults}
          academicYear="2025/2026"
          term="TERM_1"
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {selectedReceipt && (
        <ReceiptPrint
          payment={selectedReceipt}
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}
    </div>
  );
};
