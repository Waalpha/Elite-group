import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  AlertCircle,
  Megaphone,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import {
  listenToAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
} from '../../services/firebaseService';
import { Announcement, TargetAudience } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const AnnouncementsModule: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'ALL' as TargetAudience,
    priority: 'NORMAL' as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  useEffect(() => {
    const unsub = listenToAnnouncements((data) => setNotices(data));
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: 'Term 1 Mid-Term Break & Academic Progress Consultations',
      content: 'Please note that the mid-term break will commence on Friday at 12:30 PM. Facilitators will be available for individual parent progress reviews.',
      targetAudience: 'PARENTS',
      priority: 'HIGH',
      expiresAt: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Please fill notice title and content');
      return;
    }
    try {
      await addAnnouncement({
        ...formData,
        authorId: currentUser?.id || 'admin',
        authorName: currentUser?.displayName || 'Principal Office',
        publishedAt: new Date().toISOString(),
      } as any);
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(`Error publishing announcement: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this circular announcement?')) {
      try {
        await deleteAnnouncement(id);
      } catch (err: any) {
        alert(`Error deleting announcement: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            Institutional Noticeboard & Circulars
          </h1>
          <p className="text-xs text-slate-500">
            Official announcements, term schedules, academic circulars, and emergency alerts dispatched across parent and teacher channels.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Broadcast Announcement</span>
          </button>
        )}
      </div>

      {/* Notices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notices.map((n) => (
          <div
            key={n.id}
            className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between ${
              n.priority === 'URGENT'
                ? 'border-rose-300 bg-rose-50/20'
                : n.priority === 'HIGH'
                ? 'border-amber-300 bg-amber-50/20'
                : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    n.priority === 'URGENT'
                      ? 'bg-rose-100 text-rose-800'
                      : n.priority === 'HIGH'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {n.priority} Priority • {n.targetAudience}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {n.createdAt ? n.createdAt.split('T')[0] : 'Today'}
                </span>
              </div>

              <h2 className="text-sm font-bold text-slate-900 mb-2 leading-snug">{n.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-4">{n.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">Issued by: <strong>{n.authorName}</strong></span>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {notices.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-400">
            No active announcements currently posted.
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Broadcast Institutional Circular / Notice"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Heading *</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
              >
                <option value="ALL">Entire School Community (All)</option>
                <option value="PARENTS">Parents & Guardians</option>
                <option value="TEACHERS">Teachers & Faculty Only</option>
                <option value="STUDENTS">Learners Only</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent / Action Required</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Circular Content / Body *</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
              Publish Circular
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
