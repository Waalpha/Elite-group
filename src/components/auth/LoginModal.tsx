import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  School,
  Sparkles,
  ArrowRight,
  X,
  HelpCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchoolSettings } from '../../contexts/SettingsContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithCredentials, currentUser } = useAuth();
  const { settings } = useSchoolSettings();

  const [identifier, setIdentifier] = useState('superadmin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCredentialsGuide, setShowCredentialsGuide] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginWithCredentials(identifier, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const sampleAccounts = [
    {
      role: 'Super Admin',
      username: 'superadmin',
      pass: 'Admin@123',
      icon: '👑',
      badge: 'All Modules & Config',
      color: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    {
      role: 'Principal',
      username: 'principal',
      pass: 'Principal@123',
      icon: '🎓',
      badge: 'Academic & Admin Oversight',
      color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    },
    {
      role: 'Accountant / Bursar',
      username: 'accountant',
      pass: 'Accounts@123',
      icon: '💰',
      badge: 'Fees & Financials',
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    {
      role: 'Class Teacher',
      username: 'teacher.mwale',
      pass: 'Teacher@123',
      icon: '📚',
      badge: 'Marks & Attendance',
      color: 'bg-blue-50 text-blue-900 border-blue-200',
    },
    {
      role: 'Parent / Guardian',
      username: 'parent.kariuki',
      pass: 'Parent@123',
      icon: '👨‍👩‍👧',
      badge: 'Child Dossier & Invoices',
      color: 'bg-teal-50 text-teal-900 border-teal-200',
    },
    {
      role: 'Learner (Grade 6)',
      username: 'student.brian',
      pass: 'Student@123',
      icon: '🎒',
      badge: 'Student CBC Portal',
      color: 'bg-purple-50 text-purple-900 border-purple-200',
    },
    {
      role: 'Registrar',
      username: 'registrar',
      pass: 'Registrar@123',
      icon: '📝',
      badge: 'Admissions & Records',
      color: 'bg-rose-50 text-rose-900 border-rose-200',
    },
  ];

  const handleQuickFill = (acc: typeof sampleAccounts[0]) => {
    setIdentifier(acc.username);
    setPassword(acc.pass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md shrink-0">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="School Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold text-base">
                  UES
                </div>
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/50 text-emerald-200 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-amber-300" />
                <span>Super Admin Provisioned Login</span>
              </div>
              <h2 className="text-xl font-bold font-serif text-white tracking-tight mt-1">
                {settings?.schoolName || 'Uwezo Elite School'}
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Sign in to your authorized school ERP staff or portal account
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Currently Logged In Notice */}
          {currentUser && (
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Currently active:{' '}
                  <strong>{currentUser.displayName}</strong> ({currentUser.role})
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
                @{currentUser.username || 'user'}
              </span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-identifier-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Username or Institutional Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-identifier-input"
                  type="text"
                  required
                  placeholder="e.g. superadmin or teacher.mwale"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition text-slate-900 font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Enter your username or email created by the Super Admin
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition text-slate-900 font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In with Credentials</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Sample Accounts Created by Super Admin */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Super Admin Seeded Credentials (Quick Test)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowCredentialsGuide(!showCredentialsGuide)}
                className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                {showCredentialsGuide ? 'Hide' : 'Show'}
              </button>
            </div>

            {showCredentialsGuide && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {sampleAccounts.map((acc) => {
                  const isSelected = identifier === acc.username;
                  return (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      className={`p-2 rounded-xl text-left transition border cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                          : `${acc.color} hover:shadow-xs`
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{acc.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight truncate">
                            {acc.role}
                          </p>
                          <p className="text-[10px] opacity-80 truncate font-mono">
                            {acc.username} / {acc.pass}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Super Admin Control</strong>: Super Admins can add or edit staff login accounts, change passwords, and assign role access in the{' '}
              <strong className="text-slate-700">Staff Faculty &gt; User Access Accounts</strong> module.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
