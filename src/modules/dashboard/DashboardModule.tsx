import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NavTab } from '../../components/layout/Sidebar';
import {
  listenToStudents,
  listenToTeachers,
  listenToClasses,
  listenToFeePayments,
  listenToAttendance,
  listenToAnnouncements,
  listenToApplications,
  listenToAuditLogs,
} from '../../services/firebaseService';
import {
  Student,
  Teacher,
  ClassRoom,
  FeePayment,
  AttendanceRecord,
  Announcement,
  AdmissionApplication,
  AuditLog,
} from '../../types';

// Modular Dashboard Widgets
import { WelcomeHero } from './components/WelcomeHero';
import { KpiCardsSection } from './components/KpiCardsSection';
import { AttendanceAnalyticsCard } from './components/AttendanceAnalyticsCard';
import { FeeCollectionCard } from './components/FeeCollectionCard';
import { LearnerDistributionCard } from './components/LearnerDistributionCard';
import { TodayScheduleWidget } from './components/TodayScheduleWidget';
import { NotificationsPanel } from './components/NotificationsPanel';
import { QuickActionsGrid } from './components/QuickActionsGrid';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { SystemStatusBar } from './components/SystemStatusBar';
import {
  DashboardCustomizerModal,
  DashboardWidgetConfig,
  defaultWidgetConfig,
} from './components/DashboardCustomizerModal';

// Modals
import { QuickEnrollModal } from '../../components/modals/QuickEnrollModal';
import { QuickRecordPaymentModal } from '../../components/modals/QuickRecordPaymentModal';

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

  // Firestore Real-Time Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<DashboardWidgetConfig>(() => {
    const saved = localStorage.getItem('ues_dashboard_widget_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultWidgetConfig;
      }
    }
    return defaultWidgetConfig;
  });

  const navigateTo = (tab: NavTab | string) => {
    if (setActiveTab) {
      setActiveTab(tab as NavTab);
    } else if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleSaveWidgetConfig = (newConfig: DashboardWidgetConfig) => {
    setWidgetConfig(newConfig);
    try {
      localStorage.setItem('ues_dashboard_widget_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Could not cache widget config:', e);
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
    const unsubAdmissions = listenToApplications((data) => setAdmissions(data));
    const unsubAuditLogs = listenToAuditLogs((data) => setAuditLogs(data));

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubClasses();
      unsubPayments();
      unsubAttendance();
      unsubAnnouncements();
      unsubAdmissions();
      unsubAuditLogs();
    };
  }, []);

  const handleOpenEnroll = () => {
    if (onOpenRegisterStudent) {
      onOpenRegisterStudent();
    } else {
      setIsEnrollModalOpen(true);
    }
  };

  const handleOpenPayment = () => {
    if (onOpenRecordPayment) {
      onOpenRecordPayment();
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcome & High-Priority Action Banner */}
      <WelcomeHero
        onOpenRegisterStudent={handleOpenEnroll}
        onOpenRecordPayment={handleOpenPayment}
        onNavigate={navigateTo}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* 2. Core Live KPI Stats Cards */}
      {widgetConfig.showKpiCards && (
        <KpiCardsSection
          students={students}
          teachers={teachers}
          payments={payments}
          attendance={attendance}
          admissions={admissions}
          onNavigate={navigateTo}
          loading={loading}
        />
      )}

      {/* 3. Primary Analytical Grid: Attendance Visualizer & Fee Progress */}
      {(widgetConfig.showAttendanceAnalytics || widgetConfig.showFeeCollection) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgetConfig.showAttendanceAnalytics && (
            <AttendanceAnalyticsCard
              attendance={attendance}
              students={students}
              onNavigate={navigateTo}
            />
          )}

          {widgetConfig.showFeeCollection && (
            <FeeCollectionCard
              payments={payments}
              students={students}
              onNavigate={navigateTo}
              onOpenRecordPayment={handleOpenPayment}
            />
          )}
        </div>
      )}

      {/* 4. Secondary Analytical Grid: Learner Distribution & Master Schedule */}
      {(widgetConfig.showLearnerDistribution || widgetConfig.showTodaySchedule) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgetConfig.showLearnerDistribution && (
            <LearnerDistributionCard
              students={students}
              onNavigate={navigateTo}
            />
          )}

          {widgetConfig.showTodaySchedule && (
            <TodayScheduleWidget onNavigate={navigateTo} />
          )}
        </div>
      )}

      {/* 5. Quick Operations & Direct Action Triggers */}
      {widgetConfig.showQuickActions && (
        <QuickActionsGrid
          onOpenRegisterStudent={handleOpenEnroll}
          onOpenRecordPayment={handleOpenPayment}
          onNavigate={navigateTo}
        />
      )}

      {/* 6. Notifications & Institutional Audit Feed */}
      {(widgetConfig.showNotifications || widgetConfig.showRecentActivity) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgetConfig.showNotifications && (
            <NotificationsPanel
              payments={payments}
              admissions={admissions}
              announcements={announcements}
              onNavigate={navigateTo}
            />
          )}

          {widgetConfig.showRecentActivity && (
            <RecentActivityFeed
              auditLogs={auditLogs}
              onNavigate={navigateTo}
            />
          )}
        </div>
      )}

      {/* 7. Institutional Footer & System Status */}
      <SystemStatusBar />

      {/* Quick Enroll Learner Modal */}
      <QuickEnrollModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
      />

      {/* Quick Record Payment Modal */}
      <QuickRecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        students={students}
      />

      {/* Dashboard View Customizer Modal */}
      <DashboardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={widgetConfig}
        onSave={handleSaveWidgetConfig}
      />
    </div>
  );
};
