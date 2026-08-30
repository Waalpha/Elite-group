import React from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface TodayScheduleWidgetProps {
  onNavigate: (tab: string) => void;
}

export const TodayScheduleWidget: React.FC<TodayScheduleWidgetProps> = ({ onNavigate }) => {
  const scheduleItems = [
    {
      id: '1',
      time: '08:00 - 08:30 AM',
      title: 'School Assembly & National Anthem',
      grade: 'All School',
      venue: 'Main Courtyard',
      teacher: 'Tr. J. Mwangi',
      status: 'Completed',
    },
    {
      id: '2',
      time: '08:45 - 09:30 AM',
      title: 'Mathematics & STEM Activities',
      grade: 'Grade 7 East',
      venue: 'Room 12B',
      teacher: 'Tr. Sarah Ochieng',
      status: 'Ongoing',
    },
    {
      id: '3',
      time: '10:15 - 11:00 AM',
      title: 'English Language & Creative Writing',
      grade: 'Grade 5 West',
      venue: 'Room 8A',
      teacher: 'Tr. David Kiprop',
      status: 'Upcoming',
    },
    {
      id: '4',
      time: '11:45 - 12:30 PM',
      title: 'Kiswahili & Utamaduni Activities',
      grade: 'Grade 4 East',
      venue: 'Room 6',
      teacher: 'Mwl. Amina Hassan',
      status: 'Upcoming',
    },
    {
      id: '5',
      time: '02:00 - 03:15 PM',
      title: 'CBC Practical Science & Robotics',
      grade: 'Grade 8 STEM Lab',
      venue: 'Innovation Hub',
      teacher: 'Tr. Eric Mutua',
      status: 'Upcoming',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-sans">
                Today&apos;s Academic Schedule
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Active master timetable & period transitions
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
            5 Periods Scheduled
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {scheduleItems.map((item) => {
            const isOngoing = item.status === 'Ongoing';
            const isCompleted = item.status === 'Completed';

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                  isOngoing
                    ? 'bg-emerald-50/70 border-emerald-300/80 shadow-xs'
                    : isCompleted
                    ? 'bg-slate-50/60 border-slate-200/60 opacity-70'
                    : 'bg-white border-slate-200/70 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </span>
                    {isOngoing && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100/90 px-2 py-0.2 rounded-full border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                        Live Now
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.2 rounded-full">
                        Done
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                    <span className="font-semibold text-slate-700">{item.grade}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.time}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.venue}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-slate-600 block">
                    {item.teacher}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          Next Period Bell: <strong>10:15 AM</strong>
        </span>
        <button
          onClick={() => onNavigate('timetable')}
          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition cursor-pointer"
        >
          <span>View Master Timetables</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
