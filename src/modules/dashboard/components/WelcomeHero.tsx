import React, { useState, useEffect, useRef } from 'react';
import {
  School,
  Calendar,
  Clock,
  UserPlus,
  Wallet,
  CalendarCheck,
  Award,
  MoreHorizontal,
  FilePlus2,
  FileSpreadsheet,
  UserCheck2,
  Bell,
  GraduationCap,
  BookOpen,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useSchoolSettings } from '../../../contexts/SettingsContext';

interface WelcomeHeroProps {
  onOpenRegisterStudent: () => void;
  onOpenRecordPayment: () => void;
  onNavigate: (tab: string) => void;
  onOpenCustomizer: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  onOpenRegisterStudent,
  onOpenRecordPayment,
  onNavigate,
  onOpenCustomizer,
}) => {
  const { currentUser, isAdmin, isAccountant, isTeacher, isRegistrar } = useAuth();
  const { settings } = useSchoolSettings();
  const [currentTime, setCurrentTime] = useState<string>('09:44 AM');
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000); // update every 10s is sufficient without seconds
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const displayName = currentUser?.displayName || 'Director';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#042f2e] rounded-2xl border border-emerald-700/40 p-5 sm:p-6 text-white shadow-sm transition-all">
      {/* Subtle Geometric Gradient Overlay - No heavy dots */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: School context, Greeting, and Date/Time */}
        <div className="space-y-2 max-w-2xl">
          {/* School & Location Pill */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
              {settings.schoolName || 'UWEZO ELITE SCHOOL'} • Nairobi
            </span>
          </div>

          {/* Main Greeting */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
              {getGreeting()}, {displayName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-normal mt-0.5 leading-relaxed">
              Here&apos;s what&apos;s happening at Uwezo Elite School today.
            </p>
          </div>

          {/* Academic Term, Date & Clean 12h Clock */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 pt-1 text-xs text-emerald-200/90 flex-wrap font-medium">
            <span className="inline-flex items-center gap-1.5 font-bold text-white bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Term 1 • AY 2025/2026
            </span>
            <span className="text-emerald-500/60">•</span>
            <span>{getFormattedDate()}</span>
            <span className="text-emerald-500/60">•</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-100">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {currentTime}
            </span>
          </div>
        </div>

        {/* Right Side: Responsive Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {/* 1. Primary Filled Button: + Enroll Learner */}
          {(isAdmin || currentUser?.role === 'SUPER_ADMIN' || isRegistrar) && (
            <button
              id="hero-enroll-learner-btn"
              onClick={onOpenRegisterStudent}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-black transition-all duration-150 flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer active:scale-98 shrink-0 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>+ Enroll Learner</span>
            </button>
          )}

          {/* 2. Secondary: Record Payment */}
          {(isAdmin || isAccountant) && (
            <button
              id="hero-record-payment-btn"
              onClick={onOpenRecordPayment}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/90 text-white text-xs font-bold transition-all duration-150 flex items-center gap-1.5 border border-emerald-500/30 cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
            >
              <Wallet className="w-4 h-4 text-emerald-300" />
              <span>Record Payment</span>
            </button>
          )}

          {/* 3. Secondary: Take Attendance */}
          <button
            id="hero-take-attendance-btn"
            onClick={() => onNavigate('attendance')}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-100 text-xs font-bold transition-all duration-150 flex items-center gap-1.5 border border-emerald-600/40 cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-300" />
            <span>Take Attendance</span>
          </button>

          {/* 4. Secondary: Enter Marks */}
          <button
            id="hero-enter-marks-btn"
            onClick={() => onNavigate('examinations')}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-100 text-xs font-bold transition-all duration-150 flex items-center gap-1.5 border border-emerald-600/40 cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
          >
            <Award className="w-4 h-4 text-emerald-300" />
            <span>Enter Marks</span>
          </button>

          {/* 5. More Actions Dropdown Menu */}
          <div className="relative" ref={moreMenuRef}>
            <button
              id="hero-more-actions-btn"
              onClick={() => setMoreActionsOpen(!moreActionsOpen)}
              title="More School Actions"
              className="px-3 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 hover:text-white transition-all border border-emerald-600/40 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">More Actions</span>
            </button>

            {moreActionsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-1.5 space-y-0.5 text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Quick Management
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMoreActionsOpen(false);
                    onNavigate('finance');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer"
                >
                  <FilePlus2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Create Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMoreActionsOpen(false);
                    onNavigate('examinations');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Generate Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMoreActionsOpen(false);
                    onNavigate('staff');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer"
                >
                  <UserCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Add Teacher</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMoreActionsOpen(false);
                    onNavigate('announcements');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Add Announcement</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMoreActionsOpen(false);
                    onNavigate('classes');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Add Class</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMoreActionsOpen(false);
                    onNavigate('academics');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Add Subject</span>
                </button>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreActionsOpen(false);
                      onOpenCustomizer();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Customize Dashboard</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

