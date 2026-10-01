import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Copy, Check, Table, CheckCircle2, ChevronRight,
  ChevronUp, ChevronDown, ArrowRight, ArrowLeft, Lightbulb, Code2, Menu, X, Maximize2,
  Server, Layers, ShieldCheck, Database, AlertTriangle, Shield, Zap, FileText,
  Download, ExternalLink, Laptop, Clock, Sparkles
} from 'lucide-react';
import { TOTAL_TOPICS_COUNT } from '../data/sqlCurriculumData';
import { 
  CHAPTER_CATALOG, 
  ALL_TOPIC_DETAILS, 
  getChapterMetadata, 
  isChapterAvailable 
} from '../data/chapters';
import ChapterComingSoon from '../components/learn/ChapterComingSoon';
import ComparisonTable from '../components/learn/ComparisonTable';
import DdlQuestionsBank from '../components/learn/DdlQuestionsBank';
import DmlQuestionsBank from '../components/learn/DmlQuestionsBank';
import FilteringQuestionsBank from '../components/learn/FilteringQuestionsBank';
import NullLogicGuide from '../components/learn/NullLogicGuide';

/**
 * SQL Syntax Colorizer
 * Highlights SQL keywords, data types, numbers, strings, comments, and identifiers on modern dark IDE background
 */
function HighlightedSql({ code }) {
  if (!code) return null;

  const lines = code.split('\n');

  return (
    <div className="font-mono text-[12px] sm:text-[13px] leading-relaxed select-text">
      {lines.map((line, lineIdx) => {
        // Handle comment line
        if (line.trim().startsWith('--') || line.trim().startsWith('/*') || line.trim().startsWith('#')) {
          return (
            <div key={lineIdx} className="text-slate-400 italic font-medium">
              {line}
            </div>
          );
        }

        // Tokenize line with regex
        const tokens = line.split(/(\b(?:CREATE\s+TABLE|CREATE\s+DATABASE|ALTER\s+TABLE|DROP\s+TABLE|TRUNCATE\s+TABLE|RENAME\s+TABLE|PRIMARY\s+KEY|FOREIGN\s+KEY|REFERENCES|NOT\s+NULL|UNIQUE|DEFAULT|CHECK|TRUE|FALSE|SELECT|FROM|WHERE|ORDER\s+BY|GROUP\s+BY|HAVING|LIMIT|OFFSET|JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|DESC|ASC|ADD\s+COLUMN|DROP\s+COLUMN|RENAME\s+COLUMN|RENAME\s+TO|MODIFY\s+COLUMN|CHANGE\s+COLUMN|INSERT\s+INTO|UPDATE|DELETE|SET|VALUES|COMMIT|ROLLBACK|SAVEPOINT|START\s+TRANSACTION|GRANT|REVOKE|SHOW\s+DATABASES|SHOW\s+TABLES|DESCRIBE|USE|VERSION|CURRENT_TIMESTAMP|USER|DATABASE|LIKE|NOT\s+LIKE|IN|NOT\s+IN|BETWEEN|NOT\s+BETWEEN|IS\s+NULL|IS\s+NOT\s+NULL|AND|OR|REGEXP|ESCAPE|INT|INTEGER|VARCHAR|DECIMAL|DATE|BOOLEAN|TEXT|FLOAT|DOUBLE|BIGINT|TIMESTAMP)\b|'[^']*'|\d+(?:\.\d+)?|[(),;]|\[constraints\]|\bdatatype\b|\btable_name\b|\bcolumn\d+\b|\bdatabase_name\b)/gi);

        return (
          <div key={lineIdx}>
            {tokens.map((token, tIdx) => {
              if (!token) return null;
              const upper = token.toUpperCase();

              // SQL Keywords
              if (
                ['CREATE TABLE', 'CREATE DATABASE', 'ALTER TABLE', 'DROP TABLE', 'TRUNCATE TABLE', 'RENAME TABLE',
                 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'NOT NULL', 'UNIQUE', 'DEFAULT', 'CHECK', 'TRUE', 'FALSE',
                 'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
                 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'DESC', 'ASC',
                 'ADD COLUMN', 'DROP COLUMN', 'RENAME COLUMN', 'RENAME TO', 'MODIFY COLUMN', 'CHANGE COLUMN',
                 'INSERT INTO', 'UPDATE', 'DELETE', 'SET', 'VALUES', 'COMMIT', 'ROLLBACK', 'SAVEPOINT',
                 'START TRANSACTION', 'GRANT', 'REVOKE', 'SHOW DATABASES', 'SHOW TABLES', 'DESCRIBE', 'USE',
                 'VERSION', 'CURRENT_TIMESTAMP', 'USER', 'DATABASE',
                 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'BETWEEN', 'NOT BETWEEN', 'IS NULL', 'IS NOT NULL',
                 'AND', 'OR', 'REGEXP', 'ESCAPE'].includes(upper)
              ) {
                return (
                  <span key={tIdx} className="text-blue-400 font-black">
                    {token}
                  </span>
                );
              }

              // SQL Data Types
              if (['INT', 'INTEGER', 'VARCHAR', 'DECIMAL', 'DATE', 'BOOLEAN', 'TEXT', 'FLOAT', 'DOUBLE', 'BIGINT', 'TIMESTAMP'].includes(upper)) {
                return (
                  <span key={tIdx} className="text-purple-400 font-bold">
                    {token}
                  </span>
                );
              }

              // Placeholder syntax tags
              if (token.toLowerCase() === 'datatype') {
                return (
                  <span key={tIdx} className="text-teal-300 font-medium">
                    {token}
                  </span>
                );
              }
              if (token.toLowerCase() === '[constraints]') {
                return (
                  <span key={tIdx} className="text-slate-400 font-medium">
                    {token}
                  </span>
                );
              }

              // Strings
              if (token.startsWith("'") && token.endsWith("'")) {
                return (
                  <span key={tIdx} className="text-emerald-300 font-medium">
                    {token}
                  </span>
                );
              }

              // Numbers
              if (/^\d+(?:\.\d+)?$/.test(token)) {
                return (
                  <span key={tIdx} className="text-amber-400 font-bold">
                    {token}
                  </span>
                );
              }

              // Punctuation
              if (['(', ')', ',', ';'].includes(token)) {
                return (
                  <span key={tIdx} className="text-slate-400 font-bold">
                    {token}
                  </span>
                );
              }

              return (
                <span key={tIdx} className="text-slate-200 font-normal">
                  {token}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function CodeBlock({ code, title = 'SQL', language = 'sql', onCopy, isCopied }) {
  if (!code) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md my-4">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 select-none">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-300 tracking-wide">
            {title}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            {language}
          </span>
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center space-x-1 text-[11px] font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span className={isCopied ? 'text-emerald-400 font-bold' : ''}>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <div className="p-4 sm:p-5 overflow-x-auto text-[13px] leading-relaxed">
        <HighlightedSql code={code} />
      </div>
    </div>
  );
}

export default function SqlLearningView({
  selectedModuleId = 'mod-01',
  setSelectedModuleId,
  selectedTopicId = 'top-01-01',
  setSelectedTopicId,
  completedTopics = [],
  onToggleCompleted,
  onJumpToPractice,
  onBackToOverview
}) {
  const [copiedSection, setCopiedSection] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedZoomImage, setSelectedZoomImage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedZoomImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active topic state (defaults to top-01-01)
  const [currentActiveTopicId, setCurrentActiveTopicId] = useState(selectedTopicId || 'top-01-01');

  // Synchronized completed topics
  const [localCompletedTopics, setLocalCompletedTopics] = useState(() => {
    if (completedTopics && completedTopics.length > 0) return completedTopics;
    try {
      const saved = localStorage.getItem('msc_sql_completed_topics');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (completedTopics && completedTopics.length > 0) {
      setLocalCompletedTopics(completedTopics);
    }
  }, [completedTopics]);

  useEffect(() => {
    if (selectedTopicId) {
      setCurrentActiveTopicId(selectedTopicId);
    }
  }, [selectedTopicId]);

  useEffect(() => {
    if (selectedModuleId) {
      setExpandedModules((prev) => ({ ...prev, [selectedModuleId]: true }));
    }
  }, [selectedModuleId]);

  // Accordion state for modules
  const [expandedModules, setExpandedModules] = useState({
    'mod-01': true, // Fundamentals expanded by default
    'mod-02': true  // DDL expanded by default
  });

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const handleSelectTopic = (topId, modId = 'mod-01') => {
    setCurrentActiveTopicId(topId);
    if (setSelectedTopicId) setSelectedTopicId(topId);
    if (setSelectedModuleId) setSelectedModuleId(modId);
    setMobileMenuOpen(false);
  };

  const handleToggleRead = (topId) => {
    const targetId = topId || currentActiveTopicId;
    if (onToggleCompleted) {
      onToggleCompleted(targetId);
    }
    setLocalCompletedTopics((prev) => {
      const next = prev.includes(targetId) ? prev.filter(t => t !== targetId) : [...prev, targetId];
      try {
        localStorage.setItem('msc_sql_completed_topics', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Active chapter metadata and live status
  const activeChapter = useMemo(() => {
    return getChapterMetadata(selectedModuleId || 'mod-01');
  }, [selectedModuleId]);

  const isChapterLive = activeChapter.status === 'available';

  // Active topic data
  const topicData = useMemo(() => {
    if (ALL_TOPIC_DETAILS[currentActiveTopicId]) {
      return ALL_TOPIC_DETAILS[currentActiveTopicId];
    }
    // Fallback to first available topic in chapter or default
    if (activeChapter.topics && activeChapter.topics.length > 0) {
      const firstId = activeChapter.topics[0].id;
      if (ALL_TOPIC_DETAILS[firstId]) return ALL_TOPIC_DETAILS[firstId];
    }
    return ALL_TOPIC_DETAILS['top-01-01'] || ALL_TOPIC_DETAILS['top-create-table'];
  }, [currentActiveTopicId, activeChapter]);

  const isCurrentTopicRead = localCompletedTopics.includes(topicData.id);
  const totalTopicsCount = TOTAL_TOPICS_COUNT || 66;
  const progressPercent = Math.min(100, Math.round((localCompletedTopics.length / totalTopicsCount) * 100));

  const handleCopyCode = (code, sectionKey) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Prevent duplicate window scrollbar while in full-height learning view
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  return (
    <div
      style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}
      className="w-full h-[calc(100vh-64px)] flex font-segoe text-slate-800 bg-white overflow-hidden"
    >
      {/* =========================================================================
          LEFT SIDEBAR: CURRICULUM SYLLABUS (MODULAR CHAPTERS + COMING SOON BUTTONS)
         ========================================================================= */}
      <aside className="w-80 border-r border-slate-200/90 bg-white flex flex-col shrink-0 h-full select-none z-10 shadow-xs hidden lg:flex">
        
        {/* ── TOP HEADER: Reading Progress ── */}
        <div className="p-4 border-b border-slate-100 space-y-1.5 shrink-0">

          {/* Overall Reading Progress bar */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-600">Reading Progress</span>
              <span className="text-blue-600 font-mono font-black">{localCompletedTopics.length} completed</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── MIDDLE: Scrollable Module & Topic List ── */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 custom-scrollbar">
          {CHAPTER_CATALOG.map((mod) => {
            const isExpanded = expandedModules[mod.id] !== false;
            const isAvailable = mod.status === 'available';
            const isSelected = selectedModuleId === mod.id;

            if (!isAvailable) {
              return (
                <div key={mod.id} className="pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModuleId && setSelectedModuleId(mod.id);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-black flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/90 border border-amber-200 text-amber-950 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-500 flex items-center justify-center shrink-0">
                        {mod.number}
                      </span>
                      <span className="truncate">
                        {mod.shortTitle || mod.title}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100/90 border border-amber-300 text-amber-900 rounded-lg text-[10px] font-extrabold tracking-wide shrink-0 shadow-2xs">
                      Coming Soon
                    </span>
                  </button>
                </div>
              );
            }

            return (
              <div key={mod.id} className="pb-2 mb-1 border-b border-slate-200/80 last:border-b-0 last:mb-0 last:pb-0">
                {/* Available Chapter Header */}
                <button
                  type="button"
                  onClick={() => {
                    toggleModule(mod.id);
                    setSelectedModuleId && setSelectedModuleId(mod.id);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-black flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 text-indigo-950 font-black border border-indigo-200/80'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 border border-slate-200 text-slate-700'
                    }`}>
                      {mod.number}
                    </span>
                    <span className="truncate">
                      {mod.title}
                    </span>
                  </div>

                  {isExpanded ? (
                    <ChevronUp size={15} className="text-indigo-600 shrink-0 ml-1.5" strokeWidth={2.2} />
                  ) : (
                    <ChevronRight size={15} className="text-slate-400 shrink-0 ml-1.5" strokeWidth={2.2} />
                  )}
                </button>

                {isExpanded && mod.topics && (
                  <div className="ml-3 pl-2.5 border-l-2 border-slate-200/80 space-y-0.5 pt-1 pb-1">
                    {mod.topics.map((t, idx) => {
                      const isTopicSelected = currentActiveTopicId === t.id && isAvailable;
                      const isCompleted = localCompletedTopics.includes(t.id);

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTopic(t.id, mod.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer leading-snug ${
                            isTopicSelected
                              ? 'bg-blue-50 text-blue-700 font-black border border-blue-200/80 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            {isCompleted ? (
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                            ) : (
                              <span className={`text-[10px] font-mono font-bold shrink-0 px-1.5 py-0.5 rounded ${
                                isTopicSelected ? 'bg-blue-200/80 text-blue-900 font-black' : 'text-slate-500 bg-slate-100'
                              }`}>
                                {t.lessonCode || `${mod.number}.${idx + 1}`}
                              </span>
                            )}
                            <span className="truncate">{t.title}</span>
                          </div>
                          {isCompleted && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-xs shrink-0">Done</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── BOTTOM: Practice Playground Shortcut Card ── */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-xs border border-indigo-100 shrink-0">
              <Lightbulb size={15} />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Need to practice?</div>
              <div className="text-[10px] text-slate-500 font-medium">Try SQL challenges in the engine</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onJumpToPractice && onJumpToPractice(topicData)}
            className="w-full py-1.5 bg-white hover:bg-slate-50 text-indigo-600 font-black text-xs rounded-xl border border-indigo-200/80 shadow-2xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <span className="font-mono text-xs font-bold">{`</>`}</span>
            <span>Open Practice Lab</span>
          </button>
        </div>

      </aside>

      {/* =========================================================================
          RIGHT MAIN CONTENT: SCROLLABLE WORKSPACE
         ========================================================================= */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-white">
        
        {/* ── MOBILE TOP BAR (<1024px) ── */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs active:scale-95"
          >
            <BookOpen size={14} className="text-blue-600" />
            <span>Course Syllabus</span>
            <ChevronRight size={12} className="text-slate-400" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
            <span className="text-[11px] font-mono text-blue-600 font-black">
              {progressPercent}% Done
            </span>
          </div>
        </div>

        {/* ── MAIN SCROLLABLE CONTENT ── */}
        <main className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          {!isChapterLive ? (
            <div className="py-8 px-4 sm:px-8">
              <ChapterComingSoon
                chapter={activeChapter}
                onSelectChapter={(modId) => {
                  setSelectedModuleId && setSelectedModuleId(modId);
                  const targetMod = CHAPTER_CATALOG.find(m => m.id === modId);
                  if (targetMod?.topics?.[0]) {
                    handleSelectTopic(targetMod.topics[0].id, modId);
                  }
                }}
                onJumpToPractice={onJumpToPractice}
              />
            </div>
          ) : topicData.isQuestionsBankTopic ? (
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-8">
              {topicData.questionBankType === 'dml' ? (
                <DmlQuestionsBank onJumpToPractice={onJumpToPractice} />
              ) : topicData.questionBankType === 'filtering' ? (
                <FilteringQuestionsBank onJumpToPractice={onJumpToPractice} />
              ) : (
                <DdlQuestionsBank onJumpToPractice={onJumpToPractice} />
              )}
            </div>
          ) : (
            <article className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-8 sm:py-10 space-y-10 animate-fadeIn text-slate-900">

              {/* 1. TOPIC HEADER */}
              <div>
                <header className="space-y-3.5 pb-6 border-b border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-black tracking-wide shadow-xs">
                        {topicData.chapterNumber !== undefined && topicData.lessonNumber !== undefined
                          ? `Chapter ${topicData.chapterNumber} • Lesson ${topicData.lessonNumber}`
                          : (activeChapter?.title || 'SQL Topic')}
                      </span>
                      {topicData.lessonCode && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
                          {topicData.lessonCode}
                        </span>
                      )}
                    </div>

                    {/* MARK AS COMPLETED BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleToggleRead(topicData.id)}
                      className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
                        isCurrentTopicRead
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 font-extrabold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border-slate-200'
                      }`}
                    >
                      <CheckCircle2
                        size={15}
                        className={isCurrentTopicRead ? 'text-emerald-600' : 'text-slate-400'}
                        strokeWidth={isCurrentTopicRead ? 2.5 : 2}
                      />
                      <span>{isCurrentTopicRead ? 'Completed' : 'Mark as Read'}</span>
                    </button>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    {topicData.title}
                  </h1>

                  {topicData.subtitle && (
                    <p className="text-base sm:text-lg text-slate-600 font-medium leading-normal">
                      {topicData.subtitle}
                    </p>
                  )}

                  {topicData.intro && (
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed pt-1">
                      {topicData.intro}
                    </p>
                  )}
                </header>
              </div>

              {/* 2. INFOGRAPHIC IMAGE (Visual Guide for Beginners) */}
              {topicData.infographicImage && (
                <figure className="space-y-3 my-8">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center space-x-2 text-slate-800">
                      <BookOpen size={16} className="text-blue-600" />
                      <span className="text-sm sm:text-base font-black">
                        {topicData.infographicTitle || 'Visual Architecture & Flow Diagram'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedZoomImage(topicData.infographicImage)}
                        className="text-[11px] font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-full border border-slate-200 hover:border-blue-200 transition-all flex items-center space-x-1 cursor-pointer"
                        title="Click to view full screen"
                      >
                        <Maximize2 size={12} />
                        <span>Zoom</span>
                      </button>
                      <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                        Visual Guide
                      </span>
                    </div>
                  </div>

                  {/* Seamless Card - perfectly matching image dimensions with zero letterbox padding */}
                  <div 
                    onClick={() => setSelectedZoomImage(topicData.infographicImage)}
                    className="w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white relative group cursor-zoom-in transition-all duration-300 hover:shadow-md hover:border-blue-300"
                  >
                    <img
                      src={topicData.infographicImage}
                      alt={topicData.infographicTitle || 'Visual Architecture & Flow Diagram'}
                      className="w-full h-auto block rounded-2xl transition-transform duration-300 group-hover:scale-[1.006]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none rounded-2xl flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/85 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl backdrop-blur-xs flex items-center space-x-1.5 shadow-lg">
                        <Maximize2 size={13} />
                        <span>Click to expand full size</span>
                      </span>
                    </div>
                  </div>

                  {topicData.infographicCaption && (
                    <figcaption className="text-xs text-slate-500 font-medium italic pt-1 text-center sm:text-left">
                      {topicData.infographicCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* 2.5 CUSTOM INTERACTIVE CODE COMPONENT (e.g. NullLogicGuide) */}
              {(topicData.customComponent === 'NullLogicGuide' || topicData.id === 'top-05-04') && (
                <section className="my-8 animate-fadeIn">
                  <NullLogicGuide />
                </section>
              )}

              {/* 2.6 NOOB DEVELOPER MENTAL MODEL (Explain Like I'm 5) */}
              {topicData.beginnerMentalModel && (
                <section className="my-8 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-yellow-50/70 border-2 border-amber-300/80 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center space-x-2.5 pb-3 border-b border-amber-200/80">
                    <span className="text-2xl">🐣</span>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
                        {topicData.beginnerMentalModel.title || "Noob Developer's Mental Model"}
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 uppercase tracking-wide">
                          ELI5 • Simple & Visual
                        </span>
                      </h3>
                      <p className="text-xs text-amber-800/90 font-medium">
                        Think of it this way so you never get confused in real code or technical interviews!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    {topicData.beginnerMentalModel.analogy && (
                      <div className="bg-white/85 border border-amber-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                          <span>💡</span> Real-World Analogy
                        </span>
                        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium">
                          {topicData.beginnerMentalModel.analogy}
                        </p>
                      </div>
                    )}
                    {topicData.beginnerMentalModel.keyTrick && (
                      <div className="bg-white/85 border border-emerald-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <span>🎯</span> Beginner Cheat Code
                        </span>
                        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium">
                          {topicData.beginnerMentalModel.keyTrick}
                        </p>
                      </div>
                    )}
                    {topicData.beginnerMentalModel.gotcha && (
                      <div className="bg-white/85 border border-rose-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                        <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                          <span>⚠️</span> The Trap That Tricks Noobs
                        </span>
                        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium">
                          {topicData.beginnerMentalModel.gotcha}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 3. ARCHITECTURAL COMPARISON MATRIX (Generic & Dynamic) */}
              {topicData.comparisonTable && (
                <section className="pt-6 border-t border-slate-100">
                  <ComparisonTable comparison={topicData.comparisonTable} />
                </section>
              )}

              {/* 4. WHY DO WE NEED AN RDBMS (ACID Properties) */}
              {topicData.whyWeNeedItSection && (
                <section className="pt-8 border-t border-slate-100 space-y-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                      <Shield size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900">
                        {topicData.whyWeNeedItSection.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        {topicData.whyWeNeedItSection.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {topicData.whyWeNeedItSection.intro}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 pt-2">
                    {topicData.whyWeNeedItSection.acidPillars.map((pillar) => {
                      const isA = pillar.letter === 'A';
                      const isC = pillar.letter === 'C';
                      const isI = pillar.letter === 'I';

                      const borderCol = isA ? 'border-blue-200/90 hover:border-blue-400' :
                                        isC ? 'border-emerald-200/90 hover:border-emerald-400' :
                                        isI ? 'border-indigo-200/90 hover:border-indigo-400' :
                                        'border-purple-200/90 hover:border-purple-400';

                      const topBarCol = isA ? 'bg-blue-600' :
                                        isC ? 'bg-emerald-600' :
                                        isI ? 'bg-indigo-600' :
                                        'bg-purple-600';

                      const badgeBg = isA ? 'bg-blue-600 text-white' :
                                      isC ? 'bg-emerald-600 text-white' :
                                      isI ? 'bg-indigo-600 text-white' :
                                      'bg-purple-600 text-white';

                      const mottoBg = isA ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      isC ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      isI ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                      'bg-purple-50 text-purple-700 border-purple-200';

                      return (
                        <div
                          key={pillar.letter}
                          className={`bg-white border ${borderCol} rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden`}
                        >
                          {/* Top Accent Strip */}
                          <div className={`absolute top-0 left-0 right-0 h-1.5 ${topBarCol}`} />

                          <div className="space-y-3 pt-2">
                            {/* Card Top Row: Pillar Letter & Motto Badge */}
                            <div className="flex items-center justify-between">
                              <span className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shadow-xs ${badgeBg}`}>
                                {pillar.letter}
                              </span>

                              {pillar.motto && (
                                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border whitespace-nowrap ${mottoBg}`}>
                                  {pillar.motto}
                                </span>
                              )}
                            </div>

                            {/* Card Title */}
                            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                              {pillar.name}
                            </h3>

                            {/* Card Description with consistent height */}
                            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal min-h-[64px]">
                              {pillar.desc}
                            </p>
                          </div>

                          {/* Production Example Box at bottom with matching height */}
                          {pillar.example && (
                            <div className="pt-3 border-t border-slate-100 mt-4 space-y-1.5">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Production Example:
                              </span>
                              <div className="text-[11px] text-slate-700 font-medium leading-relaxed bg-slate-50 border-l-3 border-slate-300 rounded-r-lg p-2.5 min-h-[76px] flex items-center">
                                {pillar.example}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 5. STRUCTURAL HIERARCHY DEFINITIONS (Table, Row, Column, Cell) */}
              {topicData.structuralDefinitions && (
                <section className="pt-8 border-t border-slate-100 space-y-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                      <Layers size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900">
                        The 6 Core Structural Layers
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        From physical database container down to an atomic data cell
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                    {topicData.structuralDefinitions.map((t) => (
                      <div
                        key={t.term}
                        className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between min-h-[110px]"
                      >
                        <span className="text-sm font-black text-slate-900 block">
                          {t.term}
                        </span>
                        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                          {t.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 6. SQL COMMAND TYPES GRID (DDL, DML, DQL, DCL, TCL) */}
              {topicData.commandTypesGrid && (
                <section className="pt-8 border-t border-slate-100 space-y-5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                      <Code2 size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900">
                        The 5 SQL Command Families (DDL, DML, DQL, DCL, TCL)
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Comprehensive classification, operational scope, and transaction behavior
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                    {topicData.commandTypesGrid.map((cmd) => (
                      <div
                        key={cmd.category}
                        className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4.5 flex flex-col justify-between space-y-3.5 shadow-xs hover:border-slate-300 transition-all"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wide ${
                                cmd.category === 'DDL'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : cmd.category === 'DML'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : cmd.category === 'DQL'
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                  : cmd.category === 'DCL'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-purple-100 text-purple-800 border border-purple-200'
                              }`}
                            >
                              {cmd.category}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                              {cmd.target}
                            </span>
                          </div>

                          <div>
                            <div className="text-xs sm:text-[13px] font-black text-slate-900">
                              {cmd.fullForm}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                              {cmd.purpose}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {cmd.commands.map((c) => (
                              <span
                                key={c}
                                className="font-mono text-[11px] font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded-md shadow-2xs"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-500">Rollback via TCL:</span>
                            <span
                              className={`font-black ${
                                cmd.category === 'DML' ? 'text-emerald-600' : 'text-slate-700'
                              }`}
                            >
                              {cmd.rollback}
                            </span>
                          </div>
                          <div className="font-mono text-[11px] font-bold bg-slate-900 text-slate-100 p-2.5 rounded-lg overflow-x-auto whitespace-pre">
                            {cmd.example}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 7. OS DOWNLOAD PANELS (Windows & macOS) */}
              {topicData.osDownloadPanels && (
                <section className="pt-8 border-t border-slate-100 space-y-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                      <Download size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900">
                        Official Downloads Matrix (Windows & macOS)
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Direct official Oracle links for MySQL Server 8.0 & MySQL Workbench
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    {/* WINDOWS CARD */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full border border-blue-100">
                            {topicData.osDownloadPanels.windows.osName}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                            {topicData.osDownloadPanels.windows.badge}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          {topicData.osDownloadPanels.windows.packageTitle}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                          {topicData.osDownloadPanels.windows.stepsOverview}
                        </p>
                      </div>

                      <a
                        href={topicData.osDownloadPanels.windows.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-all text-center cursor-pointer active:scale-95"
                      >
                        <Download size={14} />
                        <span>Download Windows Installer (MSI)</span>
                        <ExternalLink size={12} className="opacity-80" />
                      </a>
                    </div>

                    {/* MACOS CARD */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-700 bg-slate-100 px-3 py-0.5 rounded-full border border-slate-200">
                            {topicData.osDownloadPanels.macos.osName}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            {topicData.osDownloadPanels.macos.badge}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          {topicData.osDownloadPanels.macos.packageTitle}
                        </h3>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            Or via Terminal (Homebrew):
                          </span>
                          <div className="bg-slate-900 text-slate-200 font-mono text-xs font-bold p-3 rounded-xl overflow-x-auto whitespace-pre shadow-xs">
                            {topicData.osDownloadPanels.macos.brewCommand}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        <a
                          href={topicData.osDownloadPanels.macos.serverLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-black text-xs shadow-xs transition-all text-center"
                        >
                          <Download size={13} />
                          <span>Server DMG</span>
                          <ExternalLink size={11} />
                        </a>
                        <a
                          href={topicData.osDownloadPanels.macos.workbenchLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-all text-center"
                        >
                          <Download size={13} />
                          <span>Workbench</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 8. STEP-BY-STEP SETUP GUIDE */}
              {topicData.setupGuide && (
                <section className="pt-8 border-t border-slate-100 space-y-6">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                      <Laptop size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900">
                        Step-by-Step Installation Walkthrough
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Follow these 5 steps to get MySQL Server and Workbench running locally
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 ml-3 sm:ml-4 pt-1">
                    {topicData.setupGuide.map((stepItem) => (
                      <div key={stepItem.step} className="relative space-y-2.5">
                        <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center absolute -left-[37px] sm:-left-[45px] top-0 shadow-xs ring-4 ring-white">
                          {stepItem.step}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 pt-0.5">
                          {stepItem.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {stepItem.description}
                        </p>

                        {stepItem.code && (
                          <CodeBlock
                            code={stepItem.code}
                            title={`Step ${stepItem.step} SQL Script`}
                            onCopy={() => handleCopyCode(stepItem.code, `step-${stepItem.step}`)}
                            isCopied={copiedSection === `step-${stepItem.step}`}
                          />
                        )}

                        {stepItem.tip && (
                          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-amber-950 font-medium">
                            <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>Pro Tip: </strong>{stepItem.tip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 9. UNDER THE HOOD DATABASE ENGINE INTERNALS */}
              {topicData.underTheHood && (
                <section className="pt-8 border-t border-slate-100 space-y-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                      <Server size={16} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900">
                        {topicData.underTheHood.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        What physically happens inside MySQL Engine, System Catalog, and Disk Storage
                      </p>
                    </div>
                  </div>

                  {topicData.underTheHood.summary && (
                    <p className="text-sm text-slate-700 leading-relaxed font-normal">
                      {topicData.underTheHood.summary}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                    {topicData.underTheHood.steps.map((st) => (
                      <div
                        key={st.step}
                        className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start space-x-3">
                            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                              {st.step}
                            </div>
                            <h3 className="text-sm font-black text-slate-900 leading-snug">
                              {st.title}
                            </h3>
                          </div>
                          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal pt-1">
                            {st.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 10. STEP-BY-STEP SQL QUERIES & ARCHITECTURE */}
              {topicData.sqlSteps && topicData.sqlSteps.length > 0 ? (
                <section className="pt-8 border-t border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                        <Code2 size={18} />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                          Step-by-Step SQL Queries & Execution Guide
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                          Each query is broken down into an isolated step with execution rationale, syntax breakdown, and dark IDE formatting
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hidden sm:inline-block">
                      {topicData.sqlSteps.length} Steps
                    </span>
                  </div>

                  <div className="space-y-6">
                    {topicData.sqlSteps.map((st) => (
                      <div
                        key={st.step}
                        className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
                      >
                        {/* Step Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                              {st.step}
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                              {st.title}
                            </h3>
                          </div>
                          {st.badge && (
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 shrink-0">
                              {st.badge}
                            </span>
                          )}
                        </div>

                        {st.explanation && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                            {st.explanation}
                          </p>
                        )}

                        {(st.code || st.sql) && (
                          <CodeBlock
                            code={st.code || st.sql}
                            title={`Step ${st.step || st.stepNumber}: SQL Implementation`}
                            onCopy={() => handleCopyCode(st.code || st.sql, `step-sql-${st.step || st.stepNumber}`)}
                            isCopied={copiedSection === `step-sql-${st.step || st.stepNumber}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                /* Fallback if topic only has syntax or example */
                <>
                  {topicData.syntax && (
                    <section className="pt-8 border-t border-slate-100 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Code2 size={18} className="text-blue-600" />
                        <h2 className="text-lg sm:text-xl font-black text-slate-900">
                          Syntax Specification
                        </h2>
                      </div>
                      <CodeBlock
                        code={topicData.syntax}
                        title="SQL Syntax Definition"
                        onCopy={() => handleCopyCode(topicData.syntax, 'syntax')}
                        isCopied={copiedSection === 'syntax'}
                      />
                    </section>
                  )}

                  {topicData.example && (
                    <section className="pt-8 border-t border-slate-100 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={18} className="text-emerald-600" />
                        <h2 className="text-lg sm:text-xl font-black text-slate-900">
                          Practical Working Example
                        </h2>
                      </div>
                      <CodeBlock
                        code={topicData.example}
                        title="Production Example"
                        onCopy={() => handleCopyCode(topicData.example, 'example')}
                        isCopied={copiedSection === 'example'}
                      />
                    </section>
                  )}
                </>
              )}

              {/* 11. ARCHITECTURAL NOTE */}
              {topicData.note && (
                <aside className="my-6 bg-amber-50/60 border-l-4 border-amber-500 rounded-r-xl p-4 sm:p-5 flex items-start space-x-3 text-xs sm:text-sm leading-relaxed text-amber-950 shadow-xs">
                  <Lightbulb size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-black text-amber-900 uppercase tracking-wider text-xs block">
                      Architectural Note
                    </span>
                    <p className="font-medium text-slate-800">{topicData.note}</p>
                  </div>
                </aside>
              )}

              {/* 12. COMMON BEGINNER MISTAKES */}
              {topicData.mistakes && topicData.mistakes.length > 0 && (
                <section className="pt-8 border-t border-slate-100 space-y-4">
                  <div className="flex items-center space-x-2 text-rose-800 font-black text-base sm:text-lg">
                    <AlertTriangle size={18} className="text-rose-600" />
                    <span>Common Beginner Mistakes to Avoid</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topicData.mistakes.map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-rose-50/40 border border-rose-200/80 rounded-xl p-4 space-y-2.5 shadow-xs"
                      >
                        <span className="text-xs font-black text-rose-900 flex items-center space-x-1.5">
                          <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-black">
                            ✕
                          </span>
                          <span>{m.title}</span>
                        </span>
                        <div className="bg-slate-900 text-rose-300 font-mono text-xs p-2.5 rounded-lg overflow-x-auto shadow-inner">
                          {m.badCode}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {m.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 13. KEY TAKEAWAYS */}
              {topicData.keyPoints && topicData.keyPoints.length > 0 && (
                <section className="pt-6">
                  <div className="bg-emerald-50/60 border-l-4 border-emerald-500 rounded-r-xl p-5 space-y-3 shadow-xs">
                    <div className="flex items-center space-x-2 text-emerald-900 font-black text-sm uppercase tracking-wider">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <span>Key Architectural Takeaways</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {topicData.keyPoints.map((kp, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2 text-xs sm:text-[13px] text-slate-800 font-medium leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                          <span>{kp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}


              {/* Clean bottom termination (no prev/next topic buttons) */}
              <div className="pb-16" />

            </article>
          )}
        </main>
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OVER DRAWER (<1024px)
         ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />

          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen size={16} className="text-blue-600" />
                <span className="font-black text-sm text-slate-900">Course Syllabus</span>
              </div>
              <button 
                type="button" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {CHAPTER_CATALOG.map((mod) => {
                const isExpanded = expandedModules[mod.id] !== false;
                const isAvailable = mod.status === 'available';
                const isSelected = selectedModuleId === mod.id;

                if (!isAvailable) {
                  return (
                    <div key={mod.id} className="pb-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModuleId && setSelectedModuleId(mod.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/90 border border-amber-200 text-amber-950 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-500 flex items-center justify-center shrink-0">
                            {mod.number}
                          </span>
                          <span className="truncate">{mod.shortTitle || mod.title}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100/90 border border-amber-300 text-amber-900 rounded-lg text-[10px] font-extrabold tracking-wide shrink-0 shadow-2xs">
                          Coming Soon
                        </span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={mod.id} className="pb-2 mb-1 border-b border-slate-200/80 last:border-b-0 last:mb-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => {
                        toggleModule(mod.id);
                        setSelectedModuleId && setSelectedModuleId(mod.id);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-950 border border-indigo-200'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 border border-slate-200 text-slate-700'
                        }`}>
                          {mod.number}
                        </span>
                        <span className="truncate">{mod.title}</span>
                      </div>

                      {isExpanded ? (
                        <ChevronUp size={15} className="text-indigo-600 shrink-0 ml-1.5" strokeWidth={2.2} />
                      ) : (
                        <ChevronRight size={15} className="text-slate-400 shrink-0 ml-1.5" strokeWidth={2.2} />
                      )}
                    </button>

                    {isExpanded && mod.topics && (
                      <div className="ml-3 pl-2.5 border-l-2 border-slate-200/80 space-y-0.5 pt-1 pb-1">
                        {mod.topics.map((t, idx) => {
                          const isTopicSelected = currentActiveTopicId === t.id && isAvailable;
                          const isCompleted = localCompletedTopics.includes(t.id);

                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                handleSelectTopic(t.id, mod.id);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                isTopicSelected
                                  ? 'bg-blue-50 text-blue-700 font-extrabold border border-blue-100 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                {isCompleted ? (
                                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                                ) : (
                                  <span className={`text-[10px] font-mono font-bold shrink-0 px-1.5 py-0.5 rounded ${
                                    isTopicSelected ? 'bg-blue-200 text-blue-900 font-black' : 'text-slate-500 bg-slate-100'
                                  }`}>
                                    {t.lessonCode || `${mod.number}.${idx + 1}`}
                                  </span>
                                )}
                                <span className="truncate">{t.title}</span>
                              </div>
                              {isCompleted && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm shrink-0">Done</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {selectedZoomImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setSelectedZoomImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedZoomImage(null)}
              className="absolute -top-11 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shadow-lg"
              title="Close (ESC)"
            >
              <X size={20} />
            </button>
            <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 w-full max-h-[85vh] flex items-center justify-center p-1">
              <img
                src={selectedZoomImage}
                alt="Enlarged Visual Guide"
                className="max-w-full max-h-[83vh] w-auto h-auto object-contain rounded-xl"
              />
            </div>
            <div className="text-slate-400 text-xs font-medium mt-3">
              Click anywhere outside or press ESC to close
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
