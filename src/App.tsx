/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Clock, ShieldAlert, LogOut, X, Sparkles } from 'lucide-react';

// Modules
import { DashboardModule } from './modules/dashboard/DashboardModule';
import { StudentsModule } from './modules/students/StudentsModule';
import { AdmissionsModule } from './modules/admissions/AdmissionsModule';
import { ClassesModule } from './modules/classes/ClassesModule';
import { AcademicsModule } from './modules/academics/AcademicsModule';
import { StaffModule } from './modules/staff/StaffModule';
import { AttendanceModule } from './modules/attendance/AttendanceModule';
import { ExaminationsModule } from './modules/examinations/ExaminationsModule';
import { FinanceModule } from './modules/finance/FinanceModule';
import { TimetableModule } from './modules/timetable/TimetableModule';
import { AssignmentsModule } from './modules/assignments/AssignmentsModule';
import { AnnouncementsModule } from './modules/announcements/AnnouncementsModule';
import { LibraryModule } from './modules/library/LibraryModule';
import { InventoryModule } from './modules/inventory/InventoryModule';
import { TransportModule } from './modules/transport/TransportModule';
import { ParentPortal } from './modules/portals/ParentPortal';
import { StudentPortal } from './modules/portals/StudentPortal';
import { PublicWebsite } from './modules/website/PublicWebsite';
import { WebsiteCMSModule } from './modules/settings/WebsiteCMSModule';
import { SettingsModule } from './modules/settings/SettingsModule';
import { AuditLogsModule } from './modules/settings/AuditLogsModule';

import { checkAndSeedInitialData } from './services/seedService';

// 5 minutes idle timeout (in milliseconds)
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 300,000 ms
const WARNING_TIMEOUT_MS = 4.5 * 60 * 1000; // 270,000 ms (gives 30s countdown warning)

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout, isParent, isStudent } = useAuth();

  // Idle Timer States
  const [idleSecondsRemaining, setIdleSecondsRemaining] = useState<number | null>(null);
  const [idleLoggedOutMessage, setIdleLoggedOutMessage] = useState<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const countdownIntervalRef = useRef<any>(null);

  // Auto route parent / student to their portal if they change persona
  useEffect(() => {
    if (isParent) {
      setActiveTab('parent_portal');
    } else if (isStudent) {
      setActiveTab('student_portal');
    }
  }, [currentUser?.role, isParent, isStudent]);

  // Seed default data if database is empty
  useEffect(() => {
    checkAndSeedInitialData(false).catch(console.error);
  }, []);

  // 5-Minute Inactivity Idle Detector
  useEffect(() => {
    // Only monitor idle activity when logged into the system (not on public website without session)
    if (activeTab === 'website_view' && !currentUser) {
      return;
    }

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      if (idleSecondsRemaining !== null) {
        setIdleSecondsRemaining(null);
      }
    };

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'touchmove',
      'scroll',
      'click',
      'wheel',
    ];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, updateActivity, { passive: true });
    });

    // Check inactivity every 1 second
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        // Trigger auto-logout due to 5 min idle
        logout();
        setActiveTab('website_view');
        setIdleSecondsRemaining(null);
        setIdleLoggedOutMessage(
          'You were automatically logged out and returned to the public school website after 5 minutes of inactivity for institutional security.'
        );
      } else if (elapsed >= WARNING_TIMEOUT_MS) {
        // Show 30-second warning countdown
        const remaining = Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000));
        setIdleSecondsRemaining(remaining);
      } else {
        if (idleSecondsRemaining !== null) {
          setIdleSecondsRemaining(null);
        }
      }
    }, 1000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, updateActivity);
      });
      clearInterval(interval);
    };
  }, [activeTab, currentUser, logout, idleSecondsRemaining]);

  const handleResetIdle = () => {
    lastActivityRef.current = Date.now();
    setIdleSecondsRemaining(null);
  };

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardModule onNavigate={setActiveTab} />;
      case 'students':
        return <StudentsModule />;
      case 'admissions':
        return <AdmissionsModule />;
      case 'classes':
        return <ClassesModule />;
      case 'academics':
        return <AcademicsModule />;
      case 'staff':
      case 'teachers':
        return <StaffModule />;
      case 'attendance':
        return <AttendanceModule />;
      case 'examinations':
        return <ExaminationsModule />;
      case 'finance':
        return <FinanceModule />;
      case 'timetable':
        return <TimetableModule />;
      case 'assignments':
        return <AssignmentsModule />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'library':
        return <LibraryModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'transport':
        return <TransportModule />;
      case 'parent_portal':
        return <ParentPortal />;
      case 'student_portal':
        return <StudentPortal />;
      case 'website_view':
        return (
          <PublicWebsite
            onNavigateToPortal={(tab) => setActiveTab(tab || 'dashboard')}
            onOpenCMS={() => setActiveTab('website_cms')}
          />
        );
      case 'website_cms':
        return (
          <WebsiteCMSModule
            onPreviewWebsite={() => setActiveTab('website_view')}
          />
        );
      case 'settings':
        return <SettingsModule />;
      case 'audit_logs':
        return <AuditLogsModule />;
      default:
        return <DashboardModule onNavigate={setActiveTab} />;
    }
  };

  // If viewing the public website, provide full screen view
  if (activeTab === 'website_view') {
    return (
      <div className="min-h-screen w-full bg-slate-900 overflow-y-auto relative">
        {/* Post-idle logout notification banner */}
        {idleLoggedOutMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] p-4 bg-slate-900/95 border border-emerald-500/50 shadow-2xl rounded-2xl text-white backdrop-blur-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-300">Idle Inactivity Session Timeout</p>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{idleLoggedOutMessage}</p>
            </div>
            <button
              onClick={() => setIdleLoggedOutMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <PublicWebsite
          onNavigateToPortal={(tab) => {
            setIdleLoggedOutMessage(null);
            setActiveTab(tab || 'dashboard');
          }}
          onOpenCMS={() => {
            setIdleLoggedOutMessage(null);
            setActiveTab('website_cms');
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden font-sans antialiased relative">
      {/* 30-Second Inactivity Warning Toast */}
      {idleSecondsRemaining !== null && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[92%] p-4 bg-slate-900 border border-amber-500/50 shadow-2xl rounded-2xl text-white backdrop-blur-xl animate-bounce">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-300">Inactivity Auto-Logout Warning</p>
              <p className="text-xs text-slate-300 mt-1">
                Logging out and switching to public website in{' '}
                <span className="font-extrabold text-amber-400 text-sm">{idleSecondsRemaining}s</span> due to 5 min idle.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleResetIdle}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Stay Logged In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setActiveTab('website_view');
                    setIdleSecondsRemaining(null);
                  }}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-rose-400 text-xs font-medium cursor-pointer"
                >
                  Log Out Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          activeTab={activeTab as any}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          setActiveTab={setActiveTab as any}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderModule()}</div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainLayout />
      </SettingsProvider>
    </AuthProvider>
  );
}
