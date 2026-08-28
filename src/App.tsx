/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

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

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, isParent, isStudent } = useAuth();

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

  // If viewing the public website, provide full screen view with floating ERP switcher
  if (activeTab === 'website_view') {
    return (
      <div className="min-h-screen w-full bg-slate-900 overflow-y-auto">
        <PublicWebsite
          onNavigateToPortal={(tab) => setActiveTab(tab || 'dashboard')}
          onOpenCMS={() => setActiveTab('website_cms')}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden font-sans antialiased">
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
