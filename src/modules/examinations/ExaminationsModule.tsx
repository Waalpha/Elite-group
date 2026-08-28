import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Filter,
  Save,
  CheckCircle2,
  Printer,
  Sparkles,
  FileCheck,
  TrendingUp,
  BookOpen,
  Eye,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ReportCardPrint } from '../../components/print/ReportCardPrint';
import {
  listenToStudents,
  listenToExamResults,
  saveBulkExamResults,
} from '../../services/firebaseService';
import {
  Student,
  ExamResult,
  GradeLevel,
  CBCPerformanceLevel,
  ExamType,
} from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const SUBJECT_LIST = [
  'Mathematics Activities',
  'English Language Activities',
  'Kiswahili na Shughuli za Lugha',
  'Integrated Science',
  'Christian Religious Education (CRE)',
  'Creative Arts & Sports',
  'Social Studies',
  'Agriculture & Nutrition',
];

export const ExaminationsModule: React.FC = () => {
  const { currentUser, isTeacher, isAdmin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);

  // Selection
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('GRADE_1');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics Activities');
  const [selectedTerm, setSelectedTerm] = useState<'TERM_1' | 'TERM_2' | 'TERM_3'>('TERM_1');
  const [selectedExamType, setSelectedExamType] = useState<ExamType>('END_OF_TERM');
  const [academicYear, setAcademicYear] = useState('2025/2026');

  // Local Marks Map: studentId -> { score: number, remarks: string }
  const [marksMap, setMarksMap] = useState<Record<string, { score: number; remarks: string }>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Report card print state
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const unsubStudents = listenToStudents((data) => setStudents(data));
    const unsubResults = listenToExamResults((data) => setResults(data));
    return () => {
      unsubStudents();
      unsubResults();
    };
  }, []);

  const classStudents = students.filter((s) => s.grade === selectedGrade);

  // Helper to compute CBC level
  const computeCBCLevel = (score: number): { level: CBCPerformanceLevel; rubric: string; traditionalGrade: string } => {
    if (score >= 80) return { level: 'EXCEEDING_EXPECTATIONS', rubric: 'EE (Exceeding Expectations)', traditionalGrade: 'A' };
    if (score >= 65) return { level: 'MEETING_EXPECTATIONS', rubric: 'ME (Meeting Expectations)', traditionalGrade: 'B' };
    if (score >= 50) return { level: 'APPROACHING_EXPECTATIONS', rubric: 'AE (Approaching Expectations)', traditionalGrade: 'C' };
    return { level: 'BELOW_EXPECTATIONS', rubric: 'BE (Below Expectations)', traditionalGrade: 'D' };
  };

  // Sync marks map
  useEffect(() => {
    const existing = results.filter(
      (r) =>
        r.grade === selectedGrade &&
        r.subjectName === selectedSubject &&
        r.term === selectedTerm &&
        r.examType === selectedExamType
    );

    const initialMap: Record<string, { score: number; remarks: string }> = {};
    classStudents.forEach((st) => {
      const found = existing.find((e) => e.studentId === st.id);
      if (found) {
        initialMap[st.id] = { score: found.score, remarks: found.remarks || '' };
      } else {
        initialMap[st.id] = { score: 75, remarks: 'Good grasp of core competencies' };
      }
    });

    setMarksMap(initialMap);
  }, [selectedGrade, selectedSubject, selectedTerm, selectedExamType, classStudents.length, results.length]);

  const handleScoreChange = (studentId: string, val: number) => {
    const cleanVal = Math.min(100, Math.max(0, val));
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], score: cleanVal },
    }));
    setSavedSuccess(false);
  };

  const handleRemarksChange = (studentId: string, val: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks: val },
    }));
    setSavedSuccess(false);
  };

  const handleSaveMarks = async () => {
    if (classStudents.length === 0) return;
    setSaving(true);

    try {
      const itemsToSave: Omit<ExamResult, 'id' | 'createdAt'>[] = classStudents.map((st) => {
        const entry = marksMap[st.id] || { score: 70, remarks: '' };
        const { level, rubric, traditionalGrade } = computeCBCLevel(entry.score);
        return {
          studentId: st.id,
          studentName: `${st.firstName} ${st.lastName}`,
          admissionNumber: st.admissionNumber,
          grade: selectedGrade,
          term: selectedTerm,
          academicYear,
          examType: selectedExamType,
          subjectName: selectedSubject,
          score: entry.score,
          maxScore: 100,
          percentage: entry.score,
          cbcPerformanceLevel: level,
          traditionalGrade,
          strandsMastered: ['Key Concepts', 'Application & Critical Thinking'],
          remarks: entry.remarks || 'Satisfactory competency mastery.',
          assessedBy: currentUser?.displayName || 'Teacher',
        };
      });

      await saveBulkExamResults(itemsToSave);
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setSaving(false);
      alert(`Error saving marks: ${err.message}`);
    }
  };

  const getStudentResults = (studentId: string) => {
    return results.filter((r) => r.studentId === studentId && r.term === selectedTerm);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-600" />
            CBC Assessment Marks & Report Cards
          </h1>
          <p className="text-xs text-slate-500">
            Competency grading rubrics (EE, ME, AE, BE), continuous assessment, and official Ministry-compliant report cards.
          </p>
        </div>

        <button
          onClick={handleSaveMarks}
          disabled={saving}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
            savedSuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Grades Published!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saving ? 'Saving...' : 'Save & Publish Marks'}</span>
            </>
          )}
        </button>
      </div>

      {/* Selector Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Grade Level</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value as GradeLevel)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
            >
              <option value="PLAYGROUP">Playgroup</option>
              <option value="PP1">PP1</option>
              <option value="PP2">PP2</option>
              <option value="GRADE_1">Grade 1</option>
              <option value="GRADE_2">Grade 2</option>
              <option value="GRADE_3">Grade 3</option>
              <option value="GRADE_4">Grade 4</option>
              <option value="GRADE_5">Grade 5</option>
              <option value="GRADE_6">Grade 6 (KPSEA Prep)</option>
              <option value="GRADE_7">Grade 7 (JSS)</option>
              <option value="GRADE_8">Grade 8 (JSS)</option>
              <option value="GRADE_9">Grade 9 (KJSEA Prep)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Learning Area / Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
            >
              {SUBJECT_LIST.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Academic Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
            >
              <option value="TERM_1">Term 1 (Jan - April)</option>
              <option value="TERM_2">Term 2 (May - Aug)</option>
              <option value="TERM_3">Term 3 (Sept - Nov)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value as ExamType)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
            >
              <option value="END_OF_TERM">End of Term Examination</option>
              <option value="MID_TERM">Mid-Term Assessment</option>
              <option value="CAT_1">Continuous Assessment (CAT 1)</option>
              <option value="CAT_2">Continuous Assessment (CAT 2)</option>
              <option value="NATIONAL_MOCK">National Assessment (KPSEA/KJSEA)</option>
            </select>
          </div>
        </div>

        {/* CBC Rubric Reference Banner */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="font-bold text-slate-600">CBC Performance Rubric:</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold">
              EE: 80-100% (Exceeding)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold">
              ME: 65-79% (Meeting)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
              AE: 50-64% (Approaching)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-bold">
              BE: &lt;50% (Below)
            </span>
          </div>
        </div>
      </div>

      {/* Gradebook Entry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Adm No</th>
                <th className="py-3 px-4">Learner Name</th>
                <th className="py-3 px-4 w-32">Score (0-100)</th>
                <th className="py-3 px-4">CBC Level / Rubric</th>
                <th className="py-3 px-4">Facilitator Remarks</th>
                <th className="py-3 px-4 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((st) => {
                const entry = marksMap[st.id] || { score: 75, remarks: '' };
                const { level, rubric, traditionalGrade } = computeCBCLevel(entry.score);

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{st.admissionNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        {st.firstName} {st.middleName || ''} {st.lastName}
                      </p>
                      <span className="text-[10px] text-slate-400">Stream {st.stream}</span>
                    </td>

                    {/* Score Input */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={entry.score}
                        onChange={(e) => handleScoreChange(st.id, Number(e.target.value))}
                        className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 font-mono text-center focus:bg-white"
                      />
                    </td>

                    {/* CBC Level Pill */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                          level === 'EXCEEDING_EXPECTATIONS'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : level === 'MEETING_EXPECTATIONS'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : level === 'APPROACHING_EXPECTATIONS'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {rubric}
                      </span>
                    </td>

                    {/* Remarks Input */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={entry.remarks}
                        onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                        placeholder="Learner competence notes..."
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white"
                      />
                    </td>

                    {/* Print Report Card */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudentForReport(st);
                          setIsReportModalOpen(true);
                        }}
                        title="Quick View & Print Official A4 CBC Assessment Report Card"
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto border border-emerald-200/80 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Quick View (A4)</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {classStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No learners found in {(selectedGrade || '').replace('_', ' ')}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable CBC Report Card Modal */}
      {selectedStudentForReport && (
        <ReportCardPrint
          student={selectedStudentForReport}
          examResults={getStudentResults(selectedStudentForReport.id)}
          academicYear={academicYear}
          term={selectedTerm}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
};
