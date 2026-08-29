import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Sliders,
  Sparkles,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  BookOpen,
  Building,
  MessageSquare,
  Newspaper,
  Phone,
  Eye,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  Star,
  Upload,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Check,
} from 'lucide-react';
import { useSchoolSettings } from '../../contexts/SettingsContext';
import {
  WebsiteSettings,
  WebsiteProgram,
  WebsiteFacility,
  WebsiteTestimonial,
  WebsiteNewsArticle,
  WebsiteHeroSlide,
} from '../../types';
import { Modal } from '../../components/common/Modal';

const PRESET_HERO_IMAGES = [
  {
    name: 'Modern Campus & Learners',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Classroom & Digital Learning',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Science & Robotics Laboratory',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Campus Library & Study Area',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Athletics & Sports Grounds',
    url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=1600&auto=format&fit=crop&q=80',
  },
];

const BADGE_COLOR_OPTIONS = [
  { label: 'Emerald / Green', value: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
  { label: 'Blue / Indigo', value: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
  { label: 'Amber / Gold', value: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { label: 'Purple / Violet', value: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
  { label: 'Rose / Pink', value: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
  { label: 'Cyan / Teal', value: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' },
];

interface WebsiteCMSModuleProps {
  onPreviewWebsite?: () => void;
}

export const WebsiteCMSModule: React.FC<WebsiteCMSModuleProps> = ({ onPreviewWebsite }) => {
  const { websiteSettings, updateWebsiteSettings } = useSchoolSettings();
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'programs' | 'facilities' | 'testimonials' | 'news' | 'contact'>('hero');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form State
  const [formData, setFormData] = useState<WebsiteSettings>({ ...websiteSettings });

  // Modals for sub-items
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<WebsiteHeroSlide | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WebsiteProgram | null>(null);
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<WebsiteFacility | null>(null);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<WebsiteTestimonial | null>(null);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<WebsiteNewsArticle | null>(null);

  // Keep form data in sync with context
  useEffect(() => {
    if (websiteSettings) {
      setFormData({ ...websiteSettings });
    }
  }, [websiteSettings]);

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateWebsiteSettings(formData);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setSaving(false);
      alert(`Error saving website settings: ${err.message}`);
    }
  };

  // Hero Slides Handlers
  const handleOpenAddSlide = () => {
    const newSlide: WebsiteHeroSlide = {
      id: `slide_${Date.now()}`,
      tag: 'Academic Excellence & Innovation',
      headline: 'Empowering Learners with Modern Skills & Values',
      subtitle: 'Join Uwezo Elite School for world-class education from Playgroup to Junior Secondary.',
      ctaText: 'Apply for Admission',
      ctaLink: '#admissions',
      secondaryText: 'Explore CBC Curriculum',
      secondaryLink: '#academics',
      bgImage: PRESET_HERO_IMAGES[0].url,
      badgeColor: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      active: true,
      order: (formData.heroSlides?.length || 0) + 1,
    };
    setEditingSlide(newSlide);
    setSlideModalOpen(true);
  };

  const handleSaveSlide = (slide: WebsiteHeroSlide) => {
    const list = [...(formData.heroSlides || [])];
    const idx = list.findIndex((s) => s.id === slide.id);
    if (idx >= 0) {
      list[idx] = slide;
    } else {
      list.push(slide);
    }
    setFormData((prev) => ({ ...prev, heroSlides: list }));
    setSlideModalOpen(false);
    setEditingSlide(null);
  };

  const handleDeleteSlide = (id: string) => {
    if (confirm('Are you sure you want to delete this hero slide?')) {
      setFormData((prev) => ({
        ...prev,
        heroSlides: (prev.heroSlides || []).filter((s) => s.id !== id),
      }));
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const list = [...(formData.heroSlides || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setFormData((prev) => ({ ...prev, heroSlides: list }));
  };

  const handleToggleSlideActive = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).map((s) =>
        s.id === id ? { ...s, active: s.active === false ? true : false } : s
      ),
    }));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (editingSlide) {
        setEditingSlide({ ...editingSlide, bgImage: result });
      }
    };
    reader.readAsDataURL(file);
  };

  // Program Handlers
  const handleSaveProgram = (prog: WebsiteProgram) => {
    const list = [...(formData.programs || [])];
    const idx = list.findIndex((p) => p.id === prog.id);
    if (idx >= 0) {
      list[idx] = prog;
    } else {
      list.push({ ...prog, id: prog.id || `prog_${Date.now()}` });
    }
    setFormData((prev) => ({ ...prev, programs: list }));
    setProgramModalOpen(false);
    setEditingProgram(null);
  };

  const handleDeleteProgram = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      programs: (prev.programs || []).filter((p) => p.id !== id),
    }));
  };

  // Facility Handlers
  const handleSaveFacility = (fac: WebsiteFacility) => {
    const list = [...(formData.facilities || [])];
    const idx = list.findIndex((f) => f.id === fac.id);
    if (idx >= 0) {
      list[idx] = fac;
    } else {
      list.push({ ...fac, id: fac.id || `fac_${Date.now()}` });
    }
    setFormData((prev) => ({ ...prev, facilities: list }));
    setFacilityModalOpen(false);
    setEditingFacility(null);
  };

  const handleDeleteFacility = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: (prev.facilities || []).filter((f) => f.id !== id),
    }));
  };

  // Testimonial Handlers
  const handleSaveTestimonial = (test: WebsiteTestimonial) => {
    const list = [...(formData.testimonials || [])];
    const idx = list.findIndex((t) => t.id === test.id);
    if (idx >= 0) {
      list[idx] = test;
    } else {
      list.push({ ...test, id: test.id || `test_${Date.now()}` });
    }
    setFormData((prev) => ({ ...prev, testimonials: list }));
    setTestimonialModalOpen(false);
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((t) => t.id !== id),
    }));
  };

  // News Handlers
  const handleSaveNews = (art: WebsiteNewsArticle) => {
    const list = [...(formData.newsArticles || [])];
    const idx = list.findIndex((n) => n.id === art.id);
    if (idx >= 0) {
      list[idx] = art;
    } else {
      list.push({ ...art, id: art.id || `news_${Date.now()}` });
    }
    setFormData((prev) => ({ ...prev, newsArticles: list }));
    setNewsModalOpen(false);
    setEditingNews(null);
  };

  const handleDeleteNews = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      newsArticles: (prev.newsArticles || []).filter((n) => n.id !== id),
    }));
  };

  const currentHeroSlides = formData.heroSlides && formData.heroSlides.length > 0
    ? formData.heroSlides
    : [
        {
          id: 'slide-1',
          tag: formData.tagline || 'Premier CBC & Junior Secondary Excellence',
          headline: formData.heroHeadline || 'Nurturing Future Leaders with Excellence, Character & Technology',
          subtitle: formData.heroSubtitle || 'A world-class co-educational day and boarding institution in Kenya empowering learners through modern CBC, STEM innovation, and values.',
          ctaText: formData.heroCtaText || 'Enroll / Apply for Admission',
          ctaLink: '#admissions',
          secondaryText: 'Explore CBC Curriculum',
          secondaryLink: '#academics',
          bgImage: formData.heroBackgroundImage || PRESET_HERO_IMAGES[0].url,
          badgeColor: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          active: true,
          order: 1,
        },
      ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-emerald-600" />
            Public Website Content Management System (CMS)
          </h1>
          <p className="text-xs text-slate-500">
            Control the school's public website: hero banner, admissions announcement, academic programs, facilities, and testimonials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onPreviewWebsite && (
            <button
              onClick={onPreviewWebsite}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Preview Public Website</span>
            </button>
          )}

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Changes...' : 'Publish Website Updates'}</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Public website content successfully saved and synchronized across all visitors!</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'hero', label: 'Hero & Admissions Banner', icon: Sparkles },
          { id: 'about', label: 'About & Leadership', icon: BookOpen },
          { id: 'programs', label: `CBC Programs (${formData.programs?.length || 0})`, icon: Layers },
          { id: 'facilities', label: `Facilities (${formData.facilities?.length || 0})`, icon: Building },
          { id: 'testimonials', label: `Testimonials (${formData.testimonials?.length || 0})`, icon: MessageSquare },
          { id: 'news', label: `News & Bulletins (${formData.newsArticles?.length || 0})`, icon: Newspaper },
          { id: 'contact', label: 'Contact & Socials', icon: Phone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Hero & Admissions Banner */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Admissions Ribbon Bar Settings */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Top Admissions Alert Ribbon
                </h3>
                <p className="text-xs text-slate-500">
                  Toggle and edit the top announcement ticker ribbon shown on the public site.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={formData.admissionsOpen}
                  onChange={(e) => setFormData({ ...formData, admissionsOpen: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                />
                <span>Show Top Banner</span>
              </label>
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-700 block mb-1">Admissions Alert Banner Text</label>
              <input
                type="text"
                value={formData.admissionsBannerText}
                onChange={(e) => setFormData({ ...formData, admissionsBannerText: e.target.value })}
                placeholder="e.g. Admissions for 2025/2026 Academic Year are Open! Playgroup to Grade 9 JSS"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>

          {/* Multi-Slide Hero Carousel Manager */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Hero Carousel Slides ({currentHeroSlides.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Add, customize, upload photos for, and reorder rotating hero slides on the homepage.
                </p>
              </div>

              <button
                type="button"
                id="add-hero-slide-btn"
                onClick={handleOpenAddSlide}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            {/* List of Slides */}
            <div className="space-y-4">
              {currentHeroSlides.map((slide, index) => (
                <div
                  key={slide.id || index}
                  className={`p-4 rounded-2xl border transition-all ${
                    slide.active !== false
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-slate-100/50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    {/* Thumbnail preview with badge */}
                    <div className="relative w-full md:w-56 h-32 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 shadow-xs">
                      <img
                        src={slide.bgImage || PRESET_HERO_IMAGES[0].url}
                        alt={slide.headline}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-950/40" />
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                        <span className="text-[10px] bg-slate-950/80 text-white px-2 py-0.5 rounded-full font-bold">
                          Slide #{index + 1}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            slide.active !== false
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-slate-600 text-slate-200'
                          }`}
                        >
                          {slide.active !== false ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="text-[10px] font-bold text-white line-clamp-1">
                          {slide.tag || 'Slide Tag'}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${slide.badgeColor || 'bg-emerald-500/20 text-emerald-700 border-emerald-300'}`}>
                          {slide.tag}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {slide.headline}
                      </h4>

                      <p className="text-slate-500 text-xs line-clamp-2">
                        {slide.subtitle}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                        <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                          CTA: {slide.ctaText || 'Apply'} &rarr; ({slide.ctaLink || '#admissions'})
                        </span>
                        {slide.secondaryText && (
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                            Secondary: {slide.secondaryText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1.5 md:flex-col shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(index, 'up')}
                          disabled={index === 0}
                          title="Move Slide Up"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(index, 'down')}
                          disabled={index === currentHeroSlides.length - 1}
                          title="Move Slide Down"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlide({ ...slide });
                          setSlideModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-200 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSlideActive(slide.id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                          slide.active !== false
                            ? 'text-slate-600 hover:bg-slate-200'
                            : 'text-emerald-700 bg-emerald-50'
                        }`}
                      >
                        {slide.active !== false ? 'Disable' : 'Enable'}
                      </button>

                      {currentHeroSlides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: About & Leadership */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">About Us, Mission & Leadership Message</h3>
            <p className="text-xs text-slate-500">Edit institutional welcome notes, mission statement, vision, and core values.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Principal's Welcome Address</label>
              <textarea
                rows={4}
                value={formData.principalWelcome}
                onChange={(e) => setFormData({ ...formData, principalWelcome: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">School Mission Statement</label>
                <textarea
                  rows={3}
                  value={formData.mission}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">School Vision Statement</label>
                <textarea
                  rows={3}
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Core Values (Comma Separated)
              </label>
              <input
                type="text"
                value={(formData.coreValues || []).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    coreValues: e.target.value
                      .split(',')
                      .map((v) => v.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g. Integrity, Academic Rigor, Innovation, Discipline, Christian Values"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Academic Programs */}
      {activeTab === 'programs' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic Pathways & Programs</h3>
              <p className="text-xs text-slate-500">Showcase curriculum pathways from Playgroup to Junior Secondary.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingProgram({
                  id: '',
                  title: '',
                  ageGroup: '',
                  description: '',
                  icon: 'GraduationCap',
                  order: (formData.programs?.length || 0) + 1,
                });
                setProgramModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Program</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(formData.programs || []).map((prog) => (
              <div
                key={prog.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      {prog.ageGroup}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProgram(prog);
                          setProgramModalOpen(true);
                        }}
                        className="p-1 hover:text-emerald-700 rounded-md"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(prog.id)}
                        className="p-1 hover:text-rose-700 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{prog.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{prog.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Campus Facilities */}
      {activeTab === 'facilities' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Campus Facilities & Infrastructure</h3>
              <p className="text-xs text-slate-500">Highlight science labs, digital hub, sports complex, and resources.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingFacility({
                  id: '',
                  title: '',
                  description: '',
                  imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
                  category: 'Laboratories',
                });
                setFacilityModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Facility</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(formData.facilities || []).map((fac) => (
              <div
                key={fac.id}
                className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div className="h-32 bg-slate-200 overflow-hidden">
                  <img
                    src={fac.imageUrl}
                    alt={fac.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{fac.title}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingFacility(fac);
                          setFacilityModalOpen(true);
                        }}
                        className="p-1 hover:text-emerald-700 rounded-md"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFacility(fac.id)}
                        className="p-1 hover:text-rose-700 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{fac.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Testimonials */}
      {activeTab === 'testimonials' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Parent & Alumni Testimonials</h3>
              <p className="text-xs text-slate-500">Showcase authentic endorsements and parent reviews.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingTestimonial({
                  id: '',
                  authorName: '',
                  role: 'Parent of Grade 5 Learner',
                  content: '',
                  rating: 5,
                });
                setTestimonialModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(formData.testimonials || []).map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingTestimonial(t);
                        setTestimonialModalOpen(true);
                      }}
                      className="p-1 hover:text-emerald-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(t.id)}
                      className="p-1 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-700 italic">"{t.content}"</p>
                <div className="pt-2 text-[11px]">
                  <p className="font-bold text-slate-900">{t.authorName}</p>
                  <p className="text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: News & Articles */}
      {activeTab === 'news' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">School Bulletins & News Articles</h3>
              <p className="text-xs text-slate-500">Publish announcements, prize-giving events, and sports victories.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingNews({
                  id: '',
                  title: '',
                  excerpt: '',
                  content: '',
                  publishDate: new Date().toISOString().split('T')[0],
                  category: 'Academics',
                  featured: true,
                });
                setNewsModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(formData.newsArticles || []).map((art) => (
              <div key={art.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingNews(art);
                        setNewsModalOpen(true);
                      }}
                      className="p-1 hover:text-emerald-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNews(art.id)}
                      className="p-1 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{art.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{art.excerpt}</p>
                <p className="text-[10px] text-slate-400">{art.publishDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: Contact & Socials */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Public Contact & Admissions Inquiries</h3>
            <p className="text-xs text-slate-500">Contact information rendered on the public website footer and forms.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Admissions Phone Hotline</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+254 700 000 000 / +254 722 123 456"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Admissions Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="admissions@uwezoelite.ac.ke"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Physical Campus Location</label>
              <input
                type="text"
                value={formData.contactAddress}
                onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                placeholder="Ruiru / Membley, Nairobi Metro, Kenya"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Program Editor */}
      {programModalOpen && editingProgram && (
        <Modal
          isOpen={programModalOpen}
          onClose={() => setProgramModalOpen(false)}
          title="Edit Academic Program"
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveProgram(editingProgram);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="font-bold text-slate-700 block mb-1">Program Title *</label>
              <input
                type="text"
                required
                value={editingProgram.title}
                onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })}
                placeholder="e.g. Junior Secondary School (JSS)"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Age / Target Group</label>
              <input
                type="text"
                value={editingProgram.ageGroup}
                onChange={(e) => setEditingProgram({ ...editingProgram, ageGroup: e.target.value })}
                placeholder="e.g. Grade 7 - Grade 9 (Ages 12-15)"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Program Description</label>
              <textarea
                rows={3}
                value={editingProgram.description}
                onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProgramModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Save Program
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Facility Editor */}
      {facilityModalOpen && editingFacility && (
        <Modal
          isOpen={facilityModalOpen}
          onClose={() => setFacilityModalOpen(false)}
          title="Edit Campus Facility"
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveFacility(editingFacility);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="font-bold text-slate-700 block mb-1">Facility Name *</label>
              <input
                type="text"
                required
                value={editingFacility.title}
                onChange={(e) => setEditingFacility({ ...editingFacility, title: e.target.value })}
                placeholder="e.g. Digital Computer & Coding Hub"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Image URL</label>
              <input
                type="text"
                value={editingFacility.imageUrl}
                onChange={(e) => setEditingFacility({ ...editingFacility, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description</label>
              <textarea
                rows={3}
                value={editingFacility.description}
                onChange={(e) => setEditingFacility({ ...editingFacility, description: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFacilityModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Save Facility
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Testimonial Editor */}
      {testimonialModalOpen && editingTestimonial && (
        <Modal
          isOpen={testimonialModalOpen}
          onClose={() => setTestimonialModalOpen(false)}
          title="Edit Testimonial"
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveTestimonial(editingTestimonial);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="font-bold text-slate-700 block mb-1">Author Name *</label>
              <input
                type="text"
                required
                value={editingTestimonial.authorName}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, authorName: e.target.value })}
                placeholder="e.g. Mrs. Grace Njeri"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Author Role / Designation</label>
              <input
                type="text"
                value={editingTestimonial.role}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                placeholder="e.g. Parent of Grade 7 JSS Learner"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Quote Content</label>
              <textarea
                rows={3}
                required
                value={editingTestimonial.content}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTestimonialModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Save Testimonial
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: News Editor */}
      {newsModalOpen && editingNews && (
        <Modal
          isOpen={newsModalOpen}
          onClose={() => setNewsModalOpen(false)}
          title="Edit News Article / Bulletin"
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveNews(editingNews);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="font-bold text-slate-700 block mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={editingNews.title}
                onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                placeholder="e.g. Uwezo Elite Clinches 1st Position in Regional Science Fair"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <input
                  type="text"
                  value={editingNews.category}
                  onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value })}
                  placeholder="e.g. Science & STEM"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Publish Date</label>
                <input
                  type="date"
                  value={editingNews.publishDate}
                  onChange={(e) => setEditingNews({ ...editingNews, publishDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Excerpt / Brief Summary</label>
              <textarea
                rows={3}
                value={editingNews.excerpt}
                onChange={(e) => setEditingNews({ ...editingNews, excerpt: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewsModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Save Article
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Hero Slide Editor with Photo Upload */}
      {slideModalOpen && editingSlide && (
        <Modal
          isOpen={slideModalOpen}
          onClose={() => setSlideModalOpen(false)}
          title={editingSlide.id.startsWith('slide_') ? 'Add Hero Slide' : 'Edit Hero Slide'}
          size="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveSlide(editingSlide);
            }}
            className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1"
          >
            {/* Live Visual Preview Card */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Live Slide Preview</label>
              <div
                className="relative rounded-2xl overflow-hidden p-6 text-white bg-cover bg-center border border-slate-700 shadow-md min-h-[180px] flex flex-col justify-between"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.95)), url(${editingSlide.bgImage || PRESET_HERO_IMAGES[0].url})`,
                }}
              >
                <div>
                  <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${editingSlide.badgeColor || BADGE_COLOR_OPTIONS[0].value}`}>
                    {editingSlide.tag || 'Slide Tag'}
                  </span>
                  <h4 className="text-base font-extrabold font-serif mt-2 line-clamp-2">
                    {editingSlide.headline || 'Headline of the Slide'}
                  </h4>
                  <p className="text-slate-300 text-[11px] mt-1 line-clamp-2">
                    {editingSlide.subtitle || 'Subtitle summary explaining the slide.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3">
                  <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px]">
                    {editingSlide.ctaText || 'CTA Button'} &rarr;
                  </span>
                  {editingSlide.secondaryText && (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-xs text-white font-semibold rounded-lg text-[11px]">
                      {editingSlide.secondaryText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Background Image Upload & Selection */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Upload or Choose Slide Background Image *</span>
                </label>
                <span className="text-[11px] text-slate-500">Max 5MB (JPG, PNG, WebP)</span>
              </div>

              {/* Upload Input & Drop Area */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileUpload}
                  accept="image/*"
                  className="hidden"
                  id="hero-slide-file-input"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image from Device</span>
                </button>

                <span className="text-slate-400 font-bold text-[11px]">OR</span>

                <input
                  type="text"
                  value={editingSlide.bgImage}
                  onChange={(e) => setEditingSlide({ ...editingSlide, bgImage: e.target.value })}
                  placeholder="Paste direct Image URL (https://...)"
                  className="w-full sm:flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Preset Quick Select */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] text-slate-500 font-medium">Or pick from preset school gallery photos:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_HERO_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, bgImage: preset.url })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        editingSlide.bgImage === preset.url
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tag & Color Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Slide Eyebrow / Tag *</label>
                <input
                  type="text"
                  required
                  value={editingSlide.tag}
                  onChange={(e) => setEditingSlide({ ...editingSlide, tag: e.target.value })}
                  placeholder="e.g. Junior Secondary (JSS) & STEM Hub"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tag Badge Accent Color</label>
                <select
                  value={editingSlide.badgeColor || BADGE_COLOR_OPTIONS[0].value}
                  onChange={(e) => setEditingSlide({ ...editingSlide, badgeColor: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {BADGE_COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Slide Main Headline *</label>
              <input
                type="text"
                required
                value={editingSlide.headline}
                onChange={(e) => setEditingSlide({ ...editingSlide, headline: e.target.value })}
                placeholder="e.g. State-of-the-Art Science Labs, Robotics & Pre-Technical Workshops"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subtitle / Descriptive Paragraph *</label>
              <textarea
                rows={2}
                required
                value={editingSlide.subtitle}
                onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                placeholder="Details highlighting the features, values, curriculum, or facility..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-2">
                <label className="font-bold text-emerald-800 block">Primary Action Button (CTA)</label>
                <div>
                  <label className="text-[11px] text-slate-500 block">Button Text</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.ctaText}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                    placeholder="e.g. Enroll / Apply for Admission"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block">Target Link / Section Anchor</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.ctaLink}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaLink: e.target.value })}
                    placeholder="e.g. #admissions or #contact"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Secondary Button (Optional)</label>
                <div>
                  <label className="text-[11px] text-slate-500 block">Button Text</label>
                  <input
                    type="text"
                    value={editingSlide.secondaryText || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, secondaryText: e.target.value })}
                    placeholder="e.g. Explore CBC Curriculum"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block">Target Link / Section Anchor</label>
                  <input
                    type="text"
                    value={editingSlide.secondaryLink || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, secondaryLink: e.target.value })}
                    placeholder="e.g. #academics or #facilities"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingSlide.active !== false}
                  onChange={(e) => setEditingSlide({ ...editingSlide, active: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                />
                <span>Active and visible on public website carousel</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSlideModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Hero Slide</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
