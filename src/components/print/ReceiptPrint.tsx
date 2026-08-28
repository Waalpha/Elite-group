import React from 'react';
import { FeePayment, SchoolSettings } from '../../types';
import { Printer, CheckCircle, X } from 'lucide-react';
import { printA4Element } from '../../utils/printA4';

interface ReceiptPrintProps {
  payment?: FeePayment | null;
  settings?: SchoolSettings;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ReceiptPrint: React.FC<ReceiptPrintProps> = ({
  payment,
  settings,
  isOpen = true,
  onClose,
}) => {
  if (isOpen === false || !payment) return null;

  const handlePrint = () => {
    printA4Element('printable-receipt', {
      title: `Official_Receipt_${payment.receiptNumber || 'REC'}`,
      orientation: 'portrait',
    });
  };

  const studentName = payment.studentName || (payment as any).payerName || 'Learner';
  const admissionNumber = payment.admissionNumber || 'ADM-PENDING';
  const gradeLevel = (payment.gradeLevel || (payment as any).grade || 'GRADE_1').replace('_', ' ');
  const amountNumber = Number(payment.amount ?? (payment as any).amountPaid ?? 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Action Bar (hidden in print) */}
        <div className="no-print sticky top-0 z-50 bg-slate-900 text-white px-5 py-3.5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Official Fee Payment Receipt (A4 Preview)</span>
          </div>
          <div className="flex items-center gap-2.5">
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
              <span>Print A4 Receipt</span>
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
          <div
            id="printable-receipt"
            className="max-w-[650px] mx-auto p-6 sm:p-8 border border-slate-300 shadow-md rounded-xl bg-white relative space-y-4"
          >
            {/* School Header */}
            <div className="text-center border-b-2 border-emerald-950 pb-3">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 flex items-center justify-center text-amber-400 font-serif font-black text-xl border-2 border-amber-400">
                  UES
                </div>
                <div>
                  <h2 className="text-xl font-black font-serif text-emerald-950 uppercase tracking-tight">
                    {settings?.schoolName || 'UWEZO ELITE SCHOOL'}
                  </h2>
                  <p className="text-xs italic text-amber-800 font-medium">
                    "{settings?.motto || 'Excellence in Character, Innovation and Leadership'}"
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-1">
                {settings?.physicalLocation || 'Ruiru/Membley, Nairobi Metro, Kenya'} | Tel: {settings?.phone || '+254 722 000 111'}
              </p>
              <div className="mt-2 inline-block bg-emerald-900 text-white px-4 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                OFFICIAL FEE PAYMENT RECEIPT
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Receipt Serial Number:</span>
                <span className="font-mono font-bold text-emerald-900 text-sm">{payment.receiptNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Payment Date & Time:</span>
                <span className="font-semibold text-slate-900">{payment.paymentDate || '2025-02-28'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Student Full Name:</span>
                <span className="font-bold text-slate-900">{studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Admission Number:</span>
                <span className="font-mono font-bold text-slate-900">{admissionNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Grade / Class Level:</span>
                <span className="font-semibold text-slate-900">{gradeLevel}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Academic Period:</span>
                <span className="font-semibold text-slate-900">{payment.term} • {payment.academicYear}</span>
              </div>
            </div>

            {/* Transaction particulars */}
            <div className="text-xs">
              <table className="w-full border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 font-semibold text-slate-700">
                    <th className="border border-slate-300 px-3 py-2 text-left">Description / Particulars</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Payment Mode & Ref</th>
                    <th className="border border-slate-300 px-3 py-2 text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-3 py-2.5 font-medium text-slate-800">
                      School Fees Payment ({payment.term} - {gradeLevel})
                    </td>
                    <td className="border border-slate-300 px-3 py-2.5 font-mono text-[11px] text-slate-600">
                      {payment.paymentMethod} • Ref: {payment.transactionReference || 'N/A'}
                    </td>
                    <td className="border border-slate-300 px-3 py-2.5 font-mono font-bold text-slate-900 text-right">
                      {amountNumber.toLocaleString()}.00
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={2} className="border border-slate-300 px-3 py-2 text-right uppercase">
                      Total Amount Received:
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-mono text-emerald-800 text-sm">
                      KES {amountNumber.toLocaleString()}.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payer info & Sign off */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 text-xs flex justify-between items-center">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-semibold">Paid By:</p>
                <p className="font-bold text-slate-900">{payment.payerName || 'Parent / Guardian'}</p>
                <p className="text-slate-500 font-mono text-[11px]">{payment.payerPhone || ''}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[10px] uppercase font-semibold">Issued By (Bursar / Cashier):</p>
                <p className="font-bold text-emerald-950">{payment.receivedBy || (payment as any).recordedByUserName || 'Finance Office'}</p>
                <p className="text-[10px] text-slate-400">Verified System Generated Receipt</p>
              </div>
            </div>

            {/* Stamp / Signature footer */}
            <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
              <span className="italic">Thank you for investing in quality CBC education at Uwezo Elite School.</span>
              <div className="w-20 h-10 border-2 border-dashed border-emerald-800 rounded flex items-center justify-center text-[9px] font-bold text-emerald-900 uppercase">
                Official Stamp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
