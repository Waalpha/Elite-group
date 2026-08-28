import React, { useState, useRef } from 'react';
import {
  Settings,
  Building,
  ShieldCheck,
  RefreshCw,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
  Eye,
  FileText,
  CreditCard,
  School,
  FileCheck,
  Key,
} from 'lucide-react';
import { checkAndSeedInitialData } from '../../services/seedService';
import { useSchoolSettings } from '../../contexts/SettingsContext';
import { RolesPermissionsModal } from '../staff/RolesPermissionsModal';

const PRESET_LOGOS = [
  {
    name: 'Heraldic Eagle & Torch',
    url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Academic Shield & Book',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Modern Emerald Crest',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80',
  },
];

export const SettingsModule: React.FC = () => {
  const { settings, updateSettings } = useSchoolSettings();
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    schoolName: settings.schoolName || 'UWEZO ELITE SCHOOL',
    motto: settings.motto || 'Excellence in Character, Innovation and Leadership',
    schoolType: settings.schoolType || 'Co-Educational Day & Boarding CBC & JSS Academy',
    curriculum: settings.curriculum || 'Competency Based Curriculum (CBC) & Junior Secondary School (JSS)',
    moeRegNumber: settings.moeRegNumber || 'MOE/PRI/2024/098',
    knecCode: settings.knecCode || '204581',
    address: settings.address || settings.physicalLocation || 'Ruiru / Membley, Nairobi Metro, Kenya',
    postalAddress: settings.postalAddress || 'P.O. Box 45892-00100 Nairobi, Kenya',
    physicalLocation: settings.physicalLocation || 'Ruiru / Membley, Nairobi Metro, Kenya',
    phone: settings.phone || '+254 700 000 000 / +254 722 123 456',
    email: settings.email || 'info@uwezoelite.ac.ke',
    website: settings.website || 'https://uwezoelite.ac.ke',
    mpesaPaybillNumber: settings.mpesaPaybillNumber || '247247',
    bankAccountDetails: settings.bankAccountDetails || 'Equity Bank - Acc: 1450289104821',
    currentAcademicYear: settings.currentAcademicYear || '2025/2026',
    currentTerm: settings.currentTerm || 'TERM_1',
    termStartDate: settings.termStartDate || '2025-01-08',
    termEndDate: settings.termEndDate || '2025-04-04',
    nextTermStartDate: settings.nextTermStartDate || '2025-05-05',
    principalName: settings.principalName || 'Dr. Arthur M. Kariuki, PhD',
    logoUrl: settings.logoUrl || '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large! Please upload a school logo under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(formData);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setSaving(false);
      alert(`Failed to save settings: ${err.message}`);
    }
  };

  const handleResetData = async () => {
    if (confirm('Re-seed initial sample records to Firestore database? This resets default sample records.')) {
      setSeeding(true);
      await checkAndSeedInitialData(true);
      setSeeding(false);
      alert('Sample dataset successfully seeded to Firestore!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            School Settings & Institutional Configuration
          </h1>
          <p className="text-xs text-slate-500">
            Upload school emblem/logo, manage MOE accreditation, official bursary credentials, term dates, and institutional details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRolesModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Key className="w-4 h-4 text-amber-300" />
            <span>Roles & Permissions Matrix</span>
          </button>

          <button
            onClick={handleResetData}
            disabled={seeding}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding Firestore...' : 'Reset / Re-seed Demo Data'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 0: Official Logo & Brand Visuals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              School Crest / Official Emblem & Logo
            </h2>
            <span className="text-[11px] text-slate-500">Displayed on Receipts, Report Cards, Student IDs & Top Header</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Logo Preview Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-slate-300 p-2 flex items-center justify-center shadow-xs overflow-hidden relative group">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="School Logo Preview"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <School className="w-10 h-10 text-slate-300 mb-1" />
                    <span className="text-[10px] font-bold">No Logo Set</span>
                  </div>
                )}
              </div>

              <p className="font-bold text-slate-900 mt-3 text-xs">{formData.schoolName || 'Uwezo Elite School'}</p>
              <p className="text-[10px] text-slate-500 italic max-w-[200px] truncate">{formData.motto}</p>

              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="mt-3 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Logo</span>
                </button>
              )}
            </div>

            {/* Upload Controls & URL input */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Upload Logo File (PNG, JPG, SVG, WebP)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="school-logo-input"
                  />
                  <label
                    htmlFor="school-logo-input"
                    className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-xs"
                  >
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>Choose Image File to Upload</span>
                  </label>
                  <span className="text-slate-400 text-[11px]">Max file size: 2MB</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Or Paste External Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/school-logo.png"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Preset Sample Emblems */}
              <div>
                <span className="block font-semibold text-slate-600 text-[11px] mb-1.5">Quick Presets:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_LOGOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: preset.url })}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-medium border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <img src={preset.url} alt={preset.name} className="w-4 h-4 rounded object-cover" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Institution Profile */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building className="w-4 h-4 text-emerald-600" />
            School Particulars & MOE Accreditation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official School Name *</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Motto / Slogan</label>
              <input
                type="text"
                value={formData.motto}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">MOE Registration Number</label>
              <input
                type="text"
                value={formData.moeRegNumber}
                onChange={(e) => setFormData({ ...formData, moeRegNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">KNEC Centre Code</label>
              <input
                type="text"
                value={formData.knecCode}
                onChange={(e) => setFormData({ ...formData, knecCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Principal / Head Teacher Name</label>
              <input
                type="text"
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution Type / Category</label>
              <input
                type="text"
                value={formData.schoolType}
                onChange={(e) => setFormData({ ...formData, schoolType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Curriculum Framework</label>
              <input
                type="text"
                value={formData.curriculum}
                onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Period & Dates */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Academic Calendar & Term Dates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={formData.currentAcademicYear}
                onChange={(e) => setFormData({ ...formData, currentAcademicYear: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Active Term</label>
              <select
                value={formData.currentTerm}
                onChange={(e) => setFormData({ ...formData, currentTerm: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                <option value="TERM_1">Term 1 (Jan - Apr)</option>
                <option value="TERM_2">Term 2 (May - Aug)</option>
                <option value="TERM_3">Term 3 (Sep - Nov)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Next Term Resumption Date</label>
              <input
                type="date"
                value={formData.nextTermStartDate}
                onChange={(e) => setFormData({ ...formData, nextTermStartDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Term Start Date</label>
              <input
                type="date"
                value={formData.termStartDate}
                onChange={(e) => setFormData({ ...formData, termStartDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Term End Date</label>
              <input
                type="date"
                value={formData.termEndDate}
                onChange={(e) => setFormData({ ...formData, termEndDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Bursary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            Contact Details & Official Bursary Accounts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Telephone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">M-Pesa Paybill Number</label>
              <input
                type="text"
                value={formData.mpesaPaybillNumber}
                onChange={(e) => setFormData({ ...formData, mpesaPaybillNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Physical Location & Campus</label>
              <input
                type="text"
                value={formData.physicalLocation}
                onChange={(e) => setFormData({ ...formData, physicalLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Account Particulars</label>
              <input
                type="text"
                value={formData.bankAccountDetails}
                onChange={(e) => setFormData({ ...formData, bankAccountDetails: e.target.value })}
                placeholder="Equity Bank - Acc: 1450289104821"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end sticky bottom-4 z-20">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-xl transition cursor-pointer"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Configuration Saved to Cloud!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Settings...' : 'Save School Configuration & Logo'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Roles & Permissions Modal */}
      <RolesPermissionsModal
        isOpen={isRolesModalOpen}
        onClose={() => setIsRolesModalOpen(false)}
      />
    </div>
  );
};
