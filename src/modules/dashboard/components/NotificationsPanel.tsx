import React from 'react';
import {
  Bell,
  Wallet,
  UserPlus,
  CalendarCheck,
  Award,
  BookOpen,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { FeePayment, AdmissionApplication, Announcement } from '../../../types';

interface NotificationsPanelProps {
  payments: FeePayment[];
  admissions: AdmissionApplication[];
  announcements: Announcement[];
  onNavigate: (tab: string) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  payments,
  admissions,
  announcements,
  onNavigate,
}) => {
  // Generate alerts from real data
  const notifications = [
    {
      id: '1',
      title: 'M-Pesa Fee Payment Received',
      desc: 'KES 35,000 received for Ethan Kamau (UES-2024-0102) via Paybill 247247.',
      time: '12m ago',
      type: 'payment',
      unread: true,
    },
    {
      id: '2',
      title: 'New Admission Application',
      desc: 'Applicant Faith Wanjiku applied for Grade 1 East placement.',
      time: '45m ago',
      type: 'admission',
      unread: true,
    },
    {
      id: '3',
      title: 'CBC Gradebook Assessment Ready',
      desc: 'Grade 6 STEM & Agriculture assessment marks submitted by Tr. Sarah.',
      time: '2h ago',
      type: 'academic',
      unread: false,
    },
    {
      id: '4',
      title: 'Term 1 Mid-Term Circular',
      desc: 'Parent communication regarding visiting day and sports gala published.',
      time: '5h ago',
      type: 'announcement',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'admission':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'academic':
        return <Award className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-amber-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-emerald-50';
      case 'admission':
        return 'bg-blue-50';
      case 'academic':
        return 'bg-purple-50';
      default:
        return 'bg-amber-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-sans">
                Notifications & Broadcasts
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live alerts for admissions, payments, and notices
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
              {unreadCount} New
            </span>
          )}
        </div>

        <div className="mt-5 space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-xl border transition flex items-start gap-3 ${
                notif.unread
                  ? 'bg-slate-50/80 border-slate-300/80'
                  : 'bg-white border-slate-200/60'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${getBgColor(notif.type)}`}>
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-normal mt-0.5 leading-relaxed">
                  {notif.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => onNavigate('announcements')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Mark All Read</span>
        </button>

        <button
          onClick={() => onNavigate('announcements')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
        >
          <span>All Announcements</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
