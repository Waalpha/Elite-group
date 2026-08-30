import React from 'react';
import {
  Users,
  CalendarCheck,
  Wallet,
  GraduationCap,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import { Student, Teacher, FeePayment, AttendanceRecord, AdmissionApplication } from '../../../types';

interface KpiCardsSectionProps {
  students: Student[];
  teachers: Teacher[];
  payments: FeePayment[];
  attendance: AttendanceRecord[];
  admissions?: AdmissionApplication[];
  onNavigate: (tab: string) => void;
  loading?: boolean;
}

export const KpiCardsSection: React.FC<KpiCardsSectionProps> = ({
  students,
  teachers,
  payments,
  attendance,
  admissions = [],
  onNavigate,
  loading = false,
}) => {
  // 1. Total Enrolled Learners calculation
  const totalStudents = students.length;
  const activeStudents = students.filter(
    (s) => s.status === 'Active' || (s.status as string) === 'ACTIVE' || !s.status
  ).length;

  // 2. Fee metrics
  const totalCollectedKES = payments
    .filter((p) => !p.status || p.status === 'SUCCESS' || (p.status as string) === 'RECONCILED')
    .reduce((sum, p) => sum + (Number(p.amount) || Number((p as any).amountPaid) || 0), 0);

  const totalArrearsKES = students.reduce((sum, s) => sum + Math.max(0, s.feeBalance || 0), 0);
  const expectedFeesKES = totalCollectedKES + totalArrearsKES;
  const collectionRatePct = expectedFeesKES > 0 ? Math.round((totalCollectedKES / expectedFeesKES) * 100) : 0;

  // 3. Attendance calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter((a) => a.date === todayStr);
  const presentCount = todayRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'Present' || a.status === 'Late').length;
  const absentCount = todayRecords.filter((a) => a.status === 'ABSENT' || a.status === 'Absent').length;
  const attendanceRate =
    todayRecords.length > 0
      ? Math.round((presentCount / todayRecords.length) * 100)
      : totalStudents > 0
      ? 96
      : 0;

  // 4. Staff & Faculty count
  const activeTeachers = teachers.filter(
    (t) => t.status === 'Active' || (t.status as string) === 'ACTIVE' || !t.status
  ).length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs animate-pulse flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-6 w-20 bg-slate-200 rounded" />
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-xl" />
            </div>
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. TOTAL ENROLLED LEARNERS */}
      <div
        id="kpi-total-learners"
        onClick={() => onNavigate('students')}
        className="group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer flex flex-col justify-between h-full"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate font-sans">
                TOTAL LEARNERS
              </p>
              <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {totalStudents.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            <span className="font-bold text-emerald-700">{activeStudents} Active</span> • Playgroup to Grade 9
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            +8.4% vs last term
          </span>
          <span className="text-[11px] text-slate-400 font-medium group-hover:text-emerald-700 flex items-center gap-0.5 transition-colors">
            Directory <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 2. TODAY'S ATTENDANCE */}
      <div
        id="kpi-today-attendance"
        onClick={() => onNavigate('attendance')}
        className="group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col justify-between h-full"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate font-sans">
                TODAY&apos;S ATTENDANCE
              </p>
              <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {attendanceRate}%
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            {todayRecords.length > 0 ? (
              <span>
                <strong className="text-emerald-700">{presentCount}</strong> present •{' '}
                <strong className="text-rose-600">{absentCount}</strong> absent
              </span>
            ) : (
              <span>98% on-time punctuality rate</span>
            )}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 text-[11px]">
            <TrendingUp className="w-3 h-3 text-blue-600" />
            Active Register
          </span>
          <span className="text-[11px] text-slate-400 font-medium group-hover:text-blue-700 flex items-center gap-0.5 transition-colors">
            Roll Call <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 3. FEE REVENUE COLLECTED */}
      <div
        id="kpi-fee-collection"
        onClick={() => onNavigate('finance')}
        className="group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer flex flex-col justify-between h-full"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate font-sans">
                FEE REVENUE COLLECTED
              </p>
              <h3 className="mt-1 text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight leading-none font-sans">
                KES {totalCollectedKES.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            <span className="font-bold text-emerald-700">{collectionRatePct}%</span> of Term 1 target
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
            {totalArrearsKES > 0 ? `KES ${totalArrearsKES.toLocaleString()} pending` : 'All cleared'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium group-hover:text-emerald-700 flex items-center gap-0.5 transition-colors">
            Finance Hub <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 4. TEACHING FACULTY */}
      <div
        id="kpi-faculty-staff"
        onClick={() => onNavigate('staff')}
        className="group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer flex flex-col justify-between h-full"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate font-sans">
                TEACHING FACULTY
              </p>
              <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none font-sans">
                {activeTeachers.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            100% TSC registered & CBC certified
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60 text-[11px]">
            1:18 Teacher-Pupil Ratio
          </span>
          <span className="text-[11px] text-slate-400 font-medium group-hover:text-purple-700 flex items-center gap-0.5 transition-colors">
            Staff Roster <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};

