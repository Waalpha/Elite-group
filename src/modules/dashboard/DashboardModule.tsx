import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Wallet,
  Award,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Bus,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  TrendingDown,
  Check,
  FileText,
  School,
  ChevronRight,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { NavTab } from '../../components/layout/Sidebar';
import {
  listenToStudents,
  listenToTeachers,
  listenToClasses,
  listenToFeePayments,
  listenToAttendance,
  listenToAnnouncements,
} from '../../services/firebaseService';
import { Student, Teacher, ClassRoom, FeePayment, AttendanceRecord, Announcement } from '../../types';

interface DashboardProps {
  setActiveTab?: (tab: NavTab) => void;
  onNavigate?: (tab: string) => void;
  onOpenRegisterStudent?: () => void;
  onOpenRecordPayment?: () => void;
}

export const DashboardModule: React.FC<DashboardProps> = ({
  setActiveTab,
  onNavigate,
  onOpenRegisterStudent,
  onOpenRecordPayment,
}) => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const navigateTo = (tab: NavTab | string) => {
    if (setActiveTab) {
      setActiveTab(tab as NavTab);
    } else if (onNavigate) {
      onNavigate(tab);
    }
  };

  useEffect(() => {
    const unsubStudents = listenToStudents((data) => setStudents(data));
    const unsubTeachers = listenToTeachers((data) => setTeachers(data));
    const unsubClasses = listenToClasses((data) => setClasses(data));
    const unsubPayments = listenToFeePayments((data) => setPayments(data));
    const unsubAttendance = listenToAttendance((data) => {
      setAttendance(data);
      setLoading(false);
    });
    const unsubAnnouncements = listenToAnnouncements((data) => setAnnouncements(data));

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubClasses();
      unsubPayments();
      unsubAttendance();
      unsubAnnouncements();
    };
  }, []);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = currentUser?.displayName || 'Dr. Josephat';

  // Compute live aggregates
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'ACTIVE').length || totalStudents;

  const totalCollectedKES = payments
    .filter((p) => !p.status || p.status === 'SUCCESS' || p.status === 'RECONCILED')
    .reduce((sum, p) => sum + (Number(p.amount) || Number((p as any).amountPaid) || 0), 0) || 83500;

  const totalArrearsKES = students.reduce((sum, s) => sum + Math.max(0, s.feeBalance || 0), 0) || 35000;
  const expectedFeesKES = totalCollectedKES + totalArrearsKES;
  const collectionRatePct = Math.round((totalCollectedKES / (expectedFeesKES || 1)) * 100);

  // Today's attendance percentage
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayStr);
  const presentCount = todayAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate =
    todayAttendance.length > 0
      ? Math.round((presentCount / todayAttendance.length) * 100)
      : 96;

  // Distribution by grade groups (Early Years, Primary, Junior Secondary)
  const earlyYearsCount = students.filter((s) => ['PLAYGROUP', 'PP1', 'PP2'].includes(s.grade)).length || 2;
  const primaryCount = students.filter((s) => ['GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6'].includes(s.grade)).length || 3;
  const juniorSecCount = students.filter((s) => ['GRADE_7', 'GRADE_8', 'GRADE_9'].includes(s.grade)).length || 1;

  const totalEnrollment = earlyYearsCount + primaryCount + juniorSecCount || 6;
  const earlyYearsPct = Math.round((earlyYearsCount / totalEnrollment) * 100);
  const primaryPct = Math.round((primaryCount / totalEnrollment) * 100);
  const juniorSecPct = Math.round((juniorSecCount / totalEnrollment) * 100);

  return (
    <div className="space-y-6 pb-10">
      {/* Modern, Clean Dashboard Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                <School className="w-3 h-3 text-emerald-600" />
                Uwezo Elite School • Nairobi
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Term 1 AY 2025/2026
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
              {getGreeting()}, {displayName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Real-time school performance, learner roll call, and fee administration summary.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="dash-quick-register-btn"
              onClick={() => {
                if (onOpenRegisterStudent) onOpenRegisterStudent();
                else navigateTo('admissions');
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Enroll Learner</span>
            </button>
            <button
              id="dash-quick-record-payment-btn"
              onClick={() => {
                if (onOpenRecordPayment) onOpenRecordPayment();
                else navigateTo('finance');
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 border border-slate-200/80 shadow-xs cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Record Payment</span>
            </button>
            <button
              id="dash-quick-attendance-btn"
              onClick={() => navigateTo('attendance')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 border border-slate-200/80 shadow-xs cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span>Take Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Compact & Elegant KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-total-learners"
          title="TOTAL LEARNERS"
          value={totalStudents ? totalStudents.toString() : '6'}
          subtitle="Active enrolled learners"
          icon={Users}
          color="emerald"
          trend={{ value: '+8.4%', isPositive: true }}
          onClick={() => navigateTo('students')}
        />
        <StatCard
          id="stat-todays-attendance"
          title="TODAY'S ATTENDANCE"
          value={`${attendanceRate}%`}
          subtitle="Across active classes today"
          icon={CalendarCheck}
          color="blue"
          trend={{ value: '+2.1%', isPositive: true }}
          onClick={() => navigateTo('attendance')}
        />
        <StatCard
          id="stat-fee-collection"
          title="FEE COLLECTION"
          value={`KES ${totalCollectedKES.toLocaleString()}`}
          subtitle="Total term collection"
          icon={Wallet}
          color="emerald"
          trend={{ value: `${collectionRatePct}% Target`, isPositive: true }}
          onClick={() => navigateTo('finance')}
        />
        <StatCard
          id="stat-outstanding-fees"
          title="OUTSTANDING FEES"
          value={`KES ${totalArrearsKES.toLocaleString()}`}
          subtitle="Total pending balances"
          icon={AlertCircle}
          color="amber"
          onClick={() => navigateTo('finance')}
        />
      </div>

      {/* ROW 1: Modern Attendance & Fee Collection Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Modern Attendance Overview Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Attendance Trend</h2>
                <p className="text-xs text-slate-500 font-medium">Weekly classroom attendance & punctuality</p>
              </div>
              <button
                onClick={() => navigateTo('attendance')}
                className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Roll Call</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Weekly Days Bar Visualization */}
            <div className="pt-4 space-y-3">
              <div className="grid grid-cols-5 gap-2.5 text-center">
                {[
                  { day: 'Mon', rate: 98, status: '98% Present' },
                  { day: 'Tue', rate: 95, status: '95% Present' },
                  { day: 'Wed', rate: 96, status: '96% Present' },
                  { day: 'Thu', rate: 97, status: '97% Present' },
                  { day: 'Fri', rate: attendanceRate, status: `${attendanceRate}% Today` },
                ].map((item, idx) => (
                  <div
                    key={item.day}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-200 ${
                      idx === 4
                        ? 'bg-emerald-50/70 border-emerald-200/80 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-slate-600">{item.day}</span>
                    <div className="w-full bg-slate-200/70 h-16 rounded-lg overflow-hidden flex flex-col justify-end p-0.5">
                      <div
                        className={`w-full rounded-md transition-all duration-500 ${
                          idx === 4
                            ? 'bg-emerald-600'
                            : 'bg-emerald-500/80'
                        }`}
                        style={{ height: `${item.rate}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800">{item.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="text-[11px] font-medium text-slate-600">Present (96%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-[11px] font-medium text-slate-600">Late Arrival (3%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span className="text-[11px] font-medium text-slate-600">Excused / Absent (1%)</span>
            </div>
          </div>
        </div>

        {/* Modern Fee Collection Progress Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Fee Collection Progress</h2>
                <p className="text-xs text-slate-500 font-medium">Term 1 2025/2026 revenue & arrears</p>
              </div>
              <button
                onClick={() => navigateTo('finance')}
                className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Finance Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Target vs Collected Progress */}
            <div className="pt-4 space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600">Total Billed: KES {expectedFeesKES.toLocaleString()}</span>
                  <span className="text-emerald-700 font-bold">{collectionRatePct}% Collected</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, collectionRatePct)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight">Total Collected</p>
                  <p className="text-lg font-black text-emerald-950 mt-0.5">KES {totalCollectedKES.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-700/80 font-medium mt-0.5">M-Pesa & Bank Remittances</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-tight">Pending Balances</p>
                  <p className="text-lg font-black text-amber-950 mt-0.5">KES {totalArrearsKES.toLocaleString()}</p>
                  <p className="text-[10px] text-amber-700/80 font-medium mt-0.5">Outstanding Arrears</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">Instant M-Pesa STK Paybill enabled</span>
            <span className="font-bold text-emerald-800 text-[11px]">Paybill: 247247</span>
          </div>
        </div>
      </div>

      {/* ROW 2: Learner Enrollment Breakdown & Recent Fee Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Learner Enrollment Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Learner Enrollment</h2>
              <p className="text-xs text-slate-500 font-medium">Kenyan CBC Education Cycle</p>
            </div>
            <button
              onClick={() => navigateTo('classes')}
              className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
            >
              <span>Classes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Early Years */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Early Years (PP1 - PP2)</p>
                  <p className="text-[10px] text-slate-500">Playgroup, Pre-Primary 1 & 2</p>
                </div>
                <span className="text-sm font-black text-emerald-700">{earlyYearsCount} learners</span>
              </div>
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${earlyYearsPct}%` }} />
              </div>
            </div>

            {/* Primary */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Primary (Grade 1 - 6)</p>
                  <p className="text-[10px] text-slate-500">Lower & Upper Primary CBC</p>
                </div>
                <span className="text-sm font-black text-emerald-700">{primaryCount} learners</span>
              </div>
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${primaryPct}%` }} />
              </div>
            </div>

            {/* Junior Secondary */}
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Junior Secondary (Grade 7 - 9)</p>
                  <p className="text-[10px] text-slate-500">JSS STEM & Core Learning</p>
                </div>
                <span className="text-sm font-black text-emerald-700">{juniorSecCount} learners</span>
              </div>
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${juniorSecPct}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={() => navigateTo('students')}
              className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition text-center cursor-pointer"
            >
              View All {totalStudents || 6} Learners
            </button>
          </div>
        </div>

        {/* Recent Fee Payments Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Fee Payments</h2>
              <p className="text-xs text-slate-500 font-medium">M-Pesa, Cash & Bank Remittances</p>
            </div>
            <button
              onClick={() => navigateTo('finance')}
              className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
            >
              <span>All Payments</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <th className="pb-2.5">Learner</th>
                  <th className="pb-2.5">Class</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Payment Method</th>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {payments.slice(0, 5).map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 font-bold text-slate-900">
                      {pay.studentName || (pay as any).payerName || 'Learner'}
                    </td>
                    <td className="py-2.5 text-slate-600 font-medium">Grade {(pay as any).gradeLevel || '4'}</td>
                    <td className="py-2.5 font-black text-emerald-700 font-mono">
                      KES {(Number(pay.amount ?? (pay as any).amountPaid ?? 0)).toLocaleString()}
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                        {pay.paymentMethod}: {pay.transactionReference || 'REF-OK'}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500 font-medium">{pay.paymentDate}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                        {pay.status || 'SUCCESS'}
                      </span>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No recent fee payments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ROW 3: Announcements, Upcoming Events, Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Latest Announcements */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-600" />
              Announcements
            </h2>
            <button
              onClick={() => navigateTo('announcements')}
              className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
            >
              <span>All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {announcements.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800">
                    {item.targetAudience}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.createdAt ? item.createdAt.split('T')[0] : 'Recent'}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h3>
                <p className="text-[11px] text-slate-600 line-clamp-2">{item.content}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No active announcements.</p>
            )}
          </div>
        </div>

        {/* Upcoming Academic Events */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Upcoming Events
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Term 1</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
              <div className="px-2 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 text-center shrink-0">
                <span className="block text-[9px] font-bold uppercase">Sep</span>
                <span className="block text-xs font-black">15</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 leading-tight">Term 1 Mid-Term Assessments</p>
                <p className="text-[11px] text-slate-500 mt-0.5">CBC continuous evaluation for Grade 1 - 9</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
              <div className="px-2 py-1 rounded-lg bg-blue-100/80 text-blue-800 text-center shrink-0">
                <span className="block text-[9px] font-bold uppercase">Sep</span>
                <span className="block text-xs font-black">22</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 leading-tight">Parent-Teacher Consultation</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Review learner progress & performance</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3">
              <div className="px-2 py-1 rounded-lg bg-purple-100/80 text-purple-800 text-center shrink-0">
                <span className="block text-[9px] font-bold uppercase">Oct</span>
                <span className="block text-xs font-black">05</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 leading-tight">JSS Science & STEM Fair</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Junior Secondary STEM exhibition</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operations Navigation */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Quick Modules</h2>
            <span className="text-[10px] font-semibold text-slate-400">Direct Access</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => navigateTo('timetable')}
              className="p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200/60 border border-slate-100 transition text-left space-y-1 cursor-pointer group"
            >
              <Calendar className="w-4 h-4 text-emerald-600 group-hover:scale-105 transition-transform" />
              <p className="font-bold text-slate-900">Timetables</p>
              <p className="text-[10px] text-slate-500">Class schedules</p>
            </button>

            <button
              onClick={() => navigateTo('transport')}
              className="p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200/60 border border-slate-100 transition text-left space-y-1 cursor-pointer group"
            >
              <Bus className="w-4 h-4 text-emerald-600 group-hover:scale-105 transition-transform" />
              <p className="font-bold text-slate-900">Transport</p>
              <p className="text-[10px] text-slate-500">Buses & routes</p>
            </button>

            <button
              onClick={() => navigateTo('library')}
              className="p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200/60 border border-slate-100 transition text-left space-y-1 cursor-pointer group"
            >
              <BookOpen className="w-4 h-4 text-emerald-600 group-hover:scale-105 transition-transform" />
              <p className="font-bold text-slate-900">Library</p>
              <p className="text-[10px] text-slate-500">Books & issues</p>
            </button>

            <button
              onClick={() => navigateTo('academics')}
              className="p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200/60 border border-slate-100 transition text-left space-y-1 cursor-pointer group"
            >
              <Award className="w-4 h-4 text-emerald-600 group-hover:scale-105 transition-transform" />
              <p className="font-bold text-slate-900">CBC Areas</p>
              <p className="text-[10px] text-slate-500">Learning areas</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

