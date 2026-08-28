import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Search,
  Plus,
  Receipt,
  Printer,
  Smartphone,
  Building,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  FilePlus,
  Layers,
  Sparkles,
  DollarSign,
  AlertTriangle,
  Eye,
  FileText,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ReceiptPrint } from '../../components/print/ReceiptPrint';
import { FeeStatementPrint } from '../../components/print/FeeStatementPrint';
import {
  listenToStudents,
  listenToFeePayments,
  listenToFeeStructures,
  recordFeePayment,
  addFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  updateStudent,
} from '../../services/firebaseService';
import {
  Student,
  FeePayment,
  FeeStructure,
  PaymentMethod,
  GradeLevel,
} from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const GRADE_OPTIONS: { label: string; value: GradeLevel }[] = [
  { label: 'Playgroup', value: 'PLAYGROUP' },
  { label: 'PP1 (Pre-Primary 1)', value: 'PP1' },
  { label: 'PP2 (Pre-Primary 2)', value: 'PP2' },
  { label: 'Grade 1', value: 'GRADE_1' },
  { label: 'Grade 2', value: 'GRADE_2' },
  { label: 'Grade 3', value: 'GRADE_3' },
  { label: 'Grade 4', value: 'GRADE_4' },
  { label: 'Grade 5', value: 'GRADE_5' },
  { label: 'Grade 6 (KPSEA)', value: 'GRADE_6' },
  { label: 'Grade 7 (JSS)', value: 'GRADE_7' },
  { label: 'Grade 8 (JSS)', value: 'GRADE_8' },
  { label: 'Grade 9 (KJSEA)', value: 'GRADE_9' },
];

const COMMON_VOTE_HEADS = [
  'Tuition & Instruction',
  'CBC Assessment & Learning Materials',
  'Lunch / Meal Program',
  'School Transport & Shuttle',
  'Library & Digital Literacy (Coding)',
  'Activity & Co-Curricular (Games)',
  'Medical / First Aid Insurance',
  'School Uniform & Blazer',
  'Development / Capital Fund',
];

interface VoteHeadItem {
  name: string;
  amount: number;
}

export const FinanceModule: React.FC = () => {
  const { currentUser, isAdmin, isAccountant } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'PAYMENTS' | 'LEDGER' | 'STRUCTURE'>('PAYMENTS');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isCreateFeeModalOpen, setIsCreateFeeModalOpen] = useState(false);
  const [isEditFeeModalOpen, setIsEditFeeModalOpen] = useState(false);
  const [isDeleteFeeModalOpen, setIsDeleteFeeModalOpen] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null);
  const [selectedStudentForStatement, setSelectedStudentForStatement] = useState<Student | null>(null);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<FeeStructure | null>(null);

  // M-Pesa STK Simulation status
  const [stkSimulating, setStkSimulating] = useState(false);

  // Payment Form State
  const [formData, setFormData] = useState({
    studentId: '',
    amount: 15000,
    paymentMethod: 'MPESA_PAYBILL' as PaymentMethod,
    transactionReference: '',
    payerName: '',
    payerPhone: '+2547',
    term: 'TERM_1' as 'TERM_1' | 'TERM_2' | 'TERM_3',
    academicYear: '2025/2026',
    remarks: 'Term 1 School Fees',
  });

  // Fee Structure Form State
  const [feeFormData, setFeeFormData] = useState({
    name: 'Term 1 Tuition & CBC Assessment Fee',
    grade: 'GRADE_1' as GradeLevel,
    term: 'TERM_1' as 'TERM_1' | 'TERM_2' | 'TERM_3',
    academicYear: '2025/2026',
    dueDate: '2025-02-15',
    voteHeads: [
      { name: 'Tuition & Instruction', amount: 15000 },
      { name: 'CBC Assessment & Learning Materials', amount: 2500 },
      { name: 'Library & Digital Literacy (Coding)', amount: 1500 },
      { name: 'Activity & Co-Curricular', amount: 1000 },
    ] as VoteHeadItem[],
    applyToEnrolledStudents: true,
  });

  useEffect(() => {
    const unsubStudents = listenToStudents((data) => setStudents(data));
    const unsubPay = listenToFeePayments((data) => setPayments(data));
    const unsubStructure = listenToFeeStructures((data) => setFeeStructures(data));
    return () => {
      unsubStudents();
      unsubPay();
      unsubStructure();
    };
  }, []);

  const totalCollected = payments
    .filter((p) => !p.status || p.status === 'SUCCESS' || p.status === 'RECONCILED')
    .reduce((sum, p) => sum + (Number(p.amount) || Number((p as any).amountPaid) || 0), 0);

  const totalOutstanding = students.reduce((sum, s) => sum + Math.max(0, s.feeBalance || 0), 0);

  const handleOpenRecordPayment = (preselectedStudent?: Student) => {
    const targetStudent = preselectedStudent || students[0];
    const refCode = `Q${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    setFormData({
      studentId: targetStudent?.id || '',
      amount: targetStudent?.feeBalance && targetStudent.feeBalance > 0 ? targetStudent.feeBalance : 18000,
      paymentMethod: 'MPESA_PAYBILL',
      transactionReference: refCode,
      payerName: targetStudent?.parentName || 'Parent / Guardian',
      payerPhone: targetStudent?.parentPhone || '+254712345678',
      term: 'TERM_1',
      academicYear: '2025/2026',
      remarks: 'Term 1 Fees Remittance',
    });
    setIsRecordModalOpen(true);
  };

  const handleSimulateStkPush = () => {
    setStkSimulating(true);
    setTimeout(() => {
      const generatedRef = `R${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setFormData((prev) => ({
        ...prev,
        transactionReference: generatedRef,
      }));
      setStkSimulating(false);
      alert(`M-Pesa STK Push confirmed! Reference: ${generatedRef}`);
    }, 1500);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formData.studentId);
    if (!st) {
      alert('Please select a learner');
      return;
    }

    try {
      const receiptNo = `REC-2025-${Math.floor(100000 + Math.random() * 900000)}`;
      const savedPay = await recordFeePayment({
        studentId: st.id,
        studentName: `${st.firstName} ${st.lastName}`,
        admissionNumber: st.admissionNumber,
        receiptNumber: receiptNo,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionReference: formData.transactionReference || `TX-${Date.now().toString().slice(-6)}`,
        payerName: formData.payerName,
        payerPhone: formData.payerPhone,
        term: formData.term,
        academicYear: formData.academicYear,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'SUCCESS',
        remarks: formData.remarks,
        receivedBy: currentUser?.displayName || 'CPA-K Bursar',
      });

      setIsRecordModalOpen(false);
      // Auto open print receipt
      const completePaymentObj: FeePayment = {
        id: savedPay?.id || 'temp',
        studentId: st.id,
        studentName: `${st.firstName} ${st.lastName}`,
        admissionNumber: st.admissionNumber,
        receiptNumber: receiptNo,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionReference: formData.transactionReference,
        payerName: formData.payerName,
        payerPhone: formData.payerPhone,
        term: formData.term,
        academicYear: formData.academicYear,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'SUCCESS',
        remarks: formData.remarks,
        receivedBy: currentUser?.displayName || 'CPA-K Bursar',
        createdAt: new Date().toISOString(),
      };
      setSelectedPayment(completePaymentObj);
      setIsReceiptModalOpen(true);
    } catch (err: any) {
      alert(`Error recording payment: ${err.message}`);
    }
  };

  // Fee Structure Handlers
  const handleOpenCreateFee = () => {
    setFeeFormData({
      name: 'Term 1 Tuition & CBC Assessment Fee',
      grade: 'GRADE_1',
      term: 'TERM_1',
      academicYear: '2025/2026',
      dueDate: '2025-02-15',
      voteHeads: [
        { name: 'Tuition & Instruction', amount: 16000 },
        { name: 'CBC Assessment & Learning Materials', amount: 2500 },
        { name: 'Library & Digital Literacy (Coding)', amount: 1500 },
        { name: 'Activity & Co-Curricular', amount: 1000 },
      ],
      applyToEnrolledStudents: true,
    });
    setIsCreateFeeModalOpen(true);
  };

  const handleOpenEditFee = (fee: FeeStructure) => {
    setSelectedFeeStructure(fee);
    const vHeads: VoteHeadItem[] = (fee.voteHeads || (fee as any).items || []).map((v: any) => ({
      name: v.name || v.categoryName || 'Item',
      amount: Number(v.amount) || 0,
    }));

    setFeeFormData({
      name: fee.name || `${fee.grade || (fee as any).gradeLevel} Fee Structure`,
      grade: (fee.grade || (fee as any).gradeLevel || 'GRADE_1') as GradeLevel,
      term: (fee.term as any) || 'TERM_1',
      academicYear: fee.academicYear || '2025/2026',
      dueDate: (fee as any).dueDate || '2025-02-15',
      voteHeads: vHeads.length > 0 ? vHeads : [{ name: 'Tuition & Instruction', amount: 15000 }],
      applyToEnrolledStudents: false,
    });
    setIsEditFeeModalOpen(true);
  };

  const handleAddVoteHead = (defaultName?: string) => {
    setFeeFormData((prev) => ({
      ...prev,
      voteHeads: [...prev.voteHeads, { name: defaultName || 'New Fee Votehead', amount: 2000 }],
    }));
  };

  const handleRemoveVoteHead = (index: number) => {
    setFeeFormData((prev) => ({
      ...prev,
      voteHeads: prev.voteHeads.filter((_, idx) => idx !== index),
    }));
  };

  const handleVoteHeadChange = (index: number, field: 'name' | 'amount', value: any) => {
    setFeeFormData((prev) => {
      const updated = [...prev.voteHeads];
      updated[index] = {
        ...updated[index],
        [field]: field === 'amount' ? Number(value) : value,
      };
      return { ...prev, voteHeads: updated };
    });
  };

  const totalFeeCalculated = feeFormData.voteHeads.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handleSaveCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feeFormData.voteHeads.length === 0) {
      alert('Please add at least one fee votehead');
      return;
    }

    try {
      const newFeeDoc = {
        name: feeFormData.name,
        grade: feeFormData.grade,
        gradeLevel: feeFormData.grade,
        term: feeFormData.term,
        academicYear: feeFormData.academicYear,
        dueDate: feeFormData.dueDate,
        voteHeads: feeFormData.voteHeads,
        totalAmount: totalFeeCalculated,
        totalTermFee: totalFeeCalculated,
      };

      await addFeeStructure(newFeeDoc);

      // If requested, apply fee structure to enrolled students
      if (feeFormData.applyToEnrolledStudents) {
        const gradeStudents = students.filter(
          (s) => s.grade === feeFormData.grade || (s as any).gradeLevel === feeFormData.grade
        );
        for (const st of gradeStudents) {
          const currentBilled = Number(st.totalFeesBilled) || 0;
          const currentPaid = Number(st.totalFeesPaid) || 0;
          const newBilled = currentBilled + totalFeeCalculated;
          const newBalance = Math.max(0, newBilled - currentPaid);
          await updateStudent(st.id, {
            totalFeesBilled: newBilled,
            feeBalance: newBalance,
          });
        }
      }

      setIsCreateFeeModalOpen(false);
      setTab('STRUCTURE');
      alert(`Fee structure created successfully! Total: KES ${totalFeeCalculated.toLocaleString()}`);
    } catch (err: any) {
      alert(`Error creating fee structure: ${err.message}`);
    }
  };

  const handleSaveEditFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeStructure?.id) return;
    try {
      await updateFeeStructure(selectedFeeStructure.id, {
        name: feeFormData.name,
        grade: feeFormData.grade,
        gradeLevel: feeFormData.grade,
        term: feeFormData.term,
        academicYear: feeFormData.academicYear,
        dueDate: feeFormData.dueDate,
        voteHeads: feeFormData.voteHeads,
        totalAmount: totalFeeCalculated,
        totalTermFee: totalFeeCalculated,
      });

      setIsEditFeeModalOpen(false);
      setSelectedFeeStructure(null);
    } catch (err: any) {
      alert(`Error updating fee structure: ${err.message}`);
    }
  };

  const handleConfirmDeleteFee = async () => {
    if (!selectedFeeStructure?.id) return;
    try {
      await deleteFeeStructure(selectedFeeStructure.id);
      setIsDeleteFeeModalOpen(false);
      setSelectedFeeStructure(null);
    } catch (err: any) {
      alert(`Error deleting fee structure: ${err.message}`);
    }
  };

  const filteredPayments = payments.filter(
    (p) =>
      (p.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.receiptNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.transactionReference || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.admissionNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            Fee Collection, M-Pesa & Financials
          </h1>
          <p className="text-xs text-slate-500">
            Official bursary ledger, instant M-Pesa Paybill (247247) reconciliation, student billing, and official fee structures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(isAdmin || isAccountant) && (
            <button
              id="create-new-fee-structure-btn"
              onClick={handleOpenCreateFee}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FilePlus className="w-4 h-4 text-amber-400" />
              <span>Create New Fee</span>
            </button>
          )}

          <button
            id="record-new-fee-btn"
            onClick={() => handleOpenRecordPayment()}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Record Fee Payment / M-Pesa</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Collections (Term 1)</span>
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">LIVE</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-2">
            KES {totalCollected.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Reconciled via Paybill 247247 & Bank</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Outstanding Fee Arrears</span>
            <span className="p-1 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold">RECEIVABLE</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-2">
            KES {totalOutstanding.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across all registered learners</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-900 text-white border border-emerald-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-200 text-xs font-medium">
            <span>Official Paybill Credentials</span>
            <span className="p-1 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black">ACTIVE</span>
          </div>
          <div className="mt-2 space-y-0.5 font-mono">
            <p className="text-lg font-black text-amber-300">Paybill: 247247</p>
            <p className="text-xs text-emerald-200">Account: [Learner Admission No]</p>
          </div>
          <p className="text-[10px] text-emerald-300 mt-1">Direct Safaricom Daraja API Synchronized</p>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setTab('PAYMENTS')}
          className={`pb-3 px-3 transition cursor-pointer border-b-2 ${
            tab === 'PAYMENTS'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Payment Transactions ({payments.length})
        </button>
        <button
          onClick={() => setTab('LEDGER')}
          className={`pb-3 px-3 transition cursor-pointer border-b-2 ${
            tab === 'LEDGER'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Student Fee Balances ({students.length})
        </button>
        <button
          onClick={() => setTab('STRUCTURE')}
          className={`pb-3 px-3 transition cursor-pointer border-b-2 ${
            tab === 'STRUCTURE'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Fee Structures ({feeStructures.length})
        </button>
      </div>

      {/* TAB 1: Payment Transactions */}
      {tab === 'PAYMENTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transaction ref, student name, receipt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredPayments.length} transactions
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Receipt / Ref</th>
                  <th className="py-3 px-4">Learner</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Payer Phone</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => {
                  const amt = Number(p.amount) || Number((p as any).amountPaid) || 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{p.receiptNumber}</span>
                        <span className="text-[10px] font-mono text-emerald-700 block">{p.transactionReference}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{p.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.admissionNumber}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        KES {amt.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {p.payerPhone || (p as any).parentPhone || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{p.paymentDate || p.createdAt?.split('T')[0]}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {p.status || 'SUCCESS'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer border border-emerald-200/70 shadow-2xs"
                          title="Quick View & Print Official A4 Fee Receipt"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Quick View (A4)</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Student Fee Balances */}
      {tab === 'LEDGER' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Adm No</th>
                <th className="py-3 px-4">Learner Name</th>
                <th className="py-3 px-4">Grade & Stream</th>
                <th className="py-3 px-4">Total Billed</th>
                <th className="py-3 px-4">Total Paid</th>
                <th className="py-3 px-4">Current Balance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => {
                const bal = st.feeBalance || 0;
                const paid = st.totalFeesPaid || 0;
                const billed = st.totalFeesBilled || (bal + paid) || 25000;
                return (
                  <tr key={st.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{st.admissionNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {st.firstName} {st.lastName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {(st.grade || (st as any).gradeLevel || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">KES {billed.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                      KES {paid.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono font-bold ${
                          bal > 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        KES {bal.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudentForStatement(st);
                            setIsStatementModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
                          title="Quick View & Print Official A4 Fee Statement"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>Statement (A4)</span>
                        </button>
                        <button
                          onClick={() => handleOpenRecordPayment(st)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                        >
                          Record Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Fee Structures (Vote Heads) */}
      {tab === 'STRUCTURE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Official institutional fee structures defined per grade level and academic term.
            </p>
            <button
              onClick={handleOpenCreateFee}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Fee Structure</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeStructures.map((fs: any) => {
              const gradeName = (fs.grade || fs.gradeLevel || '').replace('_', ' ');
              const items = fs.voteHeads || fs.items || [];
              const total = Number(fs.totalAmount || fs.totalTermFee || 0);
              return (
                <div
                  key={fs.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {gradeName}
                      </span>
                      <span className="font-mono text-xs text-slate-500 font-bold">{fs.term} ({fs.academicYear || '2025/2026'})</span>
                    </div>
                    <h3 className="text-base font-extrabold font-serif text-slate-900 mb-3">
                      {fs.name || `${gradeName} Fee Structure`}
                    </h3>

                    <div className="space-y-2 text-xs divide-y divide-slate-100">
                      {items.map((vh: any, idx: number) => (
                        <div key={idx} className="pt-2 flex justify-between">
                          <span className="text-slate-600">{vh.name || vh.categoryName}</span>
                          <span className="font-mono font-bold text-slate-900">
                            KES {(Number(vh.amount) || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t-2 border-slate-900">
                    <div className="flex items-center justify-between font-mono font-black text-sm text-slate-950 mb-3">
                      <span>Total Term Fees:</span>
                      <span className="text-emerald-700">KES {total.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEditFee(fs)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFeeStructure(fs);
                          setIsDeleteFeeModalOpen(true);
                        }}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Create New Fee Structure */}
      <Modal
        isOpen={isCreateFeeModalOpen}
        onClose={() => setIsCreateFeeModalOpen(false)}
        title="Create New School Fee Structure"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveCreateFee} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fee Structure Title *</label>
            <input
              type="text"
              required
              value={feeFormData.name}
              onChange={(e) => setFeeFormData({ ...feeFormData, name: e.target.value })}
              placeholder="e.g. Term 1 CBC Tuition & Assessment Fees"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Grade Level *</label>
              <select
                value={feeFormData.grade}
                onChange={(e) => setFeeFormData({ ...feeFormData, grade: e.target.value as GradeLevel })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Term *</label>
              <select
                value={feeFormData.term}
                onChange={(e) => setFeeFormData({ ...feeFormData, term: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                <option value="TERM_1">Term 1</option>
                <option value="TERM_2">Term 2</option>
                <option value="TERM_3">Term 3</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={feeFormData.academicYear}
                onChange={(e) => setFeeFormData({ ...feeFormData, academicYear: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 font-bold"
              />
            </div>
          </div>

          {/* Dynamic Vote Heads List */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Fee Voteheads / Line Items ({feeFormData.voteHeads.length})
              </span>
              <button
                type="button"
                onClick={() => handleAddVoteHead()}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Votehead</span>
              </button>
            </div>

            {/* Quick Add Presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[10px] text-slate-400 font-medium py-0.5">Quick Add:</span>
              {COMMON_VOTE_HEADS.map((head, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddVoteHead(head)}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 text-[10px] font-medium transition cursor-pointer"
                >
                  + {head}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {feeFormData.voteHeads.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  <input
                    type="text"
                    required
                    value={item.name}
                    onChange={(e) => handleVoteHeadChange(idx, 'name', e.target.value)}
                    placeholder="Votehead description"
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                  <div className="flex items-center gap-1 w-36">
                    <span className="font-bold text-slate-500 text-xs">KES</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={item.amount}
                      onChange={(e) => handleVoteHeadChange(idx, 'amount', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVoteHead(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total summary */}
            <div className="flex items-center justify-between p-3 bg-emerald-950 text-white rounded-xl font-mono font-bold mt-3">
              <span className="text-emerald-300">Total Calculated Fee:</span>
              <span className="text-base text-amber-300">KES {totalFeeCalculated.toLocaleString()}</span>
            </div>
          </div>

          {/* Auto-bill checkbox */}
          <div className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <input
              type="checkbox"
              id="applyToEnrolled"
              checked={feeFormData.applyToEnrolledStudents}
              onChange={(e) => setFeeFormData({ ...feeFormData, applyToEnrolledStudents: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="applyToEnrolled" className="text-slate-800 font-semibold cursor-pointer">
              Automatically invoice & bill all enrolled learners in {feeFormData.grade.replace('_', ' ')}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateFeeModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            >
              Save & Activate Fee Structure
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Fee Structure */}
      <Modal
        isOpen={isEditFeeModalOpen}
        onClose={() => {
          setIsEditFeeModalOpen(false);
          setSelectedFeeStructure(null);
        }}
        title={`Edit Fee Structure: ${selectedFeeStructure?.name}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveEditFee} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fee Structure Title *</label>
            <input
              type="text"
              required
              value={feeFormData.name}
              onChange={(e) => setFeeFormData({ ...feeFormData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grade Level</label>
              <select
                value={feeFormData.grade}
                onChange={(e) => setFeeFormData({ ...feeFormData, grade: e.target.value as GradeLevel })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Term</label>
              <select
                value={feeFormData.term}
                onChange={(e) => setFeeFormData({ ...feeFormData, term: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                <option value="TERM_1">Term 1</option>
                <option value="TERM_2">Term 2</option>
                <option value="TERM_3">Term 3</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={feeFormData.academicYear}
                onChange={(e) => setFeeFormData({ ...feeFormData, academicYear: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 font-bold"
              />
            </div>
          </div>

          {/* Dynamic Vote Heads List */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-xs">Voteheads Breakdown</span>
              <button
                type="button"
                onClick={() => handleAddVoteHead()}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {feeFormData.voteHeads.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  <input
                    type="text"
                    required
                    value={item.name}
                    onChange={(e) => handleVoteHeadChange(idx, 'name', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                  />
                  <div className="flex items-center gap-1 w-36">
                    <span className="font-bold text-slate-500 text-xs">KES</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={item.amount}
                      onChange={(e) => handleVoteHeadChange(idx, 'amount', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVoteHead(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-950 text-white rounded-xl font-mono font-bold mt-3">
              <span className="text-emerald-300">Total Term Fees:</span>
              <span className="text-base text-amber-300">KES {totalFeeCalculated.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsEditFeeModalOpen(false);
                setSelectedFeeStructure(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            >
              Update Fee Structure
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteFeeModalOpen}
        onClose={() => {
          setIsDeleteFeeModalOpen(false);
          setSelectedFeeStructure(null);
        }}
        onConfirm={handleConfirmDeleteFee}
        title="Delete Fee Structure"
        message={`Are you sure you want to delete fee structure "${selectedFeeStructure?.name}"? Existing recorded receipts will not be affected.`}
        confirmText="Yes, Delete Fee Structure"
        confirmVariant="danger"
      />

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Student Fee Payment / M-Pesa Remittance"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Learner *</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => {
                const sId = e.target.value;
                const found = students.find((s) => s.id === sId);
                setFormData({
                  ...formData,
                  studentId: sId,
                  payerName: found?.parentName || formData.payerName,
                  payerPhone: found?.parentPhone || formData.payerPhone,
                });
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold"
            >
              <option value="">-- Choose Learner --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.admissionNumber} — {s.firstName} {s.lastName} ({(s.grade || (s as any).gradeLevel || '').replace('_', ' ')} / Stream {s.stream || 'East'}) — Bal: KES {(s.feeBalance || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount to Remit (KES) *</label>
              <input
                type="number"
                required
                min="100"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-base font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="MPESA_PAYBILL">M-Pesa Paybill (247247)</option>
                <option value="MPESA_STK">M-Pesa STK Push (Online Prompt)</option>
                <option value="BANK_DEPOSIT">Bank Deposit (Equity / KCB)</option>
                <option value="CASH">Cash at Bursary</option>
                <option value="CHEQUE">Banker's Cheque</option>
              </select>
            </div>
          </div>

          {/* M-Pesa STK Push Simulation trigger */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-emerald-950 font-bold flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                M-Pesa Instant Push Simulator
              </p>
              <p className="text-[11px] text-emerald-800">
                Trigger STK pop-up to {formData.payerPhone} for KES {formData.amount.toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSimulateStkPush}
              disabled={stkSimulating}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs cursor-pointer"
            >
              {stkSimulating ? 'Awaiting PIN...' : 'Simulate STK Push'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">M-Pesa / Bank Transaction Ref *</label>
              <input
                type="text"
                required
                value={formData.transactionReference}
                onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
                placeholder="e.g. QJK899120"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payer Full Name</label>
              <input
                type="text"
                value={formData.payerName}
                onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payer Phone Number</label>
              <input
                type="tel"
                value={formData.payerPhone}
                onChange={(e) => setFormData({ ...formData, payerPhone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fee Notes / Remarks</label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
            >
              Post Payment & Print Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      {selectedPayment && (
        <ReceiptPrint
          payment={selectedPayment}
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}

      {/* Printable Student Fee Statement Modal (A4) */}
      {selectedStudentForStatement && (
        <FeeStatementPrint
          student={selectedStudentForStatement}
          payments={payments}
          isOpen={isStatementModalOpen}
          onClose={() => {
            setIsStatementModalOpen(false);
            setSelectedStudentForStatement(null);
          }}
        />
      )}
    </div>
  );
};
