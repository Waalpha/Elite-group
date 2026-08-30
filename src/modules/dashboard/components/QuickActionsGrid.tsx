import React from 'react';
import {
  UserPlus,
  Wallet,
  CalendarCheck,
  Award,
  FileText,
  Bell,
  UserCheck2,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface QuickActionsGridProps {
  onOpenRegisterStudent: () => void;
  onOpenRecordPayment: () => void;
  onNavigate: (tab: string) => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onOpenRegisterStudent,
  onOpenRecordPayment,
  onNavigate,
}) => {
  const { isAdmin, isAccountant, isTeacher, isRegistrar } = useAuth();

  const actions = [
    {
      id: 'enroll',
      label: 'Enroll Learner',
      desc: 'New pupil admission & CBC profile',
      icon: UserPlus,
      color: 'emerald',
      onClick: onOpenRegisterStudent,
      show: isAdmin || isRegistrar,
    },
    {
      id: 'payment',
      label: 'Record Fee Payment',
      desc: 'M-Pesa / Bank remittance entry',
      icon: Wallet,
      color: 'emerald',
      onClick: onOpenRecordPayment,
      show: isAdmin || isAccountant,
    },
    {
      id: 'attendance',
      label: 'Take Attendance',
      desc: 'Morning roll call & QR Scanner',
      icon: CalendarCheck,
      color: 'blue',
      onClick: () => onNavigate('attendance'),
      show: true,
    },
    {
      id: 'marks',
      label: 'Enter CBC Marks',
      desc: 'Formative & summative assessment',
      icon: Award,
      color: 'purple',
      onClick: () => onNavigate('examinations'),
      show: isAdmin || isTeacher,
    },
    {
      id: 'timetable',
      label: 'Master Timetable',
      desc: 'Weekly lessons & teacher rosters',
      icon: Calendar,
      color: 'amber',
      onClick: () => onNavigate('timetable'),
      show: true,
    },
    {
      id: 'announcement',
      label: 'Send Broadcast',
      desc: 'SMS & Parent portal notice',
      icon: Bell,
      color: 'indigo',
      onClick: () => onNavigate('announcements'),
      show: isAdmin,
    },
    {
      id: 'staff',
      label: 'Faculty & Staff',
      desc: 'Teachers & non-teaching staff',
      icon: UserCheck2,
      color: 'teal',
      onClick: () => onNavigate('staff'),
      show: isAdmin,
    },
    {
      id: 'classes',
      label: 'Classes & Streams',
      desc: 'Classrooms, capacities & teachers',
      icon: GraduationCap,
      color: 'blue',
      onClick: () => onNavigate('classes'),
      show: isAdmin,
    },
    {
      id: 'users',
      label: 'User Accounts & Logins',
      desc: 'Staff, teacher & student portal credentials',
      icon: KeyRound,
      color: 'indigo',
      onClick: () => onNavigate('users'),
      show: isAdmin,
    },
  ];

  const getColorStyles = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
          badge: 'border-emerald-200/60',
        };
      case 'blue':
        return {
          bg: 'bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white',
          badge: 'border-blue-200/60',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white',
          badge: 'border-purple-200/60',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white',
          badge: 'border-amber-200/60',
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white',
          badge: 'border-indigo-200/60',
        };
      case 'teal':
        return {
          bg: 'bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white',
          badge: 'border-teal-200/60',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 group-hover:bg-slate-800 group-hover:text-white',
          badge: 'border-slate-200/60',
        };
    }
  };

  const visibleActions = actions.filter((a) => a.show);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-sans">
              Quick Operations & Shortcuts
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Immediate workflows for daily institutional management
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {visibleActions.map((action) => {
          const styles = getColorStyles(action.color);
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="group p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all duration-150 text-left flex flex-col justify-between gap-3 bg-white hover:bg-slate-50/50 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl transition-colors ${styles.bg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {action.label}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                  {action.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
