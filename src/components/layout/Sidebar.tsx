import React, { useState, useEffect } from 'react';
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
  ChevronsUpDown,
  Compass,
  KeyRound,
  Check,
  X,
  MapPin,
  ChevronUp,
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
  | 'users'
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
  const {
    currentUser,
    isAdmin,
    isAccountant,
    isTeacher,
    isParent,
    isStudent,
    isLibrarian,
    isStorekeeper,
    isTransportManager,
    isRegistrar,
    switchPersona,
    logout,
  } = useAuth();
  const { settings } = useSchoolSettings();

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const personas: { role: UserRole; title: string; desc: string; icon: string }[] = [
    { role: 'SUPER_ADMIN', title: 'Super Admin', desc: 'Full Operations & Board Access', icon: '👑' },
    { role: 'PRINCIPAL', title: 'Principal / Head Teacher', desc: 'Academic & Admin Oversight', icon: '🎓' },
    { role: 'ACCOUNTANT', title: 'Accountant (CPA-K)', desc: 'Fees, M-Pesa & Financials', icon: '💰' },
    { role: 'TEACHER', title: 'Teacher / Facilitator', desc: 'Assigned Classes & Attendance', icon: '📚' },
    { role: 'REGISTRAR', title: 'Registrar / Admissions', desc: 'Applications & Pupil Records', icon: '📝' },
    { role: 'PARENT', title: 'Parent / Guardian', desc: 'Child Academic & Fee Portal', icon: '👨‍👩‍👧' },
    { role: 'STUDENT', title: 'Learner (Grade 6)', desc: 'Student Portal & Timetable', icon: '🎒' },
  ];

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, show: true },
      ],
    },
    {
      title: 'SCHOOL & LEARNERS',
      items: [
        { id: 'students', label: 'Learners Directory', icon: Users, show: !isParent && !isStudent },
        { id: 'admissions', label: 'Admissions & Enrollment', icon: UserPlus, badge: 'New', show: isAdmin || isRegistrar },
        { id: 'parent_portal', label: 'Parents & Guardians', icon: UserCheck, show: isParent || isAdmin },
        { id: 'classes', label: 'Classes & Streams', icon: GraduationCap, show: isAdmin || isTeacher },
        { id: 'staff', label: 'Teachers & Faculty', icon: UserCheck2, show: isAdmin },
      ],
    },
    {
      title: 'ACADEMICS & CBC',
      items: [
        { id: 'academics', label: 'CBC Curriculum', icon: BookOpen, show: isAdmin || isTeacher },
        { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck, show: !isParent && !isStudent },
        { id: 'examinations', label: 'CBC Gradebook & Reports', icon: Award, show: !isParent && !isStudent },
        { id: 'timetable', label: 'Master Timetables', icon: Calendar, show: true },
        { id: 'assignments', label: 'Homework & Projects', icon: FileText, show: true },
      ],
    },
    {
      title: 'FINANCE & ACCOUNTS',
      items: [
        { id: 'finance', label: 'Fees & Billing', icon: Wallet, badge: 'M-Pesa', show: isAdmin || isAccountant },
      ],
    },
    {
      title: 'SCHOOL OPERATIONS',
      items: [
        { id: 'library', label: 'Library Catalog', icon: Library, show: isAdmin || isLibrarian || isTeacher || isStudent },
        { id: 'inventory', label: 'Store & Inventory', icon: Package, show: isAdmin || isStorekeeper },
        { id: 'transport', label: 'School Transport', icon: Bus, show: isAdmin || isTransportManager || isParent },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        { id: 'announcements', label: 'School Broadcasts', icon: Bell, show: true },
      ],
    },
    {
      title: 'PORTALS',
      items: [
        { id: 'student_portal', label: 'Student Portal', icon: GraduationCap, show: isStudent || isAdmin },
      ],
    },
    {
      title: 'PUBLIC WEBSITE',
      items: [
        { id: 'website_view', label: 'View Public Website', icon: Globe, badge: 'Live', show: true },
        { id: 'website_cms', label: 'Website CMS Editor', icon: Sliders, show: isAdmin },
      ],
    },
    {
      title: 'ADMINISTRATION & SECURITY',
      items: [
        { id: 'users', label: 'User Logins & Accounts', icon: KeyRound, show: isAdmin },
        { id: 'settings', label: 'School Settings', icon: Settings, show: isAdmin },
        { id: 'audit_logs', label: 'System Audit Logs', icon: ShieldAlert, show: isAdmin },
      ],
    },
  ];

  // Auto-expand section containing activeTab
  useEffect(() => {
    const activeSection = navSections.find((sec) =>
      sec.items.some((item) => item.id === activeTab && item.show)
    );
    if (activeSection) {
      setCollapsedSections((prev) => {
        if (prev[activeSection.title] === true) {
          return { ...prev, [activeSection.title]: false };
        }
        return prev;
      });
    }
  }, [activeTab]);

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCollapseAll = () => {
    const newCollapsed: Record<string, boolean> = {};
    navSections.forEach((s) => {
      newCollapsed[s.title] = true;
    });
    setCollapsedSections(newCollapsed);
  };

  const handleExpandAll = () => {
    setCollapsedSections({});
  };

  const handleQuickDropdownSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTab = e.target.value as NavTab;
    if (selectedTab) {
      setActiveTab(selectedTab);
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => {
            setIsOpen(false);
            setUserDropdownOpen(false);
          }}
        />
      )}

      <aside
        id="erp-main-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-80 max-w-[85vw] bg-[#064e3b] text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:h-full lg:translate-x-0 shrink-0 select-none border-r border-emerald-900/40 shadow-2xl lg:shadow-lg ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-emerald-800/40 bg-emerald-950/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white font-black text-sm shadow-xs border border-emerald-300/30 shrink-0">
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
              <p className="text-[11px] text-emerald-300/90 font-medium tracking-wide truncate">
                {settings.motto || 'Excellence in Character, Innovation & Leadership'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400/80 mt-0.5">
                <MapPin className="w-2.5 h-2.5" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl bg-emerald-900/80 text-emerald-300 hover:text-white hover:bg-emerald-800 lg:hidden cursor-pointer shrink-0 transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Module Jump Dropdown Bar */}
        <div className="px-3 pt-3 pb-2 border-b border-emerald-800/30 bg-emerald-950/20 space-y-2">
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-900/60 hover:bg-emerald-900/80 border border-emerald-700/50 rounded-xl text-xs text-white shadow-inner transition cursor-pointer">
              <Compass className="w-4 h-4 text-emerald-300 shrink-0" />
              <select
                id="sidebar-quick-module-dropdown"
                value={activeTab}
                onChange={handleQuickDropdownSelect}
                className="w-full bg-transparent text-white font-semibold text-xs focus:outline-hidden cursor-pointer appearance-none pr-5 truncate"
                aria-label="Quick jump to module dropdown"
              >
                {navSections.map((sec) => (
                  <optgroup key={sec.title} label={sec.title} className="bg-emerald-950 text-white font-bold">
                    {sec.items
                      .filter((item) => item.show)
                      .map((item) => (
                        <option key={item.id} value={item.id} className="bg-emerald-900 text-slate-100 font-normal">
                          {item.label}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-300 pointer-events-none absolute right-3" />
            </div>
          </div>

          {/* Quick Collapse / Expand All Section Controls */}
          <div className="flex items-center justify-between text-[10px] text-emerald-400/80 px-1 font-medium">
            <span>Navigation Menu</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExpandAll}
                className="hover:text-white transition cursor-pointer underline decoration-emerald-600 underline-offset-2"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="hover:text-white transition cursor-pointer underline decoration-emerald-600 underline-offset-2"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-emerald-800 scrollbar-track-transparent">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((i) => i.show);
            if (visibleItems.length === 0) return null;

            const isCollapsed = collapsedSections[section.title] || false;
            const hasActiveItem = visibleItems.some((i) => i.id === activeTab);

            return (
              <div key={section.title} className="space-y-1">
                {/* Section Header Toggle */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    hasActiveItem
                      ? 'text-emerald-200 bg-emerald-950/40'
                      : 'text-emerald-400/80 hover:text-white hover:bg-emerald-900/30'
                  }`}
                >
                  <span className="truncate">{section.title}</span>
                  <div className="flex items-center gap-1">
                    {hasActiveItem && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                </button>

                {/* Section Items */}
                {!isCollapsed && (
                  <div className="space-y-1 pl-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.id);
                            if (window.innerWidth < 1024) {
                              setIsOpen(false);
                            }
                          }}
                          className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                            isActive
                              ? 'bg-white text-emerald-950 font-extrabold shadow-md transform translate-x-1'
                              : 'text-emerald-100 hover:text-white hover:bg-emerald-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-emerald-700' : 'text-emerald-300'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                                isActive
                                  ? 'bg-emerald-900 text-white'
                                  : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/50'
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

        {/* User Persona & Role Switcher Footer */}
        <div className="p-3 border-t border-emerald-800/40 bg-emerald-950/50 relative">
          <div
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/80 border border-emerald-700/40 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs border border-emerald-400/30">
                {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.displayName || 'Dr. Josephat'}
                </p>
                <p className="text-[10px] text-emerald-300/80 font-medium truncate">
                  {currentUser?.role ? currentUser.role.replace('_', ' ') : 'Director'}
                </p>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-emerald-300 shrink-0" />
          </div>

          {/* Persona Switcher Dropdown Popover */}
          {userDropdownOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-emerald-950 border border-emerald-700/80 rounded-2xl shadow-2xl p-2 space-y-1 z-50 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150 max-h-80 overflow-y-auto">
              <div className="px-2.5 py-1.5 border-b border-emerald-800/60 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Switch Operational Role
                </span>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(false)}
                  className="text-emerald-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {personas.map((p) => {
                const isCurrent = currentUser?.role === p.role;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={async () => {
                      await switchPersona(p.role);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-800 text-white font-bold'
                        : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                    }`}
                  >
                    <span className="text-sm shrink-0">{p.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold leading-tight">{p.title}</p>
                      <p className="text-[10px] text-emerald-300/70 truncate">{p.desc}</p>
                    </div>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />}
                  </button>
                );
              })}

              <div className="pt-1.5 border-t border-emerald-800/60">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setUserDropdownOpen(false);
                    setActiveTab('website_view');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition cursor-pointer text-xs font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out to Public Website</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
