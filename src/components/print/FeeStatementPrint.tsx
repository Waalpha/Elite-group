import React from 'react';
import { Student, SchoolSettings, FeePayment } from '../../types';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { printA4Element } from '../../utils/printA4';

interface FeeStatementPrintProps {
  student: Student | null;
  payments?: FeePayment[];
  settings?: SchoolSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const FeeStatementPrint: React.FC<FeeStatementPrintProps> = ({
  student,
  payments = [],
  settings,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    printA4Element('printable-fee-statement', {
      title: `Fee_Statement_${student.admissionNumber}_${student.firstName}_${student.lastName}`,
      orientation: 'portrait',
    });
  };

  const studentPayments = payments.filter(
    (p) => p.studentId === student.id || p.admissionNumber === student.admissionNumber
  );

  const totalPaid = studentPayments.reduce(
    (acc, p) => acc + (Number(p.amount) || Number((p as any).amountPaid) || 0),
    0
  );
  const feeBalance = student.feeBalance ?? Math.max(0, 35000 - totalPaid);
  const totalBilled = totalPaid + feeBalance;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Action Header */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Official Student Fee Statement (A4 Preview)</span>
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
              <span>Print A4 Statement</span>
            </button>
          </div>
        </div>

        {/* Scrollable Container for Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
          <div
            id="printable-fee-statement"
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
                {settings?.physicalLocation || 'Ruiru/Membley, Eastern Bypass, Nairobi Metro, Kenya'} • Tel: {settings?.phone || '+254 722 000 111'}
              </p>
              <div className="mt-2 inline-block bg-emerald-900 text-white px-4 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                OFFICIAL STUDENT FEE STATEMENT & FINANCIAL LEDGER
              </div>
            </div>

            {/* Learner Particulars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">Learner Name:</span>
                <span className="font-bold text-slate-900">{student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">Admission No:</span>
                <span className="font-bold text-slate-900 font-mono">{student.admissionNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">Grade & Stream:</span>
                <span className="font-bold text-slate-900">{(student.grade || (student as any).gradeLevel || '').replace('_', ' ')} - Stream {student.stream}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">NEMIS UPI:</span>
                <span className="font-bold font-mono text-emerald-800">{student.nemisUpi || 'UPI-REGISTERED'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">Parent / Guardian:</span>
                <span className="font-medium text-slate-900">{student.parentName || 'Parent'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">Contact Phone:</span>
                <span className="font-mono text-slate-900">{student.parentPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">Statement Date:</span>
                <span className="font-medium text-slate-900">{new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">Academic Year:</span>
                <span className="font-semibold text-slate-900">2025/2026 (Term 1)</span>
              </div>
            </div>

            {/* Balances Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Invoiced</span>
                <p className="text-sm font-black font-mono text-slate-900">KES {totalBilled.toLocaleString()}.00</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-800 uppercase font-semibold">Total Remitted</span>
                <p className="text-sm font-black font-mono text-emerald-700">KES {totalPaid.toLocaleString()}.00</p>
              </div>
              <div className={`p-3 rounded-lg border text-center ${feeBalance > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <span className={`text-[10px] uppercase font-semibold ${feeBalance > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                  Outstanding Balance
                </span>
                <p className={`text-sm font-black font-mono ${feeBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  KES {feeBalance.toLocaleString()}.00
                </p>
              </div>
            </div>

            {/* Invoiced Term Vote Heads */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1">
                Term 1 Vote Head Fee Breakdown
              </h4>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold">
                    <th className="border border-slate-300 px-3 py-1.5 text-left">Vote Head Description</th>
                    <th className="border border-slate-300 px-3 py-1.5 text-left">Category</th>
                    <th className="border border-slate-300 px-3 py-1.5 text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 font-medium">Tuition, Practical Instruction & Assessment</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-600">Core Academic</td>
                    <td className="border border-slate-300 px-3 py-1.5 font-mono text-right">18,000.00</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 font-medium">CBC Learning Resources & Digital Literacy Tools</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-600">Learning Materials</td>
                    <td className="border border-slate-300 px-3 py-1.5 font-mono text-right">4,500.00</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 font-medium">Nutritious Hot Mid-Day Lunch & Break Snack</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-600">Board & Catering</td>
                    <td className="border border-slate-300 px-3 py-1.5 font-mono text-right">7,500.00</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 font-medium">Co-curricular, Clubs & Physical Education</td>
                    <td className="border border-slate-300 px-3 py-1.5 text-slate-600">Activities</td>
                    <td className="border border-slate-300 px-3 py-1.5 font-mono text-right">5,000.00</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={2} className="border border-slate-300 px-3 py-2 text-right uppercase">
                      Total Invoiced for Term 1:
                    </td>
                    <td className="border border-slate-300 px-3 py-2 font-mono text-right text-slate-900 font-black">
                      KES 35,000.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payments Ledger History */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1">
                Remittance & Payment History
              </h4>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-emerald-950 text-white font-semibold text-[11px]">
                    <th className="border border-emerald-900 px-3 py-1.5 text-left">Receipt No</th>
                    <th className="border border-emerald-900 px-3 py-1.5 text-left">Date</th>
                    <th className="border border-emerald-900 px-3 py-1.5 text-left">Method & Reference</th>
                    <th className="border border-emerald-900 px-3 py-1.5 text-left">Received By</th>
                    <th className="border border-emerald-900 px-3 py-1.5 text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentPayments.length > 0 ? (
                    studentPayments.map((pay, i) => (
                      <tr key={pay.id || i}>
                        <td className="border border-slate-300 px-3 py-1.5 font-mono font-bold text-emerald-900">
                          {pay.receiptNumber || `REC-2025-${1000 + i}`}
                        </td>
                        <td className="border border-slate-300 px-3 py-1.5 text-slate-600">
                          {pay.paymentDate || '2025-02-15'}
                        </td>
                        <td className="border border-slate-300 px-3 py-1.5 text-slate-700">
                          {pay.paymentMethod} {pay.transactionReference ? `• ${pay.transactionReference}` : ''}
                        </td>
                        <td className="border border-slate-300 px-3 py-1.5 text-slate-600">
                          {pay.receivedBy || 'Bursar'}
                        </td>
                        <td className="border border-slate-300 px-3 py-1.5 font-mono font-bold text-slate-900 text-right">
                          {(Number(pay.amount) || Number((pay as any).amountPaid) || 0).toLocaleString()}.00
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="border border-slate-300 px-3 py-4 text-center text-slate-400 italic">
                        No payments recorded yet for the current period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Official School Sign-off & Stamp */}
            <div className="pt-3 border-t-2 border-slate-300 flex items-center justify-between text-[11px] text-slate-600">
              <div>
                <p className="font-bold text-slate-900">Bank & M-Pesa Remittance Channels:</p>
                <p className="text-[10px]">M-Pesa Paybill: <strong>247247</strong> • Account: <strong>UES-{student.admissionNumber}</strong></p>
                <p className="text-[10px]">Equity Bank A/C: <strong>0180293847291</strong> (Uwezo Elite School Fees)</p>
              </div>

              <div className="flex items-center gap-6 text-center">
                <div>
                  <div className="w-24 border-b border-slate-700 mb-1 h-6 flex items-end justify-center">
                    <span className="font-serif italic text-xs text-slate-700">CPA-K Ndungu</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">Finance Controller</span>
                </div>
                <div className="w-20 h-10 border-2 border-dashed border-emerald-900 rounded-md flex items-center justify-center text-[9px] font-bold text-emerald-950 uppercase">
                  Accounts Seal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
