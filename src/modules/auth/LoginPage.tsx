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
  HelpCircle,
  Check,
  GraduationCap,
  BookOpen,
  Phone,
  Mail,
  Shield,
  Layers,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSchoolSettings } from '../../contexts/SettingsContext';

interface LoginPageProps {
  onLoginSuccess?: () => void;
  onViewWebsite?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onViewWebsite,
}) => {
  const { loginWithCredentials, currentUser } = useAuth();
  const { settings } = useSchoolSettings();

  const [activePortalTab, setActivePortalTab] = useState<'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT'>('ADMIN');
  const [identifier, setIdentifier] = useState('superadmin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginWithCredentials(identifier, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      } else {
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const samplePersonas = [
    {
      role: 'Super Admin',
      username: 'superadmin',
      pass: 'Admin@123',
      icon: '👑',
      tag: 'Full Access & Config',
      category: 'ADMIN',
    },
    {
      role: 'Principal',
      username: 'principal',
      pass: 'Principal@123',
      icon: '🎓',
      tag: 'Academics & Oversight',
      category: 'ADMIN',
    },
    {
      role: 'Accountant / Bursar',
      username: 'accountant',
      pass: 'Accounts@123',
      icon: '💰',
      tag: 'Fee Collection & Finance',
      category: 'ADMIN',
    },
    {
      role: 'Class Teacher',
      username: 'teacher.mwale',
      pass: 'Teacher@123',
      icon: '📚',
      tag: 'CBC Marks & Attendance',
      category: 'TEACHER',
    },
    {
      role: 'Parent / Guardian',
      username: 'parent.kariuki',
      pass: 'Parent@123',
      icon: '👨‍👩‍👧',
      tag: 'Fee Statements & Reports',
      category: 'PARENT',
    },
    {
      role: 'Learner (Grade 6)',
      username: 'student.brian',
      pass: 'Student@123',
      icon: '🎒',
      tag: 'Student CBC Portal',
      category: 'STUDENT',
    },
    {
      role: 'Registrar',
      username: 'registrar',
      pass: 'Registrar@123',
      icon: '📝',
      tag: 'Admissions & Records',
      category: 'ADMIN',
    },
  ];

  const handleQuickFill = (p: typeof samplePersonas[0]) => {
    setIdentifier(p.username);
    setPassword(p.pass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#064e3b] flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-emerald-800/40 bg-emerald-950/30 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg border border-emerald-400/30 overflow-hidden">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="School Crest"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-serif font-black text-sm">
                UES
              </div>
            )}
          </div>
          <div>
            <h2 className="text-base font-bold font-serif text-white tracking-tight">
              {settings.schoolName || 'UWEZO ELITE SCHOOL'}
            </h2>
            <p className="text-[11px] text-emerald-200 font-medium">
              CBC & Junior Secondary Integrated ERP System
            </p>
          </div>
        </div>

        {onViewWebsite && (
          <button
            type="button"
            onClick={onViewWebsite}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </button>
        )}
      </header>

      {/* Main Login Center Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left / Top Form (7 Cols on desktop) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Portal Selector Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600 mb-6">
                {[
                  { id: 'ADMIN', label: 'Staff & Admin', icon: ShieldCheck },
                  { id: 'TEACHER', label: 'Teachers', icon: BookOpen },
                  { id: 'PARENT', label: 'Parents', icon: Phone },
                  { id: 'STUDENT', label: 'Students', icon: GraduationCap },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activePortalTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setActivePortalTab(t.id as any);
                        if (t.id === 'ADMIN') {
                          setIdentifier('superadmin');
                          setPassword('Admin@123');
                        } else if (t.id === 'TEACHER') {
                          setIdentifier('teacher.mwale');
                          setPassword('Teacher@123');
                        } else if (t.id === 'PARENT') {
                          setIdentifier('parent.kariuki');
                          setPassword('Parent@123');
                        } else if (t.id === 'STUDENT') {
                          setIdentifier('student.brian');
                          setPassword('Student@123');
                        }
                      }}
                      className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Title */}
              <div className="mb-5">
                <h3 className="text-2xl font-black font-serif text-slate-900 tracking-tight">
                  Sign In to School ERP
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your assigned username or email address and password to access your portal.
                </p>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{error}</div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Username or Email Address
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-page-identifier-input"
                      type="text"
                      required
                      placeholder="e.g. superadmin or teacher.mwale"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-slate-900 font-medium transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <span className="text-[11px] text-emerald-700 font-semibold cursor-pointer hover:underline">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-page-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-slate-900 font-medium transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
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

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Encrypted Session
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold tracking-wide transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
              Need assistance? Contact ICT Admin at{' '}
              <strong className="text-slate-700">{settings.phone || '+254 722 000 111'}</strong>
            </div>
          </div>

          {/* Right Panel: Quick Demo Personas (5 Cols on desktop) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-emerald-950 p-6 sm:p-8 text-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-emerald-800/30">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Instant Demo Logins
                </span>
              </div>
              <h4 className="text-base font-bold font-serif text-white tracking-tight">
                1-Click Account Switcher
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Click any role to populate credentials and test role-based portal features instantly:
              </p>

              {/* Personas List */}
              <div className="mt-4 space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {samplePersonas.map((p) => {
                  const isSelected = identifier === p.username;
                  return (
                    <button
                      key={p.username}
                      type="button"
                      onClick={() => handleQuickFill(p)}
                      className={`w-full p-2.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg shrink-0">{p.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight truncate">
                            {p.role}
                          </p>
                          <p className="text-[10px] text-emerald-300 font-mono">
                            @{p.username}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-300 bg-black/20 px-2 py-0.5 rounded-full border border-white/5">
                          {p.tag}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2.5 text-[11px] text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Institutional RBAC Protected System</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-3 border-t border-emerald-800/40 bg-emerald-950/40 text-center text-xs text-emerald-200/70">
        © {new Date().getFullYear()} {settings.schoolName || 'Uwezo Elite School'}. All rights reserved.
      </footer>
    </div>
  );
};
