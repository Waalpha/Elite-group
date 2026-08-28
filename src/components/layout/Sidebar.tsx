import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Wallet,
  Calendar,
  FileText,
  Bell,
  Library,
  Package,
  Bus,
  UserCheck,
  Settings,
  ShieldAlert,
  UserPlus,
  UserCheck2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  School,
  LogOut,
  Globe,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchoolSettings } from '../../contexts/SettingsContext';
import { UserRole } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'students'
  | 'admissions'
  | 'classes'
  | 'academics'
  | 'staff'
  | 'attendance'
  | 'examinations'
  | 'finance'
  | 'timetable'
  | 'assignments'
  | 'announcements'
  | 'library'
  | 'inventory'
  | 'transport'
  | 'parent_portal'
  | 'student_portal'
  | 'website_view'
  | 'website_cms'
  | 'settings'
  | 'audit_logs';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavSection {
  title: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    show: boolean;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) => {
  const { currentUser, isAdmin, isAccountant, isTeacher, isParent, isStudent, isLibrarian, isStorekeeper, isTransportManager, isRegistrar } = useAuth();
  const { settings } = useSchoolSettings();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
      ],
    },
    {
      title: 'PUBLIC WEBSITE',
      items: [
        { id: 'website_view', label: 'View Public Website', icon: Globe, badge: 'Live', show: true },
        { id: 'website_cms', label: 'Website CMS Control', icon: Sliders, show: isAdmin },
      ],
    },
    {
      title: 'STUDENTS',
      items: [
        { id: 'students', label: 'Learners', icon: Users, show: !isParent && !isStudent },
        { id: 'admissions', label: 'Admissions', icon: UserPlus, badge: 'New', show: isAdmin || isRegistrar },
        { id: 'parent_portal', label: 'Parents & Guardians', icon: UserCheck, show: isParent || isAdmin },
      ],
    },
    {
      title: 'ACADEMICS',
      items: [
        { id: 'classes', label: 'Classes & Streams', icon: GraduationCap, show: isAdmin || isTeacher },
        { id: 'academics', label: 'CBC Curriculum', icon: BookOpen, show: isAdmin || isTeacher },
        { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck, show: !isParent && !isStudent },
        { id: 'examinations', label: 'CBC Gradebook & Reports', icon: Award, show: !isParent && !isStudent },
        { id: 'timetable', label: 'Master Timetables', icon: Calendar, show: true },
        { id: 'assignments', label: 'Homework & Projects', icon: FileText, show: true },
      ],
    },
    {
      title: 'STAFF & FACULTY',
      items: [
        { id: 'staff', label: 'Teachers & Staff', icon: UserCheck2, show: isAdmin },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { id: 'finance', label: 'Fees & Accounts', icon: Wallet, badge: 'M-Pesa', show: isAdmin || isAccountant },
      ],
    },
    {
      title: 'FACILITIES',
      items: [
        { id: 'library', label: 'Library Books', icon: Library, show: isAdmin || isLibrarian || isTeacher || isStudent },
        { id: 'inventory', label: 'Store & Inventory', icon: Package, show: isAdmin || isStorekeeper },
        { id: 'transport', label: 'School Transport', icon: Bus, show: isAdmin || isTransportManager || isParent },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        { id: 'announcements', label: 'Announcements', icon: Bell, show: true },
      ],
    },
    {
      title: 'PORTALS',
      items: [
        { id: 'student_portal', label: 'Student Portal', icon: GraduationCap, show: isStudent || isAdmin },
      ],
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        { id: 'settings', label: 'School Settings', icon: Settings, show: isAdmin },
        { id: 'audit_logs', label: 'System Audit Logs', icon: ShieldAlert, show: isAdmin },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        id="erp-main-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#064e3b] text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:h-full lg:translate-x-0 shrink-0 select-none border-r border-emerald-900/40 shadow-lg`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-emerald-800/40 bg-emerald-950/30">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-emerald-400/20 shrink-0 overflow-hidden">
                <img
                  src={settings.logoUrl}
                  alt={settings.schoolName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-xs border border-emerald-400/20 shrink-0">
                {(settings.schoolName || 'UES')
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 3)
                  .join('')
                  .toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-extrabold text-white tracking-tight leading-tight truncate font-sans">
                {settings.schoolName || 'UWEZO ELITE SCHOOL'}
              </h1>
              <p className="text-[11px] text-emerald-300/80 font-medium tracking-wide truncate">
                {settings.motto || 'School Management System'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3.5 space-y-3.5 overflow-y-auto custom-scrollbar text-xs">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item) => item.show);
            if (visibleItems.length === 0) return null;
            const isCollapsed = !!collapsedSections[section.title];

            return (
              <div key={section.title} className="space-y-0.5">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-300/60 hover:text-emerald-200 uppercase transition cursor-pointer"
                >
                  <span>{section.title}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-emerald-400/50" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-emerald-400/50" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5 mt-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`nav-btn-${item.id}`}
                          onClick={() => {
                            setActiveTab(item.id);
                            if (window.innerWidth < 1024) setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all duration-150 group cursor-pointer ${
                            isActive
                              ? 'bg-white text-emerald-950 font-bold shadow-xs'
                              : 'text-emerald-100/90 hover:bg-emerald-800/40 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-emerald-700' : 'text-emerald-300/70 group-hover:text-emerald-200'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tight ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/40'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Dynamic Logged-in User Card in Sidebar Bottom */}
        <div className="p-3 border-t border-emerald-800/40 bg-emerald-950/40">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800/40">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-inner">
              {currentUser?.displayName ? currentUser.displayName.slice(0, 2) : 'UE'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {currentUser?.displayName || 'Dr. Josephat Mwangi'}
              </p>
              <span className="inline-block text-[10px] text-emerald-300/90 font-medium">
                {currentUser?.role ? currentUser.role.replace('_', ' ') : 'SUPER ADMIN'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
