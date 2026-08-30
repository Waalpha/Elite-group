import React from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowRight,
  FileSpreadsheet,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { FeePayment, Student } from '../../../types';

interface FeeCollectionCardProps {
  payments: FeePayment[];
  students: Student[];
  onNavigate: (tab: string) => void;
  onOpenRecordPayment: () => void;
}

export const FeeCollectionCard: React.FC<FeeCollectionCardProps> = ({
  payments,
  students,
  onNavigate,
  onOpenRecordPayment,
}) => {
  // Real-time calculation from Firestore
  const totalCollectedKES = payments
    .filter((p) => !p.status || p.status === 'SUCCESS' || (p.status as string) === 'RECONCILED')
    .reduce((sum, p) => sum + (Number(p.amount) || Number((p as any).amountPaid) || 0), 0);

  const totalOutstandingKES = students.reduce((sum, s) => sum + Math.max(0, s.feeBalance || 0), 0);
  const totalBilledKES = totalCollectedKES + totalOutstandingKES;
  const collectionPct = totalBilledKES > 0 ? Math.round((totalCollectedKES / totalBilledKES) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-sans">
                Fee Collection & Revenue Target
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Term 1 2025/2026 Kenyan Shilling (KES) reconciliation
              </p>
            </div>
          </div>

          <button
            id="finance-card-record-payment-btn"
            onClick={onOpenRecordPayment}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Fee</span>
          </button>
        </div>

        {/* Big Progress and Main Numbers */}
        <div className="mt-5 space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Collected to Date
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-700 font-sans tracking-tight">
                KES {totalCollectedKES.toLocaleString()}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{collectionPct}%</span>
              <p className="text-[11px] text-slate-400 font-medium">of Term Target</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(2, collectionPct))}%` }}
            />
          </div>

          {/* Three-Column Financial Breakdown */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Total Billed
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 truncate">
                KES {totalBilledKES.toLocaleString()}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
              <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Collected
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-900 mt-0.5 truncate">
                KES {totalCollectedKES.toLocaleString()}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
              <p className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                Outstanding
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-amber-900 mt-0.5 truncate">
                KES {totalOutstandingKES.toLocaleString()}
              </p>
            </div>
          </div>

          {/* M-Pesa & Bank Quick Remittance Strip */}
          <div className="p-3 rounded-xl bg-emerald-900/5 border border-emerald-700/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span className="font-semibold text-emerald-950">M-Pesa Paybill: <strong>247247</strong></span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-slate-600 hidden sm:inline">Account: <strong>[Adm No]</strong></span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200/60">
              Instant Reconciliation
            </span>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => onNavigate('finance')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
          <span>View Statements</span>
        </button>

        <button
          onClick={() => onNavigate('finance')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
        >
          <span>Finance & Accounts Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

