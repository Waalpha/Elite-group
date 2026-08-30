import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  GraduationCap,
  Wallet,
  CalendarCheck,
  Award,
  BookOpen,
  X,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';
import { Student, Teacher, FeePayment } from '../../types';
import { NavTab } from '../layout/Sidebar';

interface SearchCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  teachers: Teacher[];
  payments: FeePayment[];
  onNavigate: (tab: NavTab) => void;
}

export const SearchCommandModal: React.FC<SearchCommandModalProps> = ({
  isOpen,
  onClose,
  students,
  teachers,
  payments,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle handled by caller
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Navigation module shortcuts
  const navigationItems: { title: string; tab: NavTab; category: string }[] = [
    { title: 'Overview Dashboard', tab: 'dashboard', category: 'Navigation' },
    { title: 'Learners Directory & Profiles', tab: 'students', category: 'Navigation' },
    { title: 'Admissions & Applications', tab: 'admissions', category: 'Navigation' },
    { title: 'Classes & Streams', tab: 'classes', category: 'Navigation' },
    { title: 'CBC Curriculum & Competencies', tab: 'academics', category: 'Navigation' },
    { title: 'Daily Attendance & QR Scanner', tab: 'attendance', category: 'Navigation' },
    { title: 'CBC Gradebook & Reports', tab: 'examinations', category: 'Navigation' },
    { title: 'Fee Collection & Finance', tab: 'finance', category: 'Navigation' },
    { title: 'Master Timetables & Schedules', tab: 'timetable', category: 'Navigation' },
    { title: 'Teachers & Faculty Staff', tab: 'staff', category: 'Navigation' },
    { title: 'School Library Catalog', tab: 'library', category: 'Navigation' },
    { title: 'Store & Inventory', tab: 'inventory', category: 'Navigation' },
    { title: 'Transport & Bus Routes', tab: 'transport', category: 'Navigation' },
    { title: 'School Announcements', tab: 'announcements', category: 'Navigation' },
    { title: 'Parent / Guardian Portal', tab: 'parent_portal', category: 'Navigation' },
    { title: 'Student Portal', tab: 'student_portal', category: 'Navigation' },
    { title: 'Live Public Website', tab: 'website_view', category: 'Navigation' },
    { title: 'User Accounts & Logins Management', tab: 'users', category: 'Security' },
    { title: 'School Settings & Branding', tab: 'settings', category: 'Navigation' },
    { title: 'System Security & Audit Logs', tab: 'audit_logs', category: 'Navigation' },
  ];

  const filteredNav = cleanQuery
    ? navigationItems.filter((item) => item.title.toLowerCase().includes(cleanQuery))
    : navigationItems.slice(0, 4);

  const filteredStudents = cleanQuery
    ? students
        .filter(
          (s) =>
            s.fullName.toLowerCase().includes(cleanQuery) ||
            s.admissionNumber.toLowerCase().includes(cleanQuery) ||
            s.currentClass.toLowerCase().includes(cleanQuery) ||
            (s.parentPhone && s.parentPhone.includes(cleanQuery))
        )
        .slice(0, 5)
    : [];

  const filteredTeachers = cleanQuery
    ? teachers
        .filter(
          (t) =>
            t.fullName.toLowerCase().includes(cleanQuery) ||
            (t.tscNumber && t.tscNumber.toLowerCase().includes(cleanQuery)) ||
            (t.department && t.department.toLowerCase().includes(cleanQuery))
        )
        .slice(0, 3)
    : [];

  const handleSelectNav = (tab: NavTab) => {
    onNavigate(tab);
    onClose();
  };

  const handleSelectStudent = () => {
    onNavigate('students');
    onClose();
  };

  const handleSelectTeacher = () => {
    onNavigate('staff');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Field */}
        <div className="p-4 border-b border-slate-200/80 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search learners, admission numbers, parents, staff, fees, modules... (e.g. Grade 6, Ethan, Tr. Sarah)"
            className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 focus:outline-hidden placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded-md">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="p-4 overflow-y-auto space-y-4 divide-y divide-slate-100">
          {/* Learners Match */}
          {filteredStudents.length > 0 && (
            <div className="space-y-2 pt-2 first:pt-0">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                Learners & Pupils ({filteredStudents.length})
              </p>
              <div className="space-y-1">
                {filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    onClick={handleSelectStudent}
                    className="p-2.5 rounded-xl hover:bg-emerald-50/80 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {s.firstName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 truncate">{s.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Adm: <span className="font-mono">{s.admissionNumber}</span> • {s.currentClass} {s.stream} • Parent: {s.parentName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-emerald-700">
                        Bal: KES {(s.feeBalance || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teachers Match */}
          {filteredTeachers.length > 0 && (
            <div className="space-y-2 pt-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800">
                Teachers & Faculty ({filteredTeachers.length})
              </p>
              <div className="space-y-1">
                {filteredTeachers.map((t) => (
                  <div
                    key={t.id}
                    onClick={handleSelectTeacher}
                    className="p-2.5 rounded-xl hover:bg-blue-50/80 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {t.firstName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 truncate">{t.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Dept: {t.department} • TSC: {t.tscNumber || 'Registered'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modules Navigation */}
          {filteredNav.length > 0 && (
            <div className="space-y-2 pt-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                ERP Navigation Modules
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredNav.map((item) => (
                  <div
                    key={item.tab}
                    onClick={() => handleSelectNav(item.tab)}
                    className="p-2.5 rounded-xl hover:bg-slate-100 transition cursor-pointer flex items-center justify-between gap-2 text-xs border border-transparent hover:border-slate-200"
                  >
                    <span className="font-bold text-slate-800">{item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {cleanQuery && filteredStudents.length === 0 && filteredTeachers.length === 0 && filteredNav.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No matching learners, teachers, or modules found for &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Footer Shortcut Keys */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Press <strong className="text-slate-700">ESC</strong> to exit</span>
            <span>•</span>
            <span>Click any result to jump instantly</span>
          </div>
          <span className="font-bold text-emerald-800">Uwezo Global Search</span>
        </div>
      </div>
    </div>
  );
};
