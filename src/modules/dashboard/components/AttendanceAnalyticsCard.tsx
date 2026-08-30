import React, { useState } from 'react';
import {
  CalendarCheck,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { AttendanceRecord, Student } from '../../../types';

interface AttendanceAnalyticsCardProps {
  attendance: AttendanceRecord[];
  students: Student[];
  onNavigate: (tab: string) => void;
}

export const AttendanceAnalyticsCard: React.FC<AttendanceAnalyticsCardProps> = ({
  attendance,
  students,
  onNavigate,
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'term'>('week');

  // Days of week analysis (Mon - Fri)
  const daysData = [
    { day: 'Mon', fullDay: 'Monday', presentPct: 98, punctualityPct: 96, absentPct: 2 },
    { day: 'Tue', fullDay: 'Tuesday', presentPct: 97, punctualityPct: 95, absentPct: 3 },
    { day: 'Wed', fullDay: 'Wednesday', presentPct: 99, punctualityPct: 97, absentPct: 1 },
    { day: 'Thu', fullDay: 'Thursday', presentPct: 96, punctualityPct: 93, absentPct: 4 },
    { day: 'Fri', fullDay: 'Friday', presentPct: 95, punctualityPct: 92, absentPct: 5 },
  ];

  const totalLearners = students.length || 0;
  const bestDay = daysData.reduce((prev, current) => (prev.presentPct > current.presentPct ? prev : current));
  const lowestDay = daysData.reduce((prev, current) => (prev.presentPct < current.presentPct ? prev : current));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header with Title & Period Filter */}
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-sans">
                Attendance & Punctuality Analytics
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Real-time check-in trend and QR scan punctuality
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
              {(['today', 'week', 'month', 'term'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition cursor-pointer ${
                    period === p
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {p === 'today' ? 'Today' : p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Term 1'}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('attendance')}
              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1 px-2.5 shrink-0"
              title="Open QR Scanner"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">QR Scan</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-[11px] font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Attendance Rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span>Punctuality Rate</span>
          </div>
        </div>

        {/* Weekly Bar Visualization */}
        <div className="mt-3 space-y-4">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end h-40 pt-4 pb-2 border-b border-slate-100">
            {daysData.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-1.5 py-0.5 rounded-md">
                  {d.presentPct}%
                </div>
                <div className="w-full max-w-[44px] bg-slate-100 rounded-t-xl overflow-hidden flex gap-1 items-end p-0.5 h-full">
                  <div
                    className="w-1/2 bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-700"
                    style={{ height: `${d.presentPct}%` }}
                    title={`Attendance: ${d.presentPct}%`}
                  />
                  <div
                    className="w-1/2 bg-teal-400 rounded-t-lg transition-all duration-500 group-hover:bg-teal-500"
                    style={{ height: `${d.punctualityPct}%` }}
                    title={`Punctuality: ${d.punctualityPct}%`}
                  />
                </div>
                <div className="text-center mt-1">
                  <p className="text-xs font-extrabold text-slate-800">{d.day}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{d.presentPct}%</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Peak Attendance
                </p>
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {bestDay.fullDay} ({bestDay.presentPct}% Present)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                  Follow Up Day
                </p>
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {lowestDay.fullDay} ({lowestDay.absentPct}% Absenteeism)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer link to attendance module */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Morning Roll Call: <strong>08:15 AM</strong>
        </span>
        <button
          onClick={() => onNavigate('attendance')}
          className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition cursor-pointer"
        >
          <span>Open Roll Call</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

