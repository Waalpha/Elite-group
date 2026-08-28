import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  UserCheck,
  Building,
  Plus,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  CalendarCheck,
  ArrowUpRight,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import {
  listenToClasses,
  listenToStudents,
  listenToTeachers,
  addClassRoom,
  updateClassRoom,
} from '../../services/firebaseService';
import { ClassRoom, Student, Teacher, GradeLevel, StreamName } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const ClassesModule: React.FC = () => {
  const { isAdmin, isTeacher } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Grade 1 East',
    grade: 'GRADE_1' as GradeLevel,
    stream: 'EAST' as StreamName,
    capacity: 35,
    academicYear: '2025/2026',
    classTeacherId: '',
    classTeacherName: '',
    roomNumber: 'Block A - Room 101',
  });

  useEffect(() => {
    const unsubClasses = listenToClasses((data) => setClasses(data));
    const unsubStudents = listenToStudents((data) => setStudents(data));
    const unsubTeachers = listenToTeachers((data) => setTeachers(data));
    return () => {
      unsubClasses();
      unsubStudents();
      unsubTeachers();
    };
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: 'Grade 7 East (JSS)',
      grade: 'GRADE_7',
      stream: 'EAST',
      capacity: 35,
      academicYear: '2025/2026',
      classTeacherId: teachers[0]?.id || '',
      classTeacherName: teachers[0] ? `${teachers[0].firstName} ${teachers[0].lastName}` : 'Unassigned',
      roomNumber: 'JSS Wing - Lab 1',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedTeacher = teachers.find((t) => t.id === formData.classTeacherId);
      await addClassRoom({
        ...formData,
        classTeacherName: selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : formData.classTeacherName,
        currentEnrollment: 0,
        subjects: ['Mathematics', 'English Language', 'Kiswahili', 'Integrated Science', 'CRE'],
      } as any);
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(`Error saving class: ${err.message}`);
    }
  };

  const getClassLearners = (c: ClassRoom) => {
    return students.filter((s) => s.grade === c.grade && s.stream === c.stream);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-600" />
            Classes, Streams & Room Allocations
          </h1>
          <p className="text-xs text-slate-500">
            Structure of Early Years, Primary, and Junior Secondary School (JSS) classes, homeroom facilitators, and learner capacities.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Class / Stream</span>
          </button>
        )}
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const classStudents = getClassLearners(cls);
          const occupancyRate = Math.round((classStudents.length / cls.capacity) * 100);

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 uppercase">
                    {(cls.grade || cls.level || '').replace('_', ' ')} • Stream {cls.stream || 'East'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{cls.roomNumber}</span>
                </div>

                <h2 className="text-base font-extrabold font-serif text-slate-900 mb-1">{cls.name}</h2>

                <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-4">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Facilitator: <strong>{cls.classTeacherName || 'Not Assigned'}</strong></span>
                </p>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Enrolled Learners</span>
                    <span className="font-bold text-slate-800">
                      {classStudents.length} / {cls.capacity} ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        occupancyRate >= 90 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, occupancyRate)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">AY {cls.academicYear}</span>
                <button
                  onClick={() => {
                    setSelectedClass(cls);
                    setIsRosterModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Roster ({classStudents.length})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Learner Roster Modal */}
      {selectedClass && (
        <Modal
          isOpen={isRosterModalOpen}
          onClose={() => setIsRosterModalOpen(false)}
          title={`Class Roster: ${selectedClass.name} (${selectedClass.roomNumber})`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div>
                <p className="text-emerald-950 font-bold">Class Teacher: {selectedClass.classTeacherName}</p>
                <p className="text-emerald-800 text-[11px]">
                  Total Enrolled: {getClassLearners(selectedClass).length} learners
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-200/70 px-2.5 py-1 rounded-lg">
                {selectedClass.academicYear}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                    <th className="py-2">No</th>
                    <th className="py-2">Adm Number</th>
                    <th className="py-2">Learner Name</th>
                    <th className="py-2">Gender</th>
                    <th className="py-2">Guardian Contact</th>
                    <th className="py-2">Fee Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getClassLearners(selectedClass).map((st, idx) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-2 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 font-mono font-bold text-slate-800">{st.admissionNumber}</td>
                      <td className="py-2 font-semibold text-slate-900">
                        {st.firstName} {st.middleName || ''} {st.lastName}
                      </td>
                      <td className="py-2 text-slate-600">{st.gender}</td>
                      <td className="py-2 text-slate-600 font-mono text-[11px]">{st.parentPhone}</td>
                      <td className="py-2">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            (st.feeBalance || 0) === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {(st.feeBalance || 0) === 0 ? 'CLEARED' : `KES ${(st.feeBalance || 0).toLocaleString()}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {getClassLearners(selectedClass).length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400">
                        No learners currently assigned to this stream.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Class Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Class / Stream Allocation"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Class Display Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Grade 7 East (JSS)"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grade Level</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
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
              <label className="block font-semibold text-slate-700 mb-1">Stream</label>
              <select
                value={formData.stream}
                onChange={(e) => setFormData({ ...formData, stream: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              >
                <option value="EAST">Stream EAST</option>
                <option value="WEST">Stream WEST</option>
                <option value="NORTH">Stream NORTH</option>
                <option value="SOUTH">Stream SOUTH</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room / Block</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="Block A - Rm 102"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Learner Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Class Teacher (Facilitator)</label>
            <select
              value={formData.classTeacherId}
              onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
            >
              <option value="">-- Assign Teacher --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName} ({t.tscNumber || 'Direct'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Save Class
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
