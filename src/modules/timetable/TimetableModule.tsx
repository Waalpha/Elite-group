import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, UserCheck, Layers, Printer } from 'lucide-react';
import { GradeLevel, StreamName } from '../../types';

interface TimetableSlot {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

const SAMPLE_SLOTS: TimetableSlot[] = [
  // Monday
  { day: 'MONDAY', time: '08:00 - 08:45', subject: 'Mathematics Activities', teacher: 'Mary Atieno (TSC-482910)', room: 'Block A - 101' },
  { day: 'MONDAY', time: '08:45 - 09:30', subject: 'English Language', teacher: 'Sarah Nduta (TSC-612450)', room: 'Block A - 101' },
  { day: 'MONDAY', time: '09:30 - 10:00', subject: '★ Short Break & Health Snack', teacher: 'On Duty', room: 'Dining Hall' },
  { day: 'MONDAY', time: '10:00 - 10:45', subject: 'Integrated Science', teacher: 'John Kariuki (TSC-591024)', room: 'Science Lab 1' },
  { day: 'MONDAY', time: '10:45 - 11:30', subject: 'Kiswahili Shughuli', teacher: 'David Kimani (TSC-730192)', room: 'Block A - 101' },
  { day: 'MONDAY', time: '11:30 - 12:15', subject: 'Christian Religious Education', teacher: 'Sarah Nduta', room: 'Block A - 101' },
  { day: 'MONDAY', time: '12:15 - 01:15', subject: '★ Lunch Break & Guided Play', teacher: 'Faculty on Duty', room: 'Main Field' },
  { day: 'MONDAY', time: '01:15 - 02:00', subject: 'Creative Arts & Music', teacher: 'Grace Muthoni', room: 'Music Room' },
  { day: 'MONDAY', time: '02:00 - 02:45', subject: 'Physical Education / Games', teacher: 'Coach Ochieng', room: 'Sports Complex' },

  // Tuesday
  { day: 'TUESDAY', time: '08:00 - 08:45', subject: 'English Language', teacher: 'Sarah Nduta', room: 'Block A - 101' },
  { day: 'TUESDAY', time: '08:45 - 09:30', subject: 'Mathematics Activities', teacher: 'Mary Atieno', room: 'Block A - 101' },
  { day: 'TUESDAY', time: '09:30 - 10:00', subject: '★ Short Break', teacher: 'On Duty', room: 'Courtyard' },
  { day: 'TUESDAY', time: '10:00 - 10:45', subject: 'Pre-Technical Studies (JSS)', teacher: 'John Kariuki', room: 'Workshop A' },
  { day: 'TUESDAY', time: '10:45 - 11:30', subject: 'Agriculture & Nutrition', teacher: 'David Kimani', room: 'Kitchen Garden' },
  { day: 'TUESDAY', time: '11:30 - 12:15', subject: 'Social Studies & Citizenship', teacher: 'Mary Atieno', room: 'Block A - 101' },
  { day: 'TUESDAY', time: '12:15 - 01:15', subject: '★ Lunch Break', teacher: 'Faculty', room: 'Dining Hall' },
  { day: 'TUESDAY', time: '01:15 - 02:00', subject: 'Digital Literacy / Coding', teacher: 'Peter Omondi', room: 'Computer Lab' },
  { day: 'TUESDAY', time: '02:00 - 02:45', subject: 'Library & Reading Circles', teacher: 'Librarian Wangari', room: 'Main Library' },

  // Wednesday
  { day: 'WEDNESDAY', time: '08:00 - 08:45', subject: 'Science & Technology', teacher: 'John Kariuki', room: 'Lab 1' },
  { day: 'WEDNESDAY', time: '08:45 - 09:30', subject: 'Mathematics Activities', teacher: 'Mary Atieno', room: 'Block A - 101' },
  { day: 'WEDNESDAY', time: '09:30 - 10:00', subject: '★ Short Break', teacher: 'On Duty', room: 'Dining' },
  { day: 'WEDNESDAY', time: '10:00 - 10:45', subject: 'Kiswahili Fasihi', teacher: 'David Kimani', room: 'Block A - 101' },
  { day: 'WEDNESDAY', time: '10:45 - 11:30', subject: 'English Comprehension', teacher: 'Sarah Nduta', room: 'Block A - 101' },
  { day: 'WEDNESDAY', time: '11:30 - 12:15', subject: 'Christian Religious Education', teacher: 'Sarah Nduta', room: 'Block A - 101' },
  { day: 'WEDNESDAY', time: '12:15 - 01:15', subject: '★ Lunch Break', teacher: 'Faculty', room: 'Dining Hall' },
  { day: 'WEDNESDAY', time: '01:15 - 02:45', subject: 'Club Activities & Scouting', teacher: 'Patrons', room: 'Various' },

  // Thursday
  { day: 'THURSDAY', time: '08:00 - 08:45', subject: 'Mathematics Activities', teacher: 'Mary Atieno', room: 'Block A - 101' },
  { day: 'THURSDAY', time: '08:45 - 09:30', subject: 'English Composition', teacher: 'Sarah Nduta', room: 'Block A - 101' },
  { day: 'THURSDAY', time: '09:30 - 10:00', subject: '★ Short Break', teacher: 'On Duty', room: 'Dining' },
  { day: 'THURSDAY', time: '10:00 - 10:45', subject: 'Integrated Science', teacher: 'John Kariuki', room: 'Lab 1' },
  { day: 'THURSDAY', time: '10:45 - 11:30', subject: 'Creative Arts & Craft', teacher: 'Grace Muthoni', room: 'Art Studio' },
  { day: 'THURSDAY', time: '11:30 - 12:15', subject: 'Kiswahili Sarufi', teacher: 'David Kimani', room: 'Block A - 101' },
  { day: 'THURSDAY', time: '12:15 - 01:15', subject: '★ Lunch Break', teacher: 'Faculty', room: 'Dining Hall' },
  { day: 'THURSDAY', time: '01:15 - 02:00', subject: 'Social Studies', teacher: 'Mary Atieno', room: 'Block A - 101' },
  { day: 'THURSDAY', time: '02:00 - 02:45', subject: 'Physical Education', teacher: 'Coach Ochieng', room: 'Field' },

  // Friday
  { day: 'FRIDAY', time: '08:00 - 08:45', subject: 'Pastoral Programme (PPI)', teacher: 'Clergy / Patrons', room: 'School Chapel' },
  { day: 'FRIDAY', time: '08:45 - 09:30', subject: 'Mathematics Speed Test', teacher: 'Mary Atieno', room: 'Block A - 101' },
  { day: 'FRIDAY', time: '09:30 - 10:00', subject: '★ Short Break', teacher: 'On Duty', room: 'Dining' },
  { day: 'FRIDAY', time: '10:00 - 10:45', subject: 'English Spelling & Debates', teacher: 'Sarah Nduta', room: 'Hall B' },
  { day: 'FRIDAY', time: '10:45 - 11:30', subject: 'Science Practical & Experiments', teacher: 'John Kariuki', room: 'Lab 1' },
  { day: 'FRIDAY', time: '11:30 - 12:15', subject: 'Kiswahili Insha', teacher: 'David Kimani', room: 'Block A - 101' },
  { day: 'FRIDAY', time: '12:15 - 01:15', subject: '★ Lunch Break', teacher: 'Faculty', room: 'Dining Hall' },
  { day: 'FRIDAY', time: '01:15 - 03:00', subject: 'School Assembly & Weekend Dismissal', teacher: 'Principal & Staff', room: 'Main Quadrangle' },
];

export const TimetableModule: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('GRADE_1');
  const [selectedStream, setSelectedStream] = useState<StreamName>('EAST');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');

  const days: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY')[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Class & Master Timetables
          </h1>
          <p className="text-xs text-slate-500">
            Weekly 40-period instructional schedule, lab rotations, and teacher allocations without conflicts.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print Schedule</span>
        </button>
      </div>

      {/* Selectors */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Class Level</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
            >
              <option value="GRADE_1">Grade 1 East</option>
              <option value="GRADE_2">Grade 2 East</option>
              <option value="GRADE_3">Grade 3 East</option>
              <option value="GRADE_4">Grade 4 East</option>
              <option value="GRADE_5">Grade 5 East</option>
              <option value="GRADE_6">Grade 6 East</option>
              <option value="GRADE_7">Grade 7 East (JSS)</option>
              <option value="GRADE_8">Grade 8 East (JSS)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Day Filter</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
            >
              <option value="ALL">Full Week (Mon - Fri)</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium block">AY 2025/2026 • Term 1</span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            8:00 AM – 3:30 PM Daily
          </span>
        </div>
      </div>

      {/* Timetable Weekly Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {days
          .filter((d) => selectedDay === 'ALL' || selectedDay === d)
          .map((day) => {
            const daySlots = SAMPLE_SLOTS.filter((s) => s.day === day);

            return (
              <div key={day} className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-950 text-white text-center shadow-xs">
                  <p className="font-black text-xs font-serif uppercase tracking-wider text-amber-300">{day}</p>
                  <p className="text-[10px] text-emerald-300 mt-0.5">8 Periods</p>
                </div>

                <div className="space-y-2">
                  {daySlots.map((slot, idx) => {
                    const isBreak = slot.subject.includes('★');

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition ${
                          isBreak
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900 font-semibold'
                            : 'bg-white border-slate-200 shadow-xs hover:border-emerald-500'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {slot.time}
                          </span>
                          {!isBreak && <span className="text-slate-500">{slot.room}</span>}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{slot.subject}</h4>

                        {!isBreak && (
                          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <UserCheck className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{slot.teacher}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
