import React, { useState } from 'react';
import {
  X,
  Check,
  Sliders,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export interface DashboardWidgetConfig {
  showKpiCards: boolean;
  showAttendanceAnalytics: boolean;
  showFeeCollection: boolean;
  showLearnerDistribution: boolean;
  showTodaySchedule: boolean;
  showNotifications: boolean;
  showQuickActions: boolean;
  showRecentActivity: boolean;
}

export const defaultWidgetConfig: DashboardWidgetConfig = {
  showKpiCards: true,
  showAttendanceAnalytics: true,
  showFeeCollection: true,
  showLearnerDistribution: true,
  showTodaySchedule: true,
  showNotifications: true,
  showQuickActions: true,
  showRecentActivity: true,
};

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DashboardWidgetConfig;
  onSave: (config: DashboardWidgetConfig) => void;
}

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [localConfig, setLocalConfig] = useState<DashboardWidgetConfig>(config);

  if (!isOpen) return null;

  const toggleWidget = (key: keyof DashboardWidgetConfig) => {
    setLocalConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const handleReset = () => {
    setLocalConfig(defaultWidgetConfig);
  };

  const widgetsList: { key: keyof DashboardWidgetConfig; label: string; desc: string }[] = [
    {
      key: 'showKpiCards',
      label: 'Core KPI Cards',
      desc: 'Total learners, attendance rate, fees collected, and outstanding arrears',
    },
    {
      key: 'showAttendanceAnalytics',
      label: 'Attendance & Punctuality Chart',
      desc: 'Weekly attendance visualizer with Best Day & Attention indicators',
    },
    {
      key: 'showFeeCollection',
      label: 'Fee Collection Progress Card',
      desc: 'Term target meter, M-Pesa & bank reconciliation stats',
    },
    {
      key: 'showLearnerDistribution',
      label: 'CBC Learner Distribution',
      desc: 'Enrollment across Playgroup to Grade 9 Junior Secondary',
    },
    {
      key: 'showTodaySchedule',
      label: 'Today’s Academic Schedule',
      desc: 'Master timetable events with live ongoing / upcoming period tags',
    },
    {
      key: 'showNotifications',
      label: 'Notifications & Broadcasts',
      desc: 'Recent payments, admissions, and announcement alerts',
    },
    {
      key: 'showQuickActions',
      label: 'Quick Operations Grid',
      desc: 'Instant action buttons for enrolling, payments, roll call & marks',
    },
    {
      key: 'showRecentActivity',
      label: 'Recent Institutional Activity',
      desc: 'Live audit log of administrative and teacher entries',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-sans">
                Customize Dashboard View
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Choose which modules and metric cards appear on your overview
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {widgetsList.map((item) => {
            const isEnabled = localConfig[item.key];
            return (
              <div
                key={item.key}
                onClick={() => toggleWidget(item.key)}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                  isEnabled
                    ? 'bg-emerald-50/40 border-emerald-300/80 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">{item.label}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.desc}</p>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isEnabled ? <Check className="w-4 h-4" /> : <EyeOff className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
