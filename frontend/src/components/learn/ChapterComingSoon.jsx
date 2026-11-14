import React from 'react';
import { 
  Sparkles, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Database, 
  Layers, 
  Code2 
} from 'lucide-react';

export default function ChapterComingSoon({
  chapter,
  onSelectChapter,
  onJumpToPractice
}) {
  if (!chapter) return null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto py-2">
      {/* HEADER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        {/* Subtle accent corner glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-50/70 via-blue-50/40 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full font-black text-xs uppercase tracking-wider">
              Chapter {chapter.number}
            </span>
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-extrabold text-xs flex items-center space-x-1.5 shadow-2xs">
              <Clock size={13} className="text-amber-600 animate-pulse" />
              <span>Coming Soon</span>
            </span>
            <span className="text-xs font-bold text-slate-400">
              Actively in Development
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {chapter.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-2xl">
              {chapter.description}
            </p>
          </div>

          {/* PLANNED CURRICULUM PREVIEW */}
          {chapter.plannedTopics && chapter.plannedTopics.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                <BookOpen size={14} className="text-indigo-600" />
                <span>Planned Curriculum in this Chapter:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {chapter.plannedTopics.map((topicName, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex items-start space-x-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-2xs">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      {topicName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS: SWITCH TO READY CHAPTERS */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-500">
              Start learning immediately with fully available interactive chapters:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onSelectChapter('mod-01')}
                className="py-3 px-4 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-2xl text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-blue-800 font-black text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Database size={14} />
                    <span>Chapter 1: Fundamentals</span>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-blue-700/80 mt-1 font-medium">
                  DBMS vs RDBMS, Tables, Setup
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectChapter('mod-02')}
                className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-emerald-900 font-black text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Layers size={14} />
                    <span>Chapter 3: DDL Deep Dive</span>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-emerald-800/80 mt-1 font-medium">
                  CREATE, ALTER, DROP, TRUNCATE
                </p>
              </button>

              <button
                type="button"
                onClick={onJumpToPractice}
                className="py-3 px-4 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-2xl text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-indigo-900 font-black text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Code2 size={14} />
                    <span>Practice Lab</span>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] text-indigo-800/80 mt-1 font-medium">
                  Solve live SQL challenges
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
