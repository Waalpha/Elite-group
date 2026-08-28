import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  Clock,
  FileText,
  Library,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  listenToStudents,
  listenToAssignments,
  listenToExamResults,
  listenToBookLoans,
} from '../../services/firebaseService';
import { Student, Assignment, ExamResult, BookLoan } from '../../types';

export const StudentPortal: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [bookLoans, setBookLoans] = useState<BookLoan[]>([]);

  // Default learner
  const student = students[0];

  useEffect(() => {
    const unsubS = listenToStudents((data) => setStudents(data));
    const unsubA = listenToAssignments((data) => setAssignments(data));
    const unsubE = listenToExamResults((data) => setExamResults(data));
    const unsubB = listenToBookLoans((data) => setBookLoans(data));

    return () => {
      unsubS();
      unsubA();
      unsubE();
      unsubB();
    };
  }, []);

  const myResults = student ? examResults.filter((r) => r.studentId === student.id) : [];
  const myLoans = student ? bookLoans.filter((l) => l.borrowerId === student.id) : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 border-2 border-amber-400 flex items-center justify-center font-serif text-2xl font-bold text-amber-300 uppercase shadow-inner">
              {student?.firstName ? student.firstName[0] : 'S'}
              {student?.lastName ? student.lastName[0] : 'E'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  Learner Portal
                </span>
                <span className="text-xs text-emerald-300 font-mono">AY 2025/2026</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-serif mt-0.5">
                {student ? `${student.firstName} ${student.lastName}` : 'Junior Learner'}
              </h1>
              <p className="text-slate-300 text-xs mt-0.5">
                Adm: {student?.admissionNumber || 'UES-2024-0101'} • {student?.grade ? student.grade.replace('_', ' ') : 'Grade 1'} East
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Tasks & My Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Homework Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Assigned Homework & Projects
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {assignments.length} Tasks
            </span>
          </div>

          <div className="space-y-3">
            {assignments.map((task) => (
              <div key={task.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-900">{task.subjectName}</span>
                  <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded-md">
                    Due: {task.dueDate}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900">{task.title}</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">{task.description}</p>
                <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Facilitator: {task.teacherName}</span>
                  <span className="font-bold text-slate-700">Max: {task.maxMarks} Marks</span>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No homework tasks pending.</p>
            )}
          </div>
        </div>

        {/* Right: CBC Assessment Results */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              My CBC Assessment Rubrics
            </h2>

            <div className="space-y-2">
              {myResults.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-slate-900">{r.subjectName}</p>
                    <p className="text-[10px] text-slate-500">{r.remarks}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-emerald-700">{r.score}%</span>
                    <span className="block text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md mt-0.5">
                      {(r.cbcPerformanceLevel || '').replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
              {myResults.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No published exam results yet.</p>
              )}
            </div>
          </div>

          {/* Library Borrowed Books */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Library className="w-4 h-4 text-teal-600" />
              My Library Books on Loan
            </h2>

            <div className="space-y-2">
              {myLoans.map((loan) => (
                <div key={loan.id} className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-teal-950">{loan.bookTitle}</p>
                    <span className="text-[10px] text-teal-700">Due Date: {loan.dueDate}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-teal-200 text-teal-900 px-2 py-0.5 rounded-full">
                    {loan.status}
                  </span>
                </div>
              ))}
              {myLoans.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No library books checked out.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
