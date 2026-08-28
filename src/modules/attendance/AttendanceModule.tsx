import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Users,
  Calendar,
  Filter,
  QrCode,
  Sparkles,
} from 'lucide-react';
import {
  listenToStudents,
  listenToClasses,
  listenToAttendance,
  recordBulkAttendance,
} from '../../services/firebaseService';
import { Student, ClassRoom, AttendanceRecord, AttendanceStatus, GradeLevel, StreamName } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceScannerModal } from './AttendanceScannerModal';

export const AttendanceModule: React.FC = () => {
  const { currentUser, isTeacher, isAdmin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);

  // QR Scanner Modal
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Selected Filter / Class
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('GRADE_1');
  const [selectedStream, setSelectedStream] = useState<StreamName>('EAST');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Local Attendance State per studentId
  const [statusMap, setStatusMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const unsubStudents = listenToStudents((data) => setStudents(data));
    const unsubClasses = listenToClasses((data) => setClasses(data));
    const unsubAtt = listenToAttendance((data) => setAttendanceLogs(data));
    return () => {
      unsubStudents();
      unsubClasses();
      unsubAtt();
    };
  }, []);

  // Filter students for selected grade and stream
  const classStudents = students.filter((s) => s.grade === selectedGrade && s.stream === selectedStream);

  // Initialize or load existing attendance for date
  useEffect(() => {
    const existingForDate = attendanceLogs.filter(
      (a) => a.date === selectedDate && a.grade === selectedGrade && a.stream === selectedStream
    );

    const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};

    classStudents.forEach((st) => {
      const found = existingForDate.find((e) => e.studentId === st.id);
      if (found) {
        initialMap[st.id] = { status: found.status, remarks: found.remarks || '' };
      } else {
        // Default to PRESENT for easy roll call
        initialMap[st.id] = { status: 'PRESENT', remarks: '' };
      }
    });

    setStatusMap(initialMap);
    setSavedSuccess(false);
  }, [selectedDate, selectedGrade, selectedStream, classStudents.length, attendanceLogs.length]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
    setSavedSuccess(false);
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
    setSavedSuccess(false);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    classStudents.forEach((st) => {
      updated[st.id] = {
        status,
        remarks: status === 'EXCUSED' ? 'Parent notified school' : '',
      };
    });
    setStatusMap(updated);
    setSavedSuccess(false);
  };

  const handleSaveAttendance = async () => {
    if (classStudents.length === 0) return;
    setSaving(true);

    try {
      const recordsToSave: Omit<AttendanceRecord, 'id' | 'createdAt'>[] = classStudents.map((st) => ({
        studentId: st.id,
        studentName: `${st.firstName} ${st.lastName}`,
        admissionNumber: st.admissionNumber,
        grade: selectedGrade,
        stream: selectedStream,
        date: selectedDate,
        status: statusMap[st.id]?.status || 'PRESENT',
        remarks: statusMap[st.id]?.remarks || '',
        recordedBy: currentUser?.displayName || 'Facilitator',
      }));

      await recordBulkAttendance(recordsToSave);
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setSaving(false);
      alert(`Error saving attendance: ${err.message}`);
    }
  };

  // Compute stats for current register
  const statusList = Object.values(statusMap) as { status: AttendanceStatus; remarks: string }[];
  const presentCount = statusList.filter((v) => v.status === 'PRESENT' || v.status === 'Present').length;
  const lateCount = statusList.filter((v) => v.status === 'LATE' || v.status === 'Late').length;
  const absentCount = statusList.filter((v) => v.status === 'ABSENT' || v.status === 'Absent').length;
  const excusedCount = statusList.filter((v) => v.status === 'EXCUSED' || v.status === 'Excused').length;
  const attendanceRate = classStudents.length > 0 ? Math.round(((presentCount + lateCount) / classStudents.length) * 100) : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            Daily Roll Call & Attendance Register
          </h1>
          <p className="text-xs text-slate-500">
            Real-time daily attendance recording by grade, stream, and learner status with automatic parent SMS integration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="launch-qr-attendance-kiosk-btn"
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer border border-slate-700"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>QR Biometric Scanner</span>
          </button>

          <button
            id="submit-roll-call-btn"
            onClick={handleSaveAttendance}
            disabled={saving}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-400" />
                <span>{saving ? 'Saving Records...' : 'Submit Roll Call'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Bar: Class, Stream & Date Selection */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Grade Level</label>
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
              <option value="GRADE_6">Grade 6</option>
              <option value="GRADE_7">Grade 7 (JSS)</option>
              <option value="GRADE_8">Grade 8 (JSS)</option>
              <option value="GRADE_9">Grade 9 (JSS)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Stream</label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value as StreamName)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
            >
              <option value="EAST">Stream EAST</option>
              <option value="WEST">Stream WEST</option>
              <option value="NORTH">Stream NORTH</option>
              <option value="SOUTH">Stream SOUTH</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
            />
          </div>
        </div>

        {/* Quick Bulk Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Quick Mark:</span>
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 cursor-pointer"
            >
              ✓ Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold border border-rose-200 cursor-pointer"
            >
              ✕ Mark All Absent
            </button>
          </div>

          {/* Rate Badge */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600">
              Present: <strong className="text-emerald-700">{presentCount}</strong> | Late: <strong className="text-amber-700">{lateCount}</strong> | Absent: <strong className="text-rose-700">{absentCount}</strong>
            </span>
            <span className="px-2.5 py-1 bg-emerald-900 text-amber-300 font-mono font-bold rounded-lg text-xs">
              {attendanceRate}% Rate
            </span>
          </div>
        </div>
      </div>

      {/* Roster Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Adm No</th>
                <th className="py-3 px-4">Learner Name</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Remarks / Excuse Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((st) => {
                const current = statusMap[st.id] || { status: 'PRESENT', remarks: '' };

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{st.admissionNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        {st.firstName} {st.middleName || ''} {st.lastName}
                      </p>
                      <span className="text-[10px] text-slate-400">Parent: {st.parentName} ({st.parentPhone})</span>
                    </td>

                    {/* Status Pill Buttons */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as AttendanceStatus[]).map((stOption) => {
                          const isSelected = current.status === stOption;
                          return (
                            <button
                              key={stOption}
                              type="button"
                              onClick={() => handleStatusChange(st.id, stOption)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                isSelected
                                  ? stOption === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : stOption === 'LATE'
                                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                                    : stOption === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {stOption}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Remarks Input */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. Clinic visit, Flu)"
                        value={current.remarks}
                        onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                        className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                      />
                    </td>
                  </tr>
                );
              })}

              {classStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    No learners found in {(selectedGrade || '').replace('_', ' ')} (Stream {selectedStream}).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Attendance Scanner Kiosk Modal */}
      <AttendanceScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        students={students}
      />
    </div>
  );
};
