import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  GraduationCap,
  Award,
  CheckCircle2,
  Plus,
  BookMarked,
  FileCheck,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

interface SubjectArea {
  id: string;
  name: string;
  code: string;
  category: 'EYE' | 'PRIMARY' | 'JSS';
  periodsPerWeek: number;
  strands: { name: string; subStrands: string[] }[];
}

const INITIAL_CBC_AREAS: SubjectArea[] = [
  // Primary CBC
  {
    id: 'cbc-math',
    name: 'Mathematics Activities',
    code: 'MATH-101',
    category: 'PRIMARY',
    periodsPerWeek: 5,
    strands: [
      { name: 'Numbers', subStrands: ['Number Concept', 'Whole Numbers', 'Fractions', 'Addition & Subtraction'] },
      { name: 'Measurement', subStrands: ['Length', 'Mass', 'Capacity', 'Time', 'Money'] },
      { name: 'Geometry', subStrands: ['Lines', '2D Shapes', 'Patterns'] },
    ],
  },
  {
    id: 'cbc-eng',
    name: 'English Language Activities',
    code: 'ENG-102',
    category: 'PRIMARY',
    periodsPerWeek: 5,
    strands: [
      { name: 'Listening and Speaking', subStrands: ['Attentive Listening', 'Pronunciation', 'Conversations'] },
      { name: 'Reading', subStrands: ['Phonics', 'Fluency', 'Comprehension'] },
      { name: 'Writing', subStrands: ['Handwriting', 'Creative Composition', 'Punctuation'] },
    ],
  },
  {
    id: 'cbc-kisw',
    name: 'Kiswahili na Shughuli za Lugha',
    code: 'KISW-103',
    category: 'PRIMARY',
    periodsPerWeek: 4,
    strands: [
      { name: 'Kusikiliza na Kuzungumza', subStrands: ['Maamkizi na Mazungumzo', 'Matamshi Bora'] },
      { name: 'Kusoma', subStrands: ['Kusoma kwa Ufasaha', 'Ufahamu'] },
      { name: 'Kuandika', subStrands: ['Mwandiko Safi', 'Insha'] },
    ],
  },
  {
    id: 'cbc-sci',
    name: 'Science and Technology',
    code: 'SCI-104',
    category: 'PRIMARY',
    periodsPerWeek: 4,
    strands: [
      { name: 'Living Things', subStrands: ['Plants and Fungi', 'Animals', 'Human Body Systems'] },
      { name: 'Environment', subStrands: ['Weather', 'Soil and Water Conservation'] },
      { name: 'Digital Technology', subStrands: ['Computer Parts', 'Coding Basics', 'Safety Online'] },
    ],
  },
  {
    id: 'cbc-cre',
    name: 'Christian Religious Education (CRE)',
    code: 'CRE-105',
    category: 'PRIMARY',
    periodsPerWeek: 3,
    strands: [
      { name: 'Creation', subStrands: ['God our Creator', 'Caring for Creation'] },
      { name: 'The Holy Bible', subStrands: ['Bible Stories', 'Living in Harmony'] },
      { name: 'Life of Jesus Christ', subStrands: ['Early Life', 'Miracles and Teachings'] },
    ],
  },
  {
    id: 'cbc-creative',
    name: 'Creative Arts & Sports',
    code: 'ART-106',
    category: 'PRIMARY',
    periodsPerWeek: 4,
    strands: [
      { name: 'Visual Arts', subStrands: ['Drawing and Colouring', 'Pottery & Craft'] },
      { name: 'Music and Movement', subStrands: ['Singing Folk Songs', 'Musical Instruments'] },
      { name: 'Physical Education', subStrands: ['Athletics', 'Ball Games', 'Gymnastics'] },
    ],
  },

  // Junior Secondary (JSS Grade 7-9)
  {
    id: 'jss-int-sci',
    name: 'Integrated Science (JSS)',
    code: 'ISCI-201',
    category: 'JSS',
    periodsPerWeek: 5,
    strands: [
      { name: 'Scientific Investigation', subStrands: ['Laboratory Safety', 'Measurement Apparatus'] },
      { name: 'Mixtures and Elements', subStrands: ['Acids and Bases', 'Separation Techniques'] },
      { name: 'Energy & Waves', subStrands: ['Heat Transfer', 'Light and Sound'] },
    ],
  },
  {
    id: 'jss-pre-tech',
    name: 'Pre-Technical and Pre-Career Studies',
    code: 'PTECH-202',
    category: 'JSS',
    periodsPerWeek: 4,
    strands: [
      { name: 'Materials and Tools', subStrands: ['Woodwork', 'Metalwork', 'Technical Drawing'] },
      { name: 'Safety in the Workshop', subStrands: ['First Aid', 'Fire Safety Procedures'] },
      { name: 'Entrepreneurship Skills', subStrands: ['Business Opportunities', 'Financial Literacy'] },
    ],
  },
  {
    id: 'jss-soc',
    name: 'Social Studies & Citizenship',
    code: 'SOC-203',
    category: 'JSS',
    periodsPerWeek: 4,
    strands: [
      { name: 'The Physical Environment', subStrands: ['East African Topography', 'Climate Change'] },
      { name: 'Governance & Constitution', subStrands: ['Devolved Government', 'National Values'] },
      { name: 'Historical Heritage', subStrands: ['Early Man in Kenya', 'Traditional Leaders'] },
    ],
  },
  {
    id: 'jss-agri',
    name: 'Agriculture & Nutrition (JSS)',
    code: 'AGRI-204',
    category: 'JSS',
    periodsPerWeek: 4,
    strands: [
      { name: 'Crop Production', subStrands: ['Kitchen Gardens', 'Organic Farming'] },
      { name: 'Animal Rearing', subStrands: ['Poultry Keeping', 'Rabbit Production'] },
      { name: 'Food Nutrition & Preservation', subStrands: ['Balanced Diet', 'Food Storage'] },
    ],
  },
];

export const AcademicsModule: React.FC = () => {
  const [areas, setAreas] = useState<SubjectArea[]>(INITIAL_CBC_AREAS);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'EYE' | 'PRIMARY' | 'JSS'>('ALL');
  const [selectedArea, setSelectedArea] = useState<SubjectArea | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filtered = categoryFilter === 'ALL' ? areas : areas.filter((a) => a.category === categoryFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-serif text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            Kenyan CBC Curriculum & Learning Areas
          </h1>
          <p className="text-xs text-slate-500">
            Competency-Based Curriculum framework aligned with Kenya Institute of Curriculum Development (KICD) specifications.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              categoryFilter === 'ALL' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Disciplines
          </button>
          <button
            onClick={() => setCategoryFilter('PRIMARY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              categoryFilter === 'PRIMARY' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Primary (G1-6)
          </button>
          <button
            onClick={() => setCategoryFilter('JSS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              categoryFilter === 'JSS' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Junior Secondary (G7-9)
          </button>
        </div>
      </div>

      {/* Core Competencies Ribbon */}
      <div className="p-4 rounded-2xl bg-emerald-900 text-white shadow-xs">
        <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          7 KICD Core Competencies Integrated Across All Strands
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            'Communication & Collaboration',
            'Critical Thinking & Problem Solving',
            'Creativity & Imagination',
            'Citizenship & National Values',
            'Digital Literacy',
            'Learning to Learn',
            'Self-Efficacy',
          ].map((comp, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-emerald-800/80 text-emerald-100 font-medium border border-emerald-700/50 text-[11px]"
            >
              ★ {comp}
            </span>
          ))}
        </div>
      </div>

      {/* Learning Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((area) => (
          <div
            key={area.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-500">{area.code}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    area.category === 'JSS'
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {area.category === 'JSS' ? 'Junior Sec' : 'Primary CBC'}
                </span>
              </div>

              <h2 className="text-sm font-bold text-slate-900 mb-1">{area.name}</h2>
              <p className="text-xs text-slate-500 mb-3">{area.periodsPerWeek} Lesson Periods per week</p>

              {/* Strands Preview */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Curriculum Strands</p>
                <div className="space-y-1">
                  {area.strands.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {area.strands.reduce((acc, s) => acc + s.subStrands.length, 0)} Sub-strands
              </span>
              <button
                onClick={() => {
                  setSelectedArea(area);
                  setIsDetailModalOpen(true);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>View Strands</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedArea && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`CBC Syllabus Breakdown: ${selectedArea.name} (${selectedArea.code})`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
              <div>
                <p className="text-emerald-950 font-bold">{selectedArea.name}</p>
                <p className="text-emerald-800 text-[11px]">{selectedArea.periodsPerWeek} Weekly Teaching Periods</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-xs">
                KICD Approved
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Strands & Assessment Sub-strands
              </h3>

              {selectedArea.strands.map((strand, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">{strand.name}</h4>
                  </div>

                  <div className="pl-7 grid grid-cols-2 gap-2">
                    {strand.subStrands.map((sub, sIdx) => (
                      <div key={sIdx} className="p-2 bg-white rounded-lg border border-slate-100 text-[11px] text-slate-700 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
