import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  UserCheck,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { listenToAssignments, addAssignment } from '../../services/firebaseService';
import { Assignment, GradeLevel } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const AssignmentsModule: React.FC = () => {
  const { currentUser, isTeacher, isAdmin } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subjectName: 'Mathematics Activities',
    grade: 'GRADE_1' as GradeLevel,
    description: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    maxMarks: 50,
  });

  useEffect(() => {
    const unsub = listenToAssignments((data) => setAssignments(data));
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: 'Fractions & Practical Number Operations',
      subjectName: 'Mathematics Activities',
      grade: 'GRADE_1',
      description: 'Complete questions 1 through 10 on page 44 of the KICD Mathematics learner workbook. Show all working steps clearly.',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      maxMarks: 20,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('Please fill assignment details');
      return;
    }
    try {
      await addAssignment({
        ...formData,
        teacherId: currentUser?.id || 't1',
        teacherName: currentUser?.displayName || 'Teacher Facilitator',
        status: 'PUBLISHED',
      } as any);
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(`Error creating assignment: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Homework, Projects & Learning Tasks
          </h1>
          <p className="text-xs text-slate-500">
            Facilitate competency development through hands-on home tasks, digital activities, and project-based assessments.
          </p>
        </div>

        {(isAdmin || isTeacher) && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Assignment</span>
          </button>
        )}
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                  {(item.grade || (item as any).gradeLevel || '').replace('_', ' ')}
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> Due: {item.dueDate}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-xs font-semibold text-emerald-700 mb-2">{item.subjectName}</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Max Score: {item.maxMarks} Marks</span>
              <span className="text-slate-700 font-bold">{item.teacherName}</span>
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">
            No assignments currently posted.
          </div>
        )}
      </div>

      {/* Add Assignment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Post New Homework / Project Task"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Learning Area / Subject</label>
              <input
                type="text"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grade Level</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              >
                <option value="GRADE_1">Grade 1</option>
                <option value="GRADE_2">Grade 2</option>
                <option value="GRADE_3">Grade 3</option>
                <option value="GRADE_4">Grade 4</option>
                <option value="GRADE_5">Grade 5</option>
                <option value="GRADE_6">Grade 6</option>
                <option value="GRADE_7">Grade 7 (JSS)</option>
                <option value="GRADE_8">Grade 8 (JSS)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Marks</label>
              <input
                type="number"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Instructions & Guidelines *</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
            />
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
              Publish to Learners
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
