import React, { useState } from 'react';
import {
  School,
  GraduationCap,
  Sparkles,
  BookOpen,
  Users,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Star,
  Clock,
  ShieldCheck,
  Send,
  ExternalLink,
  MessageCircle,
  Play,
  Heart,
  Globe,
  Compass,
  Laptop,
  Flame,
  ArrowUpRight,
  Sliders,
} from 'lucide-react';
import { useSchoolSettings } from '../../contexts/SettingsContext';
import { addAdmissionApplication } from '../../services/firebaseService';
import { GradeLevel } from '../../types';

interface PublicWebsiteProps {
  onNavigateToPortal?: (tab?: string) => void;
  onOpenCMS?: () => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({
  onNavigateToPortal,
  onOpenCMS,
}) => {
  const { settings, websiteSettings } = useSchoolSettings();
  const [activeSection, setActiveSection] = useState('home');
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    studentName: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '+254 7',
    gradeApplying: 'GRADE_1' as GradeLevel,
    previousSchool: '',
    notes: '',
  });

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAdmissionApplication({
        studentName: inquiryForm.studentName,
        gradeApplying: inquiryForm.gradeApplying,
        dateOfBirth: '2016-05-12',
        gender: 'MALE',
        parentName: inquiryForm.parentName,
        parentPhone: inquiryForm.parentPhone,
        parentEmail: inquiryForm.parentEmail,
        previousSchool: inquiryForm.previousSchool,
        status: 'PENDING_REVIEW',
        appliedDate: new Date().toISOString().split('T')[0],
        documents: [],
        notes: inquiryForm.notes ? `Website Inquiry: ${inquiryForm.notes}` : 'Submitted via Public Website',
      });
      setInquirySent(true);
      setInquiryForm({
        studentName: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '+254 7',
        gradeApplying: 'GRADE_1',
        previousSchool: '',
        notes: '',
      });
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    }
  };

  const heroBg =
    websiteSettings?.heroBackgroundImage ||
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white pb-20">
      {/* Top Notification Bar */}
      {websiteSettings?.admissionsOpen && (
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white py-2 px-4 text-xs text-center font-bold flex items-center justify-center gap-2 border-b border-emerald-500/30">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
          <span>{websiteSettings.admissionsBannerText || 'Admissions for 2025/2026 Academic Year are Open! Playgroup to Grade 9 JSS'}</span>
          <button
            onClick={() => {
              const el = document.getElementById('admissions-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="ml-2 underline font-extrabold hover:text-amber-200 cursor-pointer"
          >
            Apply Online &rarr;
          </button>
        </div>
      )}

      {/* Website Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg border border-emerald-500/40 shrink-0 overflow-hidden">
                <img
                  src={settings.logoUrl}
                  alt={settings.schoolName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold text-lg shadow-lg border border-emerald-500/40 shrink-0">
                {(settings?.schoolName || 'UES')
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 3)
                  .join('')
                  .toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-base sm:text-lg font-black font-serif text-white tracking-tight leading-tight">
                {settings?.schoolName || 'UWEZO ELITE SCHOOL'}
              </h1>
              <p className="text-[11px] text-emerald-400 font-semibold tracking-wide">
                {settings?.motto || 'Excellence in Character, Innovation and Leadership'}
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#home" className="hover:text-emerald-400 transition">Home</a>
            <a href="#about" className="hover:text-emerald-400 transition">About Us</a>
            <a href="#academics" className="hover:text-emerald-400 transition">Academics & CBC</a>
            <a href="#facilities" className="hover:text-emerald-400 transition">Facilities</a>
            <a href="#news" className="hover:text-emerald-400 transition">News</a>
            <a href="#testimonials" className="hover:text-emerald-400 transition">Testimonials</a>
            <a href="#admissions" className="hover:text-emerald-400 transition">Admissions</a>
            <a href="#contact" className="hover:text-emerald-400 transition">Contact</a>
          </nav>

          {/* Actions & ERP Switcher */}
          <div className="flex items-center gap-2">
            {onOpenCMS && (
              <button
                onClick={onOpenCMS}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                title="Edit Website Content in Admin CMS"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit CMS</span>
              </button>
            )}

            {onNavigateToPortal && (
              <button
                onClick={() => onNavigateToPortal('dashboard')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ERP Portal</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36 bg-cover bg-center border-b border-slate-800"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url(${heroBg})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{websiteSettings?.tagline || 'Premier CBC & Junior Secondary Excellence'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif text-white tracking-tight max-w-4xl mx-auto leading-tight">
            {websiteSettings?.heroHeadline || 'Nurturing Future Leaders with Excellence, Character & Technology'}
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            {websiteSettings?.heroSubtitle ||
              'A world-class co-educational day and boarding institution in Kenya empowering learners through modern CBC, STEM innovation, and values.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <a
              href="#admissions"
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/50 transition flex items-center gap-2"
            >
              <span>{websiteSettings?.heroCtaText || 'Enroll / Apply for Admission'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#academics"
              className="px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition flex items-center gap-2 backdrop-blur-xs"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Explore CBC Curriculum</span>
            </a>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12">
            <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">950+</p>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Enrolled Learners</p>
            </div>
            <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-black text-amber-400">48+</p>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Certified TSC Faculty</p>
            </div>
            <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-black text-teal-400">100%</p>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-1">JSS Transition Rate</p>
            </div>
            <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 text-center">
              <p className="text-2xl sm:text-3xl font-black text-purple-400">24+</p>
              <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Co-Curricular Clubs</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us & Principal Welcome */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Welcome from the Principal
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-white">
              Shaping Inquisitive Minds, Building Moral Integrity
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {websiteSettings?.principalWelcome ||
                'Welcome to Uwezo Elite School. We are dedicated to nurturing holistic growth through our tailored Competency Based Curriculum (CBC). Our learners explore their talents, cultivate critical thinking, and master modern digital literacy in a supportive, disciplined environment.'}
            </p>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-amber-300 font-serif font-bold text-xl flex items-center justify-center shadow-md">
                KM
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {settings?.principalName || 'Dr. Arthur M. Kariuki, PhD'}
                </p>
                <p className="text-xs text-emerald-400 font-medium">
                  Principal & Chief Academic Officer
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <Compass className="w-6 h-6 text-emerald-400" />
              <h4 className="font-bold text-sm text-white">Our Mission</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {websiteSettings?.mission ||
                  'To provide exemplary CBC education integrated with STEM innovation, nurturing confident and responsible global citizens.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <Globe className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-sm text-white">Our Vision</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {websiteSettings?.vision ||
                  'To be East Africa’s premier model academy recognized for CBC mastery, moral integrity, and technological innovation.'}
              </p>
            </div>

            <div className="sm:col-span-2 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
              <Heart className="w-6 h-6 text-emerald-400" />
              <h4 className="font-bold text-sm text-white">Core Values</h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {(websiteSettings?.coreValues || ['Integrity', 'Academic Rigor', 'Innovation', 'Discipline', 'Christian Values', 'Inclusivity']).map(
                  (val, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-900/60 text-emerald-200 text-xs font-bold border border-emerald-700/50"
                    >
                      {val}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Programs (CBC & JSS) */}
      <section id="academics" className="py-20 bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Curriculum & Programs
            </span>
            <h3 className="text-2xl sm:text-4xl font-serif font-black text-white">
              Comprehensive CBC Academic Pathways
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Carefully structured learning pathways adhering strictly to Kenya Institute of Curriculum Development (KICD) guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(websiteSettings?.programs || []).map((prog) => (
              <div
                key={prog.id}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/60 transition-all flex flex-col justify-between group shadow-lg hover:shadow-emerald-950/50"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-800/60 group-hover:scale-105 transition">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {prog.ageGroup}
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">{prog.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{prog.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-bold">
                  <span>CBC Aligned</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Facilities */}
      <section id="facilities" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            World-Class Infrastructure
          </span>
          <h3 className="text-2xl sm:text-4xl font-serif font-black text-white">
            Campus Facilities & Resources
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            State-of-the-art facilities engineered to stimulate hands-on discovery and creative potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(websiteSettings?.facilities || []).map((fac) => (
            <div
              key={fac.id}
              className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 group hover:border-slate-700 transition"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={fac.imageUrl}
                  alt={fac.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              </div>
              <div className="p-5 space-y-2">
                <h4 className="font-bold text-sm text-white">{fac.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{fac.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Community Voices
            </span>
            <h3 className="text-2xl sm:text-4xl font-serif font-black text-white">
              What Parents & Alumni Say
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(websiteSettings?.testimonials || []).map((test) => (
              <div
                key={test.id}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(test.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{test.content}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-emerald-900 text-emerald-200 font-bold flex items-center justify-center text-xs">
                    {test.authorName?.[0] || 'P'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{test.authorName}</p>
                    <p className="text-[11px] text-emerald-400">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Articles */}
      <section id="news" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            School Bulletins & News
          </span>
          <h3 className="text-2xl sm:text-4xl font-serif font-black text-white">
            Latest School Events & Achievements
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(websiteSettings?.newsArticles || []).map((art) => (
            <div
              key={art.id}
              className="bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-3 hover:border-emerald-500/50 transition"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800/60">
                  {art.category}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">{art.publishDate}</span>
              </div>
              <h4 className="text-base font-bold text-white">{art.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{art.excerpt}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Online Admissions Application Form */}
      <section id="admissions" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Online Admission Portal
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Apply for Admission at Uwezo Elite
              </h3>
              <p className="text-xs text-slate-400">
                Submit an online application for Playgroup, Pre-Primary, Primary, or Junior Secondary (Grade 7-9).
              </p>
            </div>

            {inquirySent ? (
              <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Application Received!</h4>
                <p className="text-xs text-emerald-200">
                  Thank you! Our Admissions Office will contact you on <strong>{inquiryForm.parentPhone || 'your phone'}</strong> with fee structures and interview dates.
                </p>
                <button
                  type="button"
                  onClick={() => setInquirySent(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Learner's Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liam Kipchumba"
                      value={inquiryForm.studentName}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, studentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Grade Applying For *</label>
                    <select
                      value={inquiryForm.gradeApplying}
                      onChange={(e) =>
                        setInquiryForm({ ...inquiryForm, gradeApplying: e.target.value as GradeLevel })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden"
                    >
                      <option value="PLAYGROUP">Playgroup (Age 2-3)</option>
                      <option value="PP1">PP1 (Pre-Primary 1)</option>
                      <option value="PP2">PP2 (Pre-Primary 2)</option>
                      <option value="GRADE_1">Grade 1 (Primary)</option>
                      <option value="GRADE_2">Grade 2 (Primary)</option>
                      <option value="GRADE_3">Grade 3 (Primary)</option>
                      <option value="GRADE_4">Grade 4 (Primary)</option>
                      <option value="GRADE_5">Grade 5 (Primary)</option>
                      <option value="GRADE_6">Grade 6 (Primary)</option>
                      <option value="GRADE_7">Grade 7 (Junior Secondary JSS)</option>
                      <option value="GRADE_8">Grade 8 (Junior Secondary JSS)</option>
                      <option value="GRADE_9">Grade 9 (Junior Secondary JSS)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Parent / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Wanjiku"
                      value={inquiryForm.parentName}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, parentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Parent Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 712 345 678"
                      value={inquiryForm.parentPhone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, parentPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Parent Email</label>
                    <input
                      type="email"
                      placeholder="parent@gmail.com"
                      value={inquiryForm.parentEmail}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, parentEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Previous School (if transferring)</label>
                  <input
                    type="text"
                    placeholder="e.g. St. Christopher Academy"
                    value={inquiryForm.previousSchool}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, previousSchool: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Inquiry Details or Questions</label>
                  <textarea
                    rows={3}
                    placeholder="Any special medical conditions, transport inquiries, boarding requirements..."
                    value={inquiryForm.notes}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Admission Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Contact & Campus Info */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <Phone className="w-6 h-6 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">Call Admissions Hotline</h4>
            <p className="text-xs text-slate-400 font-mono">
              {websiteSettings?.contactPhone || settings?.phone || '+254 700 000 000 / +254 722 123 456'}
            </p>
            <p className="text-[11px] text-slate-500">Mon - Fri: 7:30 AM – 5:00 PM</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <Mail className="w-6 h-6 text-amber-400" />
            <h4 className="font-bold text-sm text-white">Email Inquiries</h4>
            <p className="text-xs text-slate-400">
              {websiteSettings?.contactEmail || settings?.email || 'admissions@uwezoelite.ac.ke'}
            </p>
            <p className="text-[11px] text-slate-500">Replies within 24 hours</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <MapPin className="w-6 h-6 text-teal-400" />
            <h4 className="font-bold text-sm text-white">Campus Location</h4>
            <p className="text-xs text-slate-400">
              {websiteSettings?.contactAddress || settings?.address || 'Ruiru / Membley, Nairobi Metro, Kenya'}
            </p>
            <p className="text-[11px] text-slate-500">KNEC Code: {settings?.knecCode || '204581'}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-300">{settings?.schoolName || 'UWEZO ELITE SCHOOL'}</p>
            <p className="text-[11px] mt-0.5">Ministry of Education Reg: {settings?.moeRegNumber || 'MOE/PRI/2024/098'}</p>
          </div>

          <p className="text-center sm:text-right">
            &copy; {new Date().getFullYear()} Uwezo Elite School. All rights reserved. Powered by Uwezo ERP & CMS.
          </p>
        </div>
      </footer>
    </div>
  );
};
