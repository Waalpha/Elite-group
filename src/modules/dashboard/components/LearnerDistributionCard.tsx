import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  Filter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Student, GradeLevel } from '../../../types';

interface LearnerDistributionCardProps {
  students: Student[];
  onNavigate: (tab: string) => void;
}

export const LearnerDistributionCard: React.FC<LearnerDistributionCardProps> = ({
  students,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'male' | 'female' | 'active'>('all');

  const gradeOrder: GradeLevel[] = [
    'Playgroup',
    'PP1',
    'PP2',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
  ];

  // Filter students based on active tab
  const filteredStudents = students.filter((s) => {
    if (filter === 'male') return s.gender === 'Male' || (s.gender as string) === 'MALE';
    if (filter === 'female') return s.gender === 'Female' || (s.gender as string) === 'FEMALE';
    if (filter === 'active') return s.status === 'Active' || (s.status as string) === 'ACTIVE' || !s.status;
    return true;
  });

  // Calculate count per grade
  const gradeCounts: Record<string, number> = {};
  gradeOrder.forEach((g) => {
    gradeCounts[g] = 0;
  });

  filteredStudents.forEach((s) => {
    const rawClass = s.currentClass || s.grade || 'Grade 1';
    // Normalize class names
    let matched = gradeOrder.find(
      (g) => g.toLowerCase() === rawClass.toLowerCase() || g.toLowerCase() === `grade ${rawClass}`.toLowerCase()
    );
    if (!matched) {
      if (rawClass.includes('1')) matched = 'Grade 1';
      else if (rawClass.includes('2')) matched = 'Grade 2';
      else if (rawClass.includes('3')) matched = 'Grade 3';
      else if (rawClass.includes('4')) matched = 'Grade 4';
      else if (rawClass.includes('5')) matched = 'Grade 5';
      else if (rawClass.includes('6')) matched = 'Grade 6';
      else if (rawClass.includes('7')) matched = 'Grade 7';
      else if (rawClass.includes('8')) matched = 'Grade 8';
      else if (rawClass.includes('9')) matched = 'Grade 9';
      else if (rawClass.toLowerCase().includes('pp1')) matched = 'PP1';
      else if (rawClass.toLowerCase().includes('pp2')) matched = 'PP2';
      else if (rawClass.toLowerCase().includes('play')) matched = 'Playgroup';
      else matched = 'Grade 1';
    }
    gradeCounts[matched] = (gradeCounts[matched] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(gradeCounts), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header & Filter Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-sans">
                CBC Learner Distribution
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Enrollment across Playgroup to Junior Secondary (Grade 9)
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({students.length})
            </button>
            <button
              onClick={() => setFilter('male')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'male'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Boys
            </button>
            <button
              onClick={() => setFilter('female')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'female'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Girls
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'active'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active
            </button>
          </div>
        </div>

        {/* 12 Grade Bars Visualizer */}
        <div className="mt-5 space-y-2.5">
          {gradeOrder.map((grade) => {
            const count = gradeCounts[grade] || 0;
            const pct = Math.round((count / maxCount) * 100);
            const isJuniorSecondary = ['Grade 7', 'Grade 8', 'Grade 9'].includes(grade);
            const isEarlyYears = ['Playgroup', 'PP1', 'PP2'].includes(grade);

            return (
              <div
                key={grade}
                onClick={() => onNavigate('students')}
                className="group flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="w-24 sm:w-28 shrink-0 flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-700 transition">
                    {grade}
                  </span>
                  {isJuniorSecondary && (
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                      JSS
                    </span>
                  )}
                  {isEarlyYears && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                      EY
                    </span>
                  )}
                </div>

                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isJuniorSecondary
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                        : isEarlyYears
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    }`}
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>

                <div className="w-12 text-right shrink-0">
                  <span className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700">
                    {count}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium ml-0.5">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          Total Enrolled: <strong>{filteredStudents.length} learners</strong>
        </span>
        <button
          onClick={() => onNavigate('students')}
          className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 transition cursor-pointer"
        >
          <span>Open Learners Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
