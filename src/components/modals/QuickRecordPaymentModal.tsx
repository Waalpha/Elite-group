import React, { useState } from 'react';
import {
  X,
  Wallet,
  Check,
  CheckCircle2,
  Receipt,
  User,
  CreditCard,
  Building2,
  Phone,
  Search,
} from 'lucide-react';
import { Student, FeePayment } from '../../types';
import { recordFeePayment } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';

interface QuickRecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSuccess?: () => void;
}

export const QuickRecordPaymentModal: React.FC<QuickRecordPaymentModalProps> = ({
  isOpen,
  onClose,
  students,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amount, setAmount] = useState<number | string>(15000);
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Bank Transfer' | 'Cash' | 'Cheque'>('M-Pesa');
  const [transactionRef, setTransactionRef] = useState(`MP-${Date.now().toString().slice(-6)}`);
  const [remarks, setRemarks] = useState('Term 1 Tuition & Meals');
  const [submitting, setSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  if (!isOpen) return null;

  const filteredStudents = students.filter((s) => {
    if (!searchStudent) return false;
    const q = searchStudent.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.admissionNumber.toLowerCase().includes(q) ||
      (s.parentPhone && s.parentPhone.includes(q))
    );
  });

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchStudent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Please search and select a learner.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    try {
      setSubmitting(true);
      const receiptNo = `UES-REC-${Math.floor(100000 + Math.random() * 900000)}`;
      const numAmount = Number(amount);

      const paymentRecord: Partial<FeePayment> | any = {
        receiptNumber: receiptNo,
        studentId: selectedStudent.id,
        studentName: selectedStudent.fullName,
        admissionNumber: selectedStudent.admissionNumber,
        gradeLevel: selectedStudent.currentClass,
        amount: numAmount,
        amountPaid: numAmount,
        paymentMethod: paymentMethod,
        transactionReference: transactionRef,
        referenceNumber: transactionRef,
        remarks: remarks,
        receivedBy: currentUser?.displayName || 'Cashier / Accountant',
        academicYear: selectedStudent.academicYear || '2025/2026',
        term: 'Term 1',
        status: 'SUCCESS',
        paymentDate: new Date().toISOString().split('T')[0],
      };

      await recordFeePayment(paymentRecord);

      setReceiptData({
        ...paymentRecord,
        previousBalance: selectedStudent.feeBalance || 0,
        newBalance: Math.max(0, (selectedStudent.feeBalance || 0) - numAmount),
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error recording payment:', err);
      alert('Failed to save payment record to Firestore.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    setReceiptData(null);
    setSelectedStudent(null);
    setSearchStudent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-800 text-emerald-300">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-sans">
                Record Fee Payment
              </h3>
              <p className="text-xs text-emerald-200/80 font-medium">
                Instant M-Pesa / Bank remittance & student balance reconciliation
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseAndReset}
            className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {receiptData ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 font-sans">
                Payment Reconciled & Receipt Issued!
              </h3>

              {/* Receipt Preview Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-slate-500">Receipt No:</span>
                  <span className="font-mono font-extrabold text-emerald-950">
                    {receiptData.receiptNumber}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1">
                  <span className="text-slate-500">Learner:</span>
                  <span className="font-extrabold text-slate-900">{receiptData.studentName}</span>

                  <span className="text-slate-500">Adm No:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {receiptData.admissionNumber}
                  </span>

                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    KES {Number(receiptData.amount).toLocaleString()}
                  </span>

                  <span className="text-slate-500">Method & Ref:</span>
                  <span className="font-medium text-slate-800">
                    {receiptData.paymentMethod} • {receiptData.transactionReference}
                  </span>

                  <span className="text-slate-500">Remaining Balance:</span>
                  <span className="font-bold text-amber-700">
                    KES {receiptData.newBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseAndReset}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Done / Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student Lookup Field */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Search Learner (Name or Adm No) <span className="text-rose-500">*</span>
                </label>
                {selectedStudent ? (
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-300 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {selectedStudent.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Adm: <span className="font-mono font-bold">{selectedStudent.admissionNumber}</span> • {selectedStudent.currentClass}
                      </p>
                      <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                        Current Fee Balance: KES {(selectedStudent.feeBalance || 0).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder="Type student name or admission number..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />

                    {filteredStudents.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {filteredStudents.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => handleSelectStudent(s)}
                            className="p-2.5 hover:bg-emerald-50 transition cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-900">{s.fullName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {s.admissionNumber} • {s.currentClass}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] font-bold text-amber-700">
                                KES {(s.feeBalance || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Amount & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Amount (KES) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-extrabold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="M-Pesa">M-Pesa (STK / Paybill 247247)</option>
                    <option value="Bank Transfer">Bank Transfer / EFT</option>
                    <option value="Cash">Cash (School Bursary)</option>
                    <option value="Cheque">Bankers Cheque</option>
                  </select>
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  M-Pesa Code / Bank Deposit Ref
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. SLK89201KJ"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Payment Description / Purpose
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Term 1 Tuition & Boarding"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseAndReset}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Reconciling with Firestore...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Post Payment & Issue Receipt</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
