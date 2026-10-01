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
import { FILTERING_QUESTIONS_DATA, FILTERING_SECTIONS } from '../../data/filteringQuestionsData';

const PAGE_SIZE = 10;

const EMPLOYEES_FILTERING_SETUP_SQL = `-- Create and populate employees table for Day 4 Advanced Filtering Practice
CREATE TABLE IF NOT EXISTS employees (
    emp_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    salary DECIMAL(10, 2),
    city VARCHAR(50),
    hire_date DATE
);

-- Seed comprehensive records (including NULLs, underscores, dates, palindromes)
INSERT INTO employees (emp_id, name, department, salary, city, hire_date) VALUES
  (1, 'Amit', 'IT', 60000, 'Mumbai', '2023-01-10'),
  (2, 'Ravi', 'HR', 40000, 'Pune', '2022-06-15'),
  (3, 'Sneha', 'IT', 70000, 'Delhi', '2023-01-28'),
  (4, 'Priya', 'Finance', 50000, 'Mumbai', '2021-03-20'),
  (5, 'Karan', 'HR', 45000, 'Delhi', '2023-02-01'),
  (6, 'Rahul', 'IT', 55000, 'Pune', '2022-11-05'),
  (7, 'Neha', 'HR', 48000, 'Mumbai', '2023-01-18'),
  (8, 'Arjun', 'Finance', 65000, 'Delhi', '2020-08-12'),
  (9, 'Meena', 'IT', 72000, 'Mumbai', '2022-12-01'),
  (10, 'Suresh', 'HR', 38000, NULL, '2021-09-14'),
  (11, 'Ananya', 'IT', 62000, 'Delhi', '2023-01-05'),
  (12, 'Pooja', 'Finance', NULL, 'Mumbai', '2022-04-18'),
  (13, 'Ekta', 'Marketing', 58000, 'Pune', '2023-03-01'),
  (14, 'Farhan', 'Finance', 64000, 'Bangalore', '2021-07-22'),
  (15, 'Amita', NULL, 53000, 'Delhi', '2023-01-31'),
  (16, 'Dev_Lead', 'IT', 85000, 'Bangalore', '2022-05-19'),
  (17, 'Nayan', 'HR', 52000, 'Mumbai', '2023-02-14');`;

export default function FilteringQuestionsBank({ onJumpToPractice }) {
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
    navigator.clipboard.writeText(EMPLOYEES_FILTERING_SETUP_SQL);
    setCopiedSetup(true);
    setTimeout(() => setCopiedSetup(false), 2000);
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return FILTERING_QUESTIONS_DATA.filter(q => {
      const matchSection = selectedSection === 'all' || q.section === selectedSection;
      const matchSearch = !searchQuery.trim() || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.sql.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSection && matchSearch;
    });
  }, [selectedSection, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filteredQuestions.length);
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const container = document.getElementById('filtering-questions-top');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <article id="filtering-questions-top" className="space-y-6 animate-fadeIn max-w-4xl mx-auto py-2">
      {/* ── HEADER ── */}
      <header className="space-y-4 pb-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xs shrink-0 font-black text-sm">
              <Filter size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-black tracking-wide border border-blue-100">
                  DAY 4 MASTERCLASS
                </span>
                <span className="text-xs font-bold text-slate-400">40 Questions (Basic to FAANG)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Day 4: 40 Advanced Filtering Questions Bank
              </h1>
            </div>
          </div>

          {/* Setup table quick copy button */}
          <button
            onClick={handleCopySetup}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            {copiedSetup ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Setup SQL Copied!</span>
              </>
            ) : (
              <>
                <Terminal size={14} className="text-blue-400" />
                <span>Copy Employees Setup Table</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Master WHERE clauses, pattern searches (LIKE), discrete sets (IN), range boundaries (BETWEEN), three-valued logic (NULL), and complex boolean thinking across 6 difficulty tiers.
        </p>
      </header>

      {/* ── FILTER CONTROLS ── */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions by keyword, clause, or column (e.g., BETWEEN, REGEXP, NULL, LIKE)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Section Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {FILTERING_SECTIONS.map((sec) => {
            const isActive = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setSelectedSection(sec.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── QUESTIONS LIST ── */}
      <div className="space-y-4">
        {paginatedQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <Lightbulb size={32} className="mx-auto text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">No questions found matching your filter</h3>
            <p className="text-xs text-slate-500">Try clearing the search query or switching to All Questions.</p>
          </div>
        ) : (
          paginatedQuestions.map((q) => {
            const isRevealed = !!revealedSolutions[q.id];
            const isCopied = copiedId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3.5"
              >
                {/* Question Header & Meta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 text-xs font-black flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
                      {q.id}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {q.sectionTitle}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {q.difficulty}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                        {q.question}
                      </h3>
                    </div>
                  </div>

                  {/* Actions: Practice in Lab */}
                  {onJumpToPractice && (
                    <button
                      onClick={() => onJumpToPractice(q.challengeId || 'custom')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold text-blue-600 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 transition-all flex items-center space-x-1 shrink-0 cursor-pointer shadow-2xs active:scale-95"
                    >
                      <span>Practice</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>

                {/* Business Context & Noob Developer Thinking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {q.businessScenario && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs leading-relaxed text-slate-700 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <span>🏢</span> Real-World Scenario
                      </span>
                      <p>{q.businessScenario}</p>
                    </div>
                  )}
                  {q.beginnerStepByStep && (
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs leading-relaxed text-amber-950 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <span>🐣</span> Beginner Step-by-Step Logic
                      </span>
                      <p className="whitespace-pre-line font-medium">{q.beginnerStepByStep}</p>
                    </div>
                  )}
                </div>

                {/* Solution Box */}
                {isRevealed ? (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span className="flex items-center space-x-1.5 text-emerald-600 font-bold">
                        <CheckCircle2 size={13} />
                        <span>Verified SQL Solution</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopy(q.sql, q.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer"
                        >
                          {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => toggleRevealSolution(q.id)}
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                          title="Hide solution"
                        >
                          <EyeOff size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0f172a] rounded-xl p-3 sm:p-4 text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto shadow-inner leading-relaxed select-text">
                      <pre>{q.sql}</pre>
                    </div>

                    {q.explanation && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-700">Rationale:</span> {q.explanation}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">
                      Try writing the query in your head or practice lab before viewing
                    </span>
                    <button
                      onClick={() => toggleRevealSolution(q.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Eye size={13} className="text-blue-600" />
                      <span>Reveal Solution</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── PAGINATION CONTROLS ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800 font-black">{startIndex + 1}–{endIndex}</strong> of{' '}
            <strong className="text-slate-800 font-black">{filteredQuestions.length}</strong> questions
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  p === safePage
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
