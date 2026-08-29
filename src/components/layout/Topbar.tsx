import React, { useState } from 'react';
import {
  Menu,
  Search,
  UserCheck,
  Bell,
  RefreshCw,
  ChevronDown,
  Calendar,
  Layers,
  Award,
  Wallet,
  Users,
  Check,
  ChevronRight,
  Shield,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { checkAndSeedInitialData } from '../../services/seedService';
import { NavTab } from './Sidebar';
import { LoginModal } from '../auth/LoginModal';

interface TopbarProps {
  onToggleSidebar: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  activeTab,
  setActiveTab,
}) => {
  const { currentUser, switchPersona, logout, isLoginModalOpen, setIsLoginModalOpen } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const personas: { role: UserRole; title: string; desc: string; icon: string }[] = [
    { role: 'SUPER_ADMIN', title: 'Super Admin', desc: 'Full System & Operations Access', icon: '👑' },
    { role: 'PRINCIPAL', title: 'Principal / Head Teacher', desc: 'Academic & Admin Oversight', icon: '🎓' },
    { role: 'ACCOUNTANT', title: 'Accountant (CPA-K)', desc: 'Fees, M-Pesa & Financials', icon: '💰' },
    { role: 'TEACHER', title: 'Class Facilitator / Teacher', desc: 'Assigned Classes, Marks & Attendance', icon: '📚' },
    { role: 'REGISTRAR', title: 'Registrar / Admissions', desc: 'Applications & Student Records', icon: '📝' },
    { role: 'PARENT', title: 'Parent / Guardian', desc: 'Child Academic & Fee Portal', icon: '👨‍👩‍👧' },
    { role: 'STUDENT', title: 'Learner (Grade 6)', desc: 'Student Portal, CBC Marks & Timetable', icon: '🎒' },
    { role: 'LIBRARIAN', title: 'Librarian', desc: 'Books Catalog & Borrowing', icon: '📖' },
    { role: 'STOREKEEPER', title: 'Storekeeper', desc: 'Inventory, Uniforms & Stock', icon: '📦' },
    { role: 'TRANSPORT_MANAGER', title: 'Transport Manager', desc: 'Buses, Routes & Fleet', icon: '🚌' },
  ];

  const handleForceReseed = async () => {
    if (confirm('Re-seed initial Uwezo Elite School dataset to Firestore?')) {
      setSeeding(true);
      await checkAndSeedInitialData(true);
      setSeeding(false);
      window.location.reload();
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    await switchPersona(role);
    setRoleDropdownOpen(false);
    if (role === 'PARENT') {
      setActiveTab('parent_portal');
    } else if (role === 'STUDENT') {
      setActiveTab('student_portal');
    } else if (role === 'ACCOUNTANT') {
      setActiveTab('finance');
    }
  };

  const getBreadcrumbTitle = (tab: string) => {
    const map: Record<string, string> = {
      dashboard: 'Overview',
      students: 'Learners Directory',
      admissions: 'New Admissions',
      classes: 'Classes & Streams',
      academics: 'CBC Curriculum',
      attendance: 'Daily Attendance',
      examinations: 'CBC Gradebook & Reports',
      timetable: 'Master Timetables',
      assignments: 'Homework & Projects',
      staff: 'Teachers & Staff Faculty',
      teachers: 'Teachers & Staff Faculty',
      finance: 'Fees & Financials',
      library: 'Library Catalog',
      inventory: 'Store & Inventory',
      transport: 'School Fleet & Routes',
      announcements: 'School Announcements',
      parent_portal: 'Parent Portal',
      student_portal: 'Student Portal',
      website_view: 'Live Public Website',
      website_cms: 'Website Content Management System (CMS)',
      settings: 'School Settings',
      audit_logs: 'System Audit Logs',
    };
    return map[tab] || (tab ? tab.replace('_', ' ') : 'Dashboard');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/70 shadow-xs px-4 py-2.5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="mobile-menu-toggle-btn"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden transition"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
              <span className="hidden sm:inline text-slate-400 font-medium">Uwezo Elite School</span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-slate-900 text-sm">
                {getBreadcrumbTitle(activeTab)}
              </span>
            </div>

            {/* Academic Term Badge */}
            <div className="hidden xl:flex items-center gap-1.5 bg-emerald-50/80 text-emerald-800 text-xs px-2.5 py-1 rounded-full border border-emerald-200/70 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>AY 2025/2026 • Term 1</span>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="global-search-input"
                type="text"
                placeholder="Search learners, admission no, receipt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Right: Notifications, Reset Demo Data, and User Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Login with Username / Password Button */}
            <button
              id="topbar-login-modal-btn"
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Sign in with username and password created by Super Admin"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Sign In / Switch</span>
            </button>

            {/* Quick Reseed */}
            <button
              id="reseed-data-btn"
              onClick={handleForceReseed}
              disabled={seeding}
              title="Reset/Seed Sample Data in Firestore"
              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition border border-slate-200/70 hidden sm:flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden 2xl:inline">{seeding ? 'Seeding...' : 'Reset Demo Data'}</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="notifications-btn"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition relative cursor-pointer border border-slate-200/70"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white"></span>
              </button>

              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-xl border border-slate-200/80 z-50 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-800">School Notifications</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">2 New</span>
                    </div>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <p className="font-bold text-slate-800">Term 1 CBC Assessment</p>
                        <p className="text-[11px] text-slate-500">Continuous assessment window opens next Monday.</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">10 mins ago</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <p className="font-bold text-slate-800">Fee Remittance (M-Pesa)</p>
                        <p className="text-[11px] text-slate-500">KES 15,000 received for Ethan Kamau (Grade 4 East).</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile & Persona Switcher */}
            <div className="relative">
              <button
                id="persona-switcher-btn"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs transition border border-slate-200/70 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser?.displayName ? currentUser.displayName.slice(0, 2) : 'UE'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                    {currentUser?.displayName || 'Dr. Josephat Mwangi'}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-semibold capitalize">
                    {currentUser?.role ? currentUser.role.replace('_', ' ').toLowerCase() : 'Super Admin'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {roleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div
                    id="persona-dropdown-menu"
                    className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200/80 z-50 p-2 space-y-1 text-xs"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Active Account Session
                      </p>
                      <p className="text-xs text-slate-900 font-bold mt-0.5 truncate">
                        {currentUser?.displayName}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        @{currentUser?.username || 'user'} • {currentUser?.email}
                      </p>
                    </div>

                    <div className="p-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          setIsLoginModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-bold text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer border border-emerald-200/80"
                      >
                        <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Login with Username & Password</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          logout();
                          setActiveTab('website_view' as any);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-semibold text-xs text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Sign Out of Session</span>
                      </button>
                    </div>

                    <div className="px-3 pt-2 pb-1 border-t border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Quick Switch Persona
                      </p>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
                      {personas.map((p) => {
                        const isCurrent = currentUser?.role === p.role;
                        return (
                          <button
                            key={p.role}
                            onClick={() => handleRoleSelect(p.role)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition cursor-pointer ${
                              isCurrent
                                ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-base">{p.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs truncate">{p.title}</p>
                              <p className="text-[10px] text-slate-500 truncate">{p.desc}</p>
                            </div>
                            {isCurrent && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

