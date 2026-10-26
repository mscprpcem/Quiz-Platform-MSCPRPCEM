import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Clock, CheckCircle2, Circle, Search,
  Filter, Sparkles, BookOpen, Layers, Check, ChevronRight
} from 'lucide-react';
import { GIT_ROADMAP } from '../data/gitCurriculumData';

export default function GitRoadmapView({ onBackToOverview }) {
  const navigate = useNavigate();

  const [selectedWeek, setSelectedWeek] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Completed days state stored in localStorage
  const [completedDays, setCompletedDays] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_completed_roadmap_days');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleDayCompleted = (day, e) => {
    if (e) e.stopPropagation();
    setCompletedDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
      try {
        localStorage.setItem('msc_git_completed_roadmap_days', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Flattened days
  const allDays = useMemo(() => {
    const list = [];
    GIT_ROADMAP.forEach((w) => {
      w.days.forEach((d) => {
        list.push({
          ...d,
          weekName: w.week,
          weekTitle: w.title
        });
      });
    });
    return list;
  }, []);

  // Filtered days
  const filteredDays = useMemo(() => {
    return allDays.filter((item) => {
      if (selectedWeek !== 'all' && item.weekName !== selectedWeek) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesTopic = item.topic?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTopic) return false;
      }
      return true;
    });
  }, [allDays, selectedWeek, searchQuery]);

  const totalDays = allDays.length;
  const completedCount = completedDays.length;
  const progressPercent = Math.round((completedCount / totalDays) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-segoe pb-24">
      {/* ═════════════════════════════════════════════════════════════════════
          TOP STICKY HEADER BAR
      ═════════════════════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={onBackToOverview ? onBackToOverview : () => navigate('/courses/git')}
            className="inline-flex items-center space-x-1.5 sm:space-x-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group shrink-0"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden xs:inline">Back to Git Course Hub</span>
            <span className="xs:hidden">Back</span>
          </button>

          <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-bold shrink-0">
            <span className="text-slate-500 hidden md:inline">Progress:</span>
            <span className="text-blue-600 font-mono font-black text-[11px] sm:text-xs">
              {completedCount} / {totalDays} <span className="hidden sm:inline">Days</span> ({progressPercent}%)
            </span>
            <div className="w-16 sm:w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════════
          MAIN ROADMAP WORKSPACE
      ═════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* Title Header */}
        <div className="space-y-2 border-b border-slate-200 pb-4 sm:pb-5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black tracking-wider uppercase">
            <Clock size={12} className="text-amber-600" />
            <span>Structured 4-Week Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            30-Day Git & GitHub Developer Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
            A guided day-by-day plan to take you from initial repository setup to advanced branching, merge conflict resolution, and production workflows.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-2xs">
          
          {/* Week Selector Pills */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {[
              { id: 'all', label: 'All Days' },
              { id: 'Orientation', label: 'Day 0: Orientation' },
              { id: 'Week 1', label: 'Week 1: Foundations' },
              { id: 'Week 2', label: 'Week 2: Branching' },
              { id: 'Week 3', label: 'Week 3: GitHub' },
              { id: 'Week 4', label: 'Week 4: Power Tools' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedWeek(f.id)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  selectedWeek === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56 md:w-64">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search roadmap days..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Roadmap Days Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredDays.map((item) => {
            const isDone = completedDays.includes(item.day);

            return (
              <div
                key={item.day}
                onClick={() => navigate(`/courses/git/learn?topic=${item.topic}`)}
                className={`p-3.5 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group bg-white ${
                  isDone
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Completion Toggle Circle */}
                  <button
                    type="button"
                    onClick={(e) => toggleDayCompleted(item.day, e)}
                    className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    title={isDone ? 'Mark day as incomplete' : 'Mark day as complete'}
                  >
                    {isDone ? (
                      <CheckCircle2 size={20} className="text-emerald-500" strokeWidth={2.5} />
                    ) : (
                      <Circle size={20} className="text-slate-300 group-hover:text-slate-400" />
                    )}
                  </button>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        Day {item.day < 10 ? `0${item.day}` : item.day}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.weekName}
                      </span>
                    </div>

                    <h3 className={`text-xs sm:text-sm font-extrabold line-clamp-2 sm:line-clamp-1 ${
                      isDone ? 'text-slate-500 line-through' : 'text-slate-800 group-hover:text-blue-600 transition-colors'
                    }`}>
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <span className="hidden xs:inline text-[11px]">Study</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
