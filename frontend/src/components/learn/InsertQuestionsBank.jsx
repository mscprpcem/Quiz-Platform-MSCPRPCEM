import React, { useState, useMemo } from 'react';
import {
  Code2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Database,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Layers,
  Terminal,
  Filter
} from 'lucide-react';
import { INSERT_QUESTIONS_DATA, INSERT_SECTIONS, DAY5_ECOMMERCE_SETUP_SQL } from '../../data/insertQuestionsData';

const PAGE_SIZE = 10;

export default function InsertQuestionsBank({ onJumpToPractice }) {
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedSolutions, setRevealedSolutions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedSetup, setCopiedSetup] = useState(false);

  // Toggle reveal solution for single question
  const toggleRevealSolution = (id) => {
    setRevealedSolutions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy SQL to clipboard
  const handleCopy = (sql, id) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy Setup SQL
  const handleCopySetup = () => {
    navigator.clipboard.writeText(DAY5_ECOMMERCE_SETUP_SQL);
    setCopiedSetup(true);
    setTimeout(() => setCopiedSetup(false), 2000);
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return INSERT_QUESTIONS_DATA.filter(q => {
      const matchSection = selectedSection === 'all' || q.section === selectedSection;
      const matchSearch = !searchQuery.trim() || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.sql.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.task && q.task.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSection && matchSearch;
    });
  }, [selectedSection, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const currentQuestions = filteredQuestions.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="space-y-8 animate-fadeIn text-slate-900">
      {/* 1. HERO HEADER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} className="text-blue-400" />
            <span>Day 5 Practice Masterclass</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            50 Practice Problems: INSERT & Bulk Data Ingestion
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Master write-side relational data manipulation across 8 comprehensive categories on the{' '}
            <code className="text-blue-300 font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded">ecommerce_day5_lab</code> database.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleCopySetup}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all backdrop-blur-xs cursor-pointer active:scale-95 shadow-sm"
            >
              {copiedSetup ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedSetup ? 'schema.sql Copied!' : 'Copy schema.sql Setup'}</span>
            </button>

            {onJumpToPractice && (
              <button
                onClick={() => onJumpToPractice('insert-01')}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Terminal size={14} />
                <span>Launch Interactive Practice Lab</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. FILTER CONTROLS & SEARCH */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search questions by task, keyword, column, or error code (e.g. 'batch', 'DEFAULT', 'ON DUPLICATE')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {INSERT_SECTIONS.map((sec) => {
            const isSelected = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setSelectedSection(sec.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Count Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredQuestions.length}</strong> matching questions
          </span>
          <span>
            Page <strong className="text-slate-800">{safePage}</strong> of{' '}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>
        </div>
      </div>

      {/* 3. QUESTIONS LIST */}
      <div className="space-y-4">
        {currentQuestions.map((q) => {
          const isRevealed = revealedSolutions[q.id];
          const isCopied = copiedId === q.id;

          const diffBadge =
            q.difficulty === 'Basic' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            q.difficulty === 'Easy' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            q.difficulty === 'Medium' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
            q.difficulty === 'Hard' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-rose-50 text-rose-700 border-rose-200';

          return (
            <div
              key={q.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all space-y-4"
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-[240px]">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      #{q.id}
                    </span>
                    <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${diffBadge}`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {q.sectionTitle}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 pt-1">
                    {q.question}
                  </h3>

                  {q.task && (
                    <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed">
                      <strong>Task: </strong>{q.task}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => toggleRevealSolution(q.id)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{isRevealed ? 'Hide Solution' : 'Reveal Solution'}</span>
                  </button>

                  {onJumpToPractice && q.challengeId && (
                    <button
                      onClick={() => onJumpToPractice(q.challengeId)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Terminal size={14} />
                      <span className="hidden sm:inline">Try in Lab</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Solution Code Block */}
              {isRevealed && (
                <div className="pt-3 border-t border-slate-100 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span className="flex items-center gap-1.5 text-blue-700">
                      <Code2 size={14} />
                      <span>Verified SQL Implementation</span>
                    </span>
                    <button
                      onClick={() => handleCopy(q.sql, q.id)}
                      className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                    >
                      {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 text-slate-100 font-mono text-xs font-semibold p-4 rounded-xl overflow-x-auto shadow-inner whitespace-pre leading-relaxed border border-slate-800">
                    {q.sql}
                  </div>

                  {q.explanation && (
                    <p className="text-xs text-slate-600 font-medium italic pt-1">
                      <strong>Architecture Takeaway: </strong>{q.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <Filter size={32} className="mx-auto text-slate-400" />
            <h3 className="text-base font-black text-slate-800">No matching questions found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search terms or select "All 50 Problems" to view the complete catalog.
            </p>
          </div>
        )}
      </div>

      {/* 4. PAGINATION FOOTER */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <button
            disabled={safePage <= 1}
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          <span className="text-xs font-bold text-slate-600">
            Page <strong className="text-blue-600">{safePage}</strong> of {totalPages}
          </span>

          <button
            disabled={safePage >= totalPages}
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
