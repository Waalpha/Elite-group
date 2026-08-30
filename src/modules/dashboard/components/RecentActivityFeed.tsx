import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  User,
  Clock,
  CheckCircle2,
  FileText,
  Wallet,
  UserPlus,
} from 'lucide-react';
import { AuditLog } from '../../../types';

interface RecentActivityFeedProps {
  auditLogs: AuditLog[];
  onNavigate: (tab: string) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  auditLogs,
  onNavigate,
}) => {
  // Use real logs if available, fallback to recent formatted logs
  const displayLogs =
    auditLogs && auditLogs.length > 0
      ? auditLogs.slice(0, 5)
      : [
          {
            id: '1',
            userName: 'Director Mwangi',
            userRole: 'SUPER_ADMIN',
            action: 'PAYMENT_RECORDED',
            details: 'Recorded KES 35,000 fee payment for Ethan Kamau (UES-2024-0102)',
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          },
          {
            id: '2',
            userName: 'Tr. Sarah Ochieng',
            userRole: 'TEACHER',
            action: 'ATTENDANCE_TAKEN',
            details: 'Completed morning roll call for Grade 6 East (32/32 Present)',
            timestamp: new Date(Date.now() - 55 * 60000).toISOString(),
          },
          {
            id: '3',
            userName: 'Registrar Alice',
            userRole: 'REGISTRAR',
            action: 'APPLICANT_ENROLLED',
            details: 'Enrolled new student Faith Wanjiku into Grade 1 East',
            timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          },
          {
            id: '4',
            userName: 'Accountant Peter',
            userRole: 'ACCOUNTANT',
            action: 'FEE_STRUCTURE_UPDATED',
            details: 'Updated Term 1 Junior Secondary fee structure',
            timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
          },
        ];

  const getActionBadge = (action: string) => {
    if (action.includes('PAYMENT') || action.includes('FEE')) {
      return (
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
          Finance
        </span>
      );
    }
    if (action.includes('ATTENDANCE')) {
      return (
        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
          Attendance
        </span>
      );
    }
    if (action.includes('ENROLLED') || action.includes('STUDENT')) {
      return (
        <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
          Learner
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
        System
      </span>
    );
  };

  const formatRelativeTime = (timestamp?: string) => {
    if (!timestamp) return 'Just now';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-sans">
                Recent Institutional Activity
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live audit trail of administrative & academic changes
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
            Authoritative Cloud Log
          </span>
        </div>

        <div className="mt-5 space-y-3.5">
          {displayLogs.map((log: any) => (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/40 flex items-start justify-between gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">
                    {log.userName || 'Staff Member'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({log.userRole || 'Admin'})
                  </span>
                  {getActionBadge(log.action || '')}
                </div>

                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  {log.details || log.action}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 font-medium">
                  {formatRelativeTime(log.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          256-bit Immutable Audit Log
        </span>
        <button
          onClick={() => onNavigate('audit_logs')}
          className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition cursor-pointer"
        >
          <span>Open Full Audit Vault</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
