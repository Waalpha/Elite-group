import React from 'react';
import { ReportCard, Student, ExamResult, SchoolSettings } from '../../types';
import { Award, Printer, X } from 'lucide-react';
import { printA4Element } from '../../utils/printA4';

interface ReportCardPrintProps {
  reportCard?: ReportCard;
  student?: Student;
  examResults?: ExamResult[];
  academicYear?: string;
  term?: string;
  settings?: SchoolSettings;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ReportCardPrint: React.FC<ReportCardPrintProps> = ({
  reportCard: propReportCard,
  student,
  examResults = [],
  academicYear = '2025/2026',
  term = 'TERM_1',
  settings,
  isOpen = true,
  onClose,
}) => {
  if (isOpen === false) return null;

  // Synthesize report card if passed as student + examResults
  const reportCard: ReportCard = propReportCard || {
    id: `rc-${student?.id || 'default'}`,
    studentId: student?.id || '',
    studentName: student ? `${student.firstName} ${student.middleName ? `${student.middleName} ` : ''}${student.lastName}` : 'Junior Learner',
    admissionNumber: student?.admissionNumber || 'UES-2024-001',
    gradeLevel: (student?.grade || student?.gradeLevel || 'GRADE_1') as any,
    stream: student?.stream || 'East',
    academicYear: academicYear || '2025/2026',
    term: (term === 'TERM_1' ? 'Term 1' : term === 'TERM_2' ? 'Term 2' : 'Term 3') as any,
    attendanceSummary: {
      daysPresent: 62,
      daysAbsent: 1,
      totalDays: 63,
      percentage: 98.4,
    },
    subjectResults: examResults.length > 0
      ? examResults.map((r) => ({
          subjectName: r.subjectName,
          score: r.score,
          maxScore: r.maxScore || 100,
          percentage: r.percentage || Math.round((r.score / (r.maxScore || 100)) * 100),
          grade: r.traditionalGrade || 'A',
          performanceLevel: (r.cbcPerformanceLevel || 'Exceeding Expectations (4)').replace('_', ' '),
          teacherRemark: r.remarks || 'Commendable competency mastery.',
        }))
      : [
          {
            subjectName: 'Mathematics & Numeracy',
            score: 88,
            maxScore: 100,
            percentage: 88,
            grade: 'A',
            performanceLevel: 'Exceeding Expectations (4)',
            teacherRemark: 'Superb analytical & computational skills.',
          },
          {
            subjectName: 'English Language & Literacy',
            score: 82,
            maxScore: 100,
            percentage: 82,
            grade: 'A-',
            performanceLevel: 'Meeting Expectations (3)',
            teacherRemark: 'Strong reading comprehension and creative expression.',
          },
          {
            subjectName: 'Kiswahili & Insha',
            score: 79,
            maxScore: 100,
            percentage: 79,
            grade: 'B+',
            performanceLevel: 'Meeting Expectations (3)',
            teacherRemark: 'Umahiri mzuri katika mawasiliano na sarufi.',
          },
          {
            subjectName: 'Science & Technology',
            score: 91,
            maxScore: 100,
            percentage: 91,
            grade: 'A',
            performanceLevel: 'Exceeding Expectations (4)',
            teacherRemark: 'Exemplary project innovation and scientific inquiry.',
          },
          {
            subjectName: 'Social Studies & Citizenship',
            score: 84,
            maxScore: 100,
            percentage: 84,
            grade: 'A',
            performanceLevel: 'Exceeding Expectations (4)',
            teacherRemark: 'Strong civic awareness and cultural appreciation.',
          },
          {
            subjectName: 'Creative Arts & Music',
            score: 89,
            maxScore: 100,
            percentage: 89,
            grade: 'A',
            performanceLevel: 'Exceeding Expectations (4)',
            teacherRemark: 'Talented visual artistic skills and rhythm.',
          },
        ],
    totalMarks: examResults.reduce((acc, curr) => acc + curr.score, 0) || 513,
    maxPossibleMarks: (examResults.length || 6) * 100,
    averagePercentage: examResults.length > 0
      ? Math.round(examResults.reduce((acc, curr) => acc + curr.score, 0) / examResults.length)
      : 86,
    classPosition: 2,
    totalStudentsInStream: 42,
    issuedDate: new Date().toISOString().split('T')[0],
    classTeacherRemarks:
      'A highly disciplined, inquisitive, and self-driven learner who consistently exhibits exemplary leadership and academic rigor.',
    headTeacherRemarks:
      'Outstanding performance across all CBC learning areas. Commended for exemplary character, innovation, and school spirit.',
    openingDateNextTerm: '2025-09-08',
    competencies: [
      { title: 'Critical Thinking & Problem Solving', level: 'Exceeding Expectations' },
      { title: 'Communication & Collaboration', level: 'Meeting Expectations' },
      { title: 'Digital Literacy & Innovation', level: 'Exceeding Expectations' },
      { title: 'Self-Efficacy & Imagination', level: 'Meeting Expectations' },
    ],
    values: [
      { title: 'Integrity & Honesty', rating: 'Exemplary' },
      { title: 'Respect & Social Cohesion', rating: 'Very Good' },
      { title: 'Responsibility & Hard Work', rating: 'Exemplary' },
      { title: 'Peace & Patriotism', rating: 'Very Good' },
    ],
  };

  const handlePrint = () => {
    printA4Element('printable-report-card', {
      title: `CBC_Report_Card_${reportCard.admissionNumber}_${reportCard.studentName}`,
      orientation: 'portrait',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Action Bar (hidden in print) */}
        <div className="no-print flex items-center justify-between bg-slate-900 text-white px-5 py-3.5 sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Official CBC Progress Report Card (A4 Preview)</span>
          </div>
          <div className="flex items-center gap-2.5">
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Report Card</span>
            </button>
          </div>
        </div>

        {/* Printable Sheet (Standard A4 Scrollable Area) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
          <div
            id="printable-report-card"
            className="max-w-[800px] mx-auto p-6 sm:p-8 border border-slate-300 shadow-md bg-white rounded-xl text-slate-900 text-xs font-sans space-y-4"
          >
            {/* School Header */}
            <div className="text-center border-b-2 border-emerald-950 pb-3">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 flex items-center justify-center text-amber-400 font-serif font-black text-xl border-2 border-amber-400">
                  UES
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-emerald-950 uppercase">
                    {settings?.schoolName || 'UWEZO ELITE SCHOOL'}
                  </h1>
                  <p className="text-xs italic text-amber-800 font-medium tracking-wide">
                    "{settings?.motto || 'Excellence in Character, Innovation and Leadership'}"
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-600">
                {settings?.physicalLocation || 'Uwezo Academic Boulevard, Off Eastern Bypass, Ruiru/Membley, Kenya'}
                {' • '} Tel: {settings?.phone || '+254 722 000 111'}
                {' • '} Email: {settings?.email || 'info@uwezoeliteschool.ac.ke'}
              </p>
              <div className="mt-2 inline-block bg-emerald-900 text-white px-4 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                CBC / CBE Summative Learner Progress Assessment Report
              </div>
            </div>

            {/* Student Particulars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 bg-slate-50/70 p-3 rounded-lg">
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Learner's Name:</span>
                <span className="font-bold text-slate-900">{reportCard.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Admission Number:</span>
                <span className="font-bold text-slate-900 font-mono">{reportCard.admissionNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Class & Stream:</span>
                <span className="font-bold text-slate-900">{String(reportCard.gradeLevel).replace('_', ' ')} - {reportCard.stream}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Academic Period:</span>
                <span className="font-bold text-slate-900">{reportCard.term} • {reportCard.academicYear}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Attendance Record:</span>
                <span className="font-bold text-slate-900">
                  {reportCard.attendanceSummary?.daysPresent ?? 62} / {reportCard.attendanceSummary?.totalDays ?? 63} Days ({reportCard.attendanceSummary?.percentage ?? 98.4}%)
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Mean Score:</span>
                <span className="font-bold text-emerald-800 text-sm">{reportCard.averagePercentage}%</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Stream Position:</span>
                <span className="font-bold text-slate-900">{reportCard.classPosition ? `${reportCard.classPosition} of ${reportCard.totalStudentsInStream || '-'}` : 'Assessed'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Report Date:</span>
                <span className="font-bold text-slate-900">{reportCard.issuedDate}</span>
              </div>
            </div>

            {/* Academic Performance Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1">
                Learning Areas & Subject Competencies Performance
              </h4>
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-emerald-950 text-white font-semibold text-[11px]">
                    <th className="border border-emerald-900 px-2.5 py-1.5">Learning Area / Subject</th>
                    <th className="border border-emerald-900 px-2 py-1.5 text-center w-16">Score</th>
                    <th className="border border-emerald-900 px-2 py-1.5 text-center w-14">%</th>
                    <th className="border border-emerald-900 px-2 py-1.5 text-center w-14">Grade</th>
                    <th className="border border-emerald-900 px-2.5 py-1.5 text-center w-44">CBC Performance Level</th>
                    <th className="border border-emerald-900 px-2.5 py-1.5">Subject Facilitator's Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportCard.subjectResults.map((sub, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="border border-slate-300 px-2.5 py-1.5 font-semibold text-slate-800">
                        {sub.subjectName}
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-medium">
                        {sub.score}/{sub.maxScore}
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-center font-bold">
                        {sub.percentage}%
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-emerald-800">
                        {sub.grade}
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-center text-[10px] font-semibold text-slate-700">
                        {sub.performanceLevel}
                      </td>
                      <td className="border border-slate-300 px-2.5 py-1.5 text-[10.5px] text-slate-600 italic">
                        {sub.teacherRemark}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-xs">
                    <td className="border border-slate-300 px-2.5 py-2 text-right uppercase">
                      Aggregates & Summary:
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center font-mono font-bold">
                      {reportCard.totalMarks}/{reportCard.maxPossibleMarks}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 text-center text-emerald-800 font-black">
                      {reportCard.averagePercentage}%
                    </td>
                    <td colSpan={3} className="border border-slate-300 px-2.5 py-2 text-xs text-slate-700">
                      Overall Level: <span className="text-emerald-950 font-black">Exceeding Expectations (EE - Level 4)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CBC Key Competencies & Core Values Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Competencies */}
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
                <h5 className="font-bold text-[10.5px] uppercase text-emerald-950 mb-1.5 border-b pb-1">
                  CBC Core Competencies Demonstrated
                </h5>
                <div className="space-y-1">
                  {reportCard.competencies?.map((comp, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-700">{comp.title}</span>
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {comp.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Values */}
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
                <h5 className="font-bold text-[10.5px] uppercase text-emerald-950 mb-1.5 border-b pb-1">
                  National Core Values & Conduct
                </h5>
                <div className="space-y-1">
                  {reportCard.values?.map((val, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-700">{val.title}</span>
                      <span className="font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {val.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Remarks and Signatures */}
            <div className="border border-slate-300 rounded-lg p-3 space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-800 uppercase text-[10px]">Class Facilitator's Remarks:</span>
                <p className="italic text-slate-700 text-[11px] pl-2 border-l-2 border-emerald-600 mt-0.5">
                  {reportCard.classTeacherRemarks}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-800 uppercase text-[10px]">Head Teacher / Principal's Remarks:</span>
                <p className="italic text-slate-700 text-[11px] pl-2 border-l-2 border-amber-600 mt-0.5">
                  {reportCard.headTeacherRemarks}
                </p>
              </div>
            </div>

            {/* Footer, Next Term Date & Seals */}
            <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">Next Term Resumption Date:</p>
                <p className="text-emerald-800 font-semibold text-sm">{reportCard.openingDateNextTerm}</p>
              </div>

              <div className="flex items-center gap-6 text-center">
                <div>
                  <div className="w-24 border-b border-slate-700 mb-1 h-6 flex items-end justify-center">
                    <span className="font-serif italic text-xs text-slate-700">Dr. Mwangi</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">Principal Signature</span>
                </div>

                <div>
                  <div className="w-20 h-10 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center text-[9px] font-bold text-emerald-900 uppercase">
                    Official Stamp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
