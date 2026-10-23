import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  GitBranch, BookOpen, Code2, Award, Clock, CheckCircle2, ShieldCheck,
  ChevronRight, ArrowRight, Search, Terminal, Sparkles, Filter, ExternalLink,
  HelpCircle, ChevronDown, Check, Star, Zap, AlertCircle, Layers
} from 'lucide-react';
import { GIT_CURRICULUM, GIT_ROADMAP, GIT_CHEATSHEET } from '../data/gitCurriculumData';
import { GIT_CHALLENGES } from '../data/gitChallenges';
import { GIT_QUIZZES } from '../data/gitQuizzesData';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function GitCourseHub() {
  const navigate = useNavigate();
  const { tab: urlTab } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Active Top Tab
  const [activeTab, setActiveTab] = useState(() => {
    if (urlTab && ['overview', 'learn', 'practice', 'roadmap', 'quiz', 'cheatsheet'].includes(urlTab)) {
      return urlTab;
    }
    return 'overview';
  });

  // Learn Tab State
  const [selectedTopicSlug, setSelectedTopicSlug] = useState('git-basics');
  const [expandedTierId, setExpandedTierId] = useState('tier-1');
  const [topicSearchQuery, setTopicSearchQuery] = useState('');

  // Practice Tab Filter
  const [practiceTrackFilter, setPracticeTrackFilter] = useState('all');

  // Quiz Tab State
  const [selectedQuizTier, setSelectedQuizTier] = useState('tier-1');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  // User Progress State
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [solvedChallenges, setSolvedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_solved_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [quizScores, setQuizScores] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_quiz_scores');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [skillLevel, setSkillLevel] = useState('Novice');

  // Fetch backend progress on load
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const emailParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
        const res = await api.get(`/git/progress${emailParam}`);
        if (res.data?.success && res.data?.progress) {
          const p = res.data.progress;
          if (p.completed_lessons) {
            setCompletedLessons(p.completed_lessons);
            localStorage.setItem('msc_git_completed_lessons', JSON.stringify(p.completed_lessons));
          }
          if (p.completed_challenges) {
            setSolvedChallenges(p.completed_challenges);
            localStorage.setItem('msc_git_solved_challenges', JSON.stringify(p.completed_challenges));
          }
          if (p.quiz_scores) {
            setQuizScores(p.quiz_scores);
            localStorage.setItem('msc_git_quiz_scores', JSON.stringify(p.quiz_scores));
          }
          if (p.skill_level) setSkillLevel(p.skill_level);
        }
      } catch (err) {
        // Safe offline fallback
      }
    };
    fetchProgress();
  }, [user]);

  // Sync tab with URL
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    navigate(`/courses/git/${tabName}`, { replace: true });
  };

  // Find active topic object
  const activeTopic = useMemo(() => {
    for (const tier of GIT_CURRICULUM) {
      const found = tier.topics.find(t => t.slug === selectedTopicSlug);
      if (found) return found;
    }
    return GIT_CURRICULUM[0].topics[0];
  }, [selectedTopicSlug]);

  // Handle Mark Lesson Completed
  const handleMarkLessonComplete = async (slug) => {
    const updated = Array.from(new Set([...completedLessons, slug]));
    setCompletedLessons(updated);
    localStorage.setItem('msc_git_completed_lessons', JSON.stringify(updated));

    if (user?.email) {
      try {
        await api.post('/git/progress/lesson', {
          lessonSlug: slug,
          email: user.email
        });
      } catch (err) {}
    }
    addToast('Lesson marked as completed!', 'success');
  };

  // Handle Submit Quiz
  const handleSubmitQuiz = async () => {
    const quiz = GIT_QUIZZES[selectedQuizTier];
    if (!quiz) return;

    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= quiz.passingScore;

    setQuizSubmitted(true);

    const newScores = {
      ...quizScores,
      [selectedQuizTier]: {
        score,
        total: quiz.questions.length,
        percentage,
        passed,
        completedAt: new Date().toISOString()
      }
    };
    setQuizScores(newScores);
    localStorage.setItem('msc_git_quiz_scores', JSON.stringify(newScores));

    if (user?.email) {
      setQuizSubmitting(true);
      try {
        await api.post('/git/progress/quiz', {
          quizSlug: selectedQuizTier,
          score,
          total: quiz.questions.length,
          percentage,
          passed,
          email: user.email
        });
      } catch (e) {
      } finally {
        setQuizSubmitting(false);
      }
    }

    if (passed) {
      addToast(`🎉 Passed ${quiz.title}! Score: ${percentage}%`, 'success');
    } else {
      addToast(`Scored ${percentage}%. Passing score is ${quiz.passingScore}%. Try again!`, 'info');
    }
  };

  // Total topics count
  const totalTopics = useMemo(() => {
    return GIT_CURRICULUM.reduce((acc, t) => acc + t.topics.length, 0);
  }, []);

  // Overall progress percentage
  const totalProgressPercentage = useMemo(() => {
    const lessonWeight = 0.4;
    const challengeWeight = 0.4;
    const quizWeight = 0.2;

    const lessonPct = totalTopics > 0 ? (completedLessons.length / totalTopics) : 0;
    const challengePct = GIT_CHALLENGES.length > 0 ? (solvedChallenges.length / GIT_CHALLENGES.length) : 0;
    const quizCount = Object.keys(GIT_QUIZZES).length;
    const quizzesPassed = Object.values(quizScores).filter(q => q.passed).length;
    const quizPct = quizCount > 0 ? (quizzesPassed / quizCount) : 0;

    const overall = (lessonPct * lessonWeight) + (challengePct * challengeWeight) + (quizPct * quizWeight);
    return Math.min(100, Math.round(overall * 100));
  }, [completedLessons, solvedChallenges, quizScores, totalTopics]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-segoe pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30 flex items-center gap-1.5 shadow-xs">
                  <Sparkles size={11} className="text-blue-300" />
                  Official MSC PRPCEM Track
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck size={11} className="text-emerald-300" />
                  Rank: {skillLevel}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Git & GitHub Developer Mastery Track
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
                From your first <code className="text-cyan-300 font-mono">git init</code> to interactive rebasing, emergency secret scrubbing, and production hotfixes. Practice directly in our in-browser virtual Git terminal.
              </p>
            </div>

            {/* Quick Launch CTA */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/practice/git/lab')}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Terminal size={15} />
                <span>Launch Interactive Lab</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Progress Bar Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-400" />
                  Course Completion Progress
                </span>
                <span className="font-black font-mono text-cyan-400 text-sm">{totalProgressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalProgressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-6 text-center text-xs font-bold text-slate-300 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
              <div>
                <span className="text-base font-black font-mono text-white block">{completedLessons.length}/{totalTopics}</span>
                <span className="text-[10px] text-slate-400 font-semibold">Lessons</span>
              </div>
              <div>
                <span className="text-base font-black font-mono text-emerald-400 block">{solvedChallenges.length}/{GIT_CHALLENGES.length}</span>
                <span className="text-[10px] text-slate-400 font-semibold">Challenges</span>
              </div>
              <div>
                <span className="text-base font-black font-mono text-cyan-400 block">
                  {Object.values(quizScores).filter(q => q.passed).length}/5
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Quizzes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4">
        {/* Navigation Tabs Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm flex flex-wrap gap-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'learn', label: 'Curriculum & Lessons', icon: Layers },
            { id: 'practice', label: 'Interactive Challenges', icon: Code2 },
            { id: 'roadmap', label: '30-Day Roadmap', icon: Clock },
            { id: 'quiz', label: 'Knowledge Checks', icon: HelpCircle },
            { id: 'cheatsheet', label: 'Cheat Sheet', icon: Terminal }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════
            TAB 1: OVERVIEW TAB
        ═══════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Completed</span>
                  <span className="text-xl font-black text-slate-900">{completedLessons.length} / {totalTopics}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Curriculum Topics</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Code2 size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Solved</span>
                  <span className="text-xl font-black text-slate-900">{solvedChallenges.length} / {GIT_CHALLENGES.length}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Hands-on Labs</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Award size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Mastery Tier</span>
                  <span className="text-xl font-black text-slate-900">{skillLevel}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Student Rank</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Assessments</span>
                  <span className="text-xl font-black text-slate-900">
                    {Object.values(quizScores).filter(q => q.passed).length} / 5
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Knowledge Quizzes</span>
                </div>
              </div>
            </div>

            {/* 5-Tier Curriculum Level Breakdown */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h2 className="text-lg font-black text-slate-900">Curriculum Progression Tiers</h2>
                <span className="text-xs font-bold text-blue-600">5 Structured Levels</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {GIT_CURRICULUM.map(tier => {
                  const completedInTier = tier.topics.filter(t => completedLessons.includes(t.slug)).length;
                  const tierPct = Math.round((completedInTier / tier.topics.length) * 100);

                  return (
                    <div
                      key={tier.id}
                      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700`}>
                            {tier.badge}
                          </span>
                          <span className="text-xs font-bold font-mono text-blue-600">{completedInTier}/{tier.topics.length}</span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {tier.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {tier.subtitle}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${tierPct}%` }} />
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTopicSlug(tier.topics[0].slug);
                            setExpandedTierId(tier.id);
                            handleTabChange('learn');
                          }}
                          className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Explore Lessons</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Teaser to Practice Lab */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Real Terminal Simulator
                </span>
                <h3 className="text-xl font-black text-white">Hands-on LeetCode-Style Git Labs</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Solve real-world merge conflicts, scrub leaked credentials, and manipulate branch pointers in our client-side virtual terminal with real-time commit graph rendering.
                </p>
              </div>
              <button
                onClick={() => navigate('/practice/git/lab')}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap active:scale-95"
              >
                <Terminal size={16} />
                <span>Start Practice Sandbox</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 2: LEARN TAB (Curriculum Reader)
        ═══════════════════════════════════════════════ */}
        {activeTab === 'learn' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            {/* Left Column: Topics Accordion Navigation (4 Cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4 max-h-[800px] overflow-y-auto">
              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 34 lessons..."
                  value={topicSearchQuery}
                  onChange={(e) => setTopicSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Tiers Accordion */}
              <div className="space-y-3">
                {GIT_CURRICULUM.map(tier => {
                  const filteredTopics = tier.topics.filter(t =>
                    t.title.toLowerCase().includes(topicSearchQuery.toLowerCase()) ||
                    t.summary.toLowerCase().includes(topicSearchQuery.toLowerCase())
                  );

                  if (topicSearchQuery && filteredTopics.length === 0) return null;

                  const isExpanded = expandedTierId === tier.id || Boolean(topicSearchQuery);

                  return (
                    <div key={tier.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedTierId(isExpanded ? null : tier.id)}
                        className="w-full bg-slate-50 px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-xs font-extrabold text-slate-800">{tier.title.split(':')[0]}</span>
                        <ChevronDown size={14} className={`text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="p-1 space-y-1 bg-white">
                          {filteredTopics.map(topic => {
                            const isSelected = selectedTopicSlug === topic.slug;
                            const isDone = completedLessons.includes(topic.slug);

                            return (
                              <button
                                key={topic.slug}
                                onClick={() => setSelectedTopicSlug(topic.slug)}
                                className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 text-blue-700 font-extrabold'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate pr-2">{topic.title}</span>
                                {isDone ? (
                                  <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-normal">{topic.readTime}</span>
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

            {/* Right Column: Markdown Reader (8 Cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">
                    Curriculum Lesson
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">{activeTopic.title}</h2>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Clock size={12} /> {activeTopic.readTime}
                  </span>
                </div>

                <button
                  onClick={() => handleMarkLessonComplete(activeTopic.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                    completedLessons.includes(activeTopic.slug)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>{completedLessons.includes(activeTopic.slug) ? 'Completed' : 'Mark Completed'}</span>
                </button>
              </div>

              {/* Lesson Markdown Content */}
              <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
                {activeTopic.content.split('\n\n').map((block, idx) => {
                  const trimmed = block.trim();
                  if (!trimmed) return null;

                  if (trimmed.startsWith('### ')) {
                    return <h3 key={idx} className="text-base font-extrabold text-slate-900 pt-2">{trimmed.replace('### ', '')}</h3>;
                  }
                  if (trimmed.startsWith('#### ')) {
                    return <h4 key={idx} className="text-sm font-bold text-slate-800 pt-1">{trimmed.replace('#### ', '')}</h4>;
                  }
                  if (trimmed.startsWith('```')) {
                    const code = trimmed.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
                    return (
                      <div key={idx} className="bg-slate-900 text-cyan-300 font-mono text-xs p-4 rounded-xl overflow-x-auto shadow-inner">
                        <pre className="whitespace-pre font-mono">{code}</pre>
                      </div>
                    );
                  }
                  if (trimmed.startsWith('> ')) {
                    return (
                      <div key={idx} className="border-l-4 border-amber-500 bg-amber-50/70 p-3.5 rounded-r-xl text-amber-900 text-xs">
                        {trimmed.replace('> ', '')}
                      </div>
                    );
                  }
                  return <p key={idx} className="text-slate-600">{trimmed}</p>;
                })}
              </div>

              {/* Bottom Next Step CTA */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs font-bold">
                <button
                  onClick={() => navigate('/practice/git/lab')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Terminal size={14} />
                  <span>Try in Sandbox</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 3: PRACTICE TAB (Challenge Directory)
        ═══════════════════════════════════════════════ */}
        {activeTab === 'practice' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Tracks' },
                  { id: 'basics', label: 'Foundations' },
                  { id: 'branching', label: 'Branching & Merging' },
                  { id: 'remotes', label: 'GitHub & Remotes' },
                  { id: 'advanced', label: 'Power Tools' },
                  { id: 'real-world', label: 'Real-World Production' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setPracticeTrackFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      practiceTrackFilter === f.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold text-slate-500">
                {GIT_CHALLENGES.filter(c => practiceTrackFilter === 'all' || c.track === practiceTrackFilter).length} Challenges Available
              </span>
            </div>

            {/* Challenge Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {GIT_CHALLENGES.filter(c => practiceTrackFilter === 'all' || c.track === practiceTrackFilter).map((challenge, idx) => {
                const isSolved = solvedChallenges.includes(challenge.id);

                return (
                  <div
                    key={challenge.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          challenge.difficulty === 'Beginner'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : challenge.difficulty === 'Intermediate'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {challenge.difficulty}
                        </span>

                        {isSolved && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Solved
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{challenge.category}</span>
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
                          {challenge.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">
                          {challenge.scenario}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">ID: {challenge.id}</span>
                      <button
                        onClick={() => navigate(`/practice/git/${challenge.id}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Terminal size={12} />
                        <span>Launch Lab</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 4: ROADMAP TAB (30-Day Developer Plan)
        ═══════════════════════════════════════════════ */}
        {activeTab === 'roadmap' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-xl font-black text-slate-900">30-Day Git & GitHub Developer Roadmap</h2>
              <p className="text-xs text-slate-500 font-medium">
                Structured day-by-day progression designed to take engineering students from absolute beginner to industry-ready Git mastery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GIT_ROADMAP.map(week => (
                <div key={week.week} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">{week.week}</span>
                    <h3 className="text-base font-extrabold text-slate-900">{week.title}</h3>
                  </div>

                  <div className="space-y-2.5">
                    {week.days.map(d => {
                      const isDone = completedLessons.includes(d.topic);

                      return (
                        <div
                          key={d.day}
                          onClick={() => {
                            setSelectedTopicSlug(d.topic);
                            handleTabChange('learn');
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                              {d.day}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{d.title}</span>
                          </div>
                          {isDone ? (
                            <CheckCircle2 size={14} className="text-emerald-600" />
                          ) : (
                            <ChevronRight size={14} className="text-slate-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 5: KNOWLEDGE CHECK QUIZZES
        ═══════════════════════════════════════════════ */}
        {activeTab === 'quiz' && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            {/* Level Selector */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
              {Object.keys(GIT_QUIZZES).map(tierKey => {
                const quiz = GIT_QUIZZES[tierKey];
                const scoreObj = quizScores[tierKey];
                const isSelected = selectedQuizTier === tierKey;

                return (
                  <button
                    key={tierKey}
                    onClick={() => {
                      setSelectedQuizTier(tierKey);
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{quiz.title.split(':')[0]}</span>
                    {scoreObj?.passed && (
                      <CheckCircle2 size={12} className={isSelected ? 'text-white' : 'text-emerald-600'} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Quiz Card */}
            {GIT_QUIZZES[selectedQuizTier] && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
                    Tier Assessment
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    {GIT_QUIZZES[selectedQuizTier].title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {GIT_QUIZZES[selectedQuizTier].subtitle} (Passing score: {GIT_QUIZZES[selectedQuizTier].passingScore}%)
                  </p>
                </div>

                {/* Questions List */}
                <div className="space-y-6 pt-2">
                  {GIT_QUIZZES[selectedQuizTier].questions.map((q, qIdx) => {
                    const selectedOption = quizAnswers[q.id];
                    const isCorrect = selectedOption === q.correctAnswer;

                    return (
                      <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <span className="text-xs font-black text-slate-800">
                          {qIdx + 1}. {q.question}
                        </span>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            let optionStyle = 'bg-white border-slate-200 hover:border-blue-400 text-slate-700';

                            if (quizSubmitted) {
                              if (optIdx === q.correctAnswer) {
                                optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                              } else if (selectedOption === optIdx) {
                                optionStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                              }
                            } else if (selectedOption === optIdx) {
                              optionStyle = 'bg-blue-50 border-blue-500 text-blue-800 font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && optIdx === q.correctAnswer && (
                                  <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className={`p-3 rounded-xl text-[11px] leading-relaxed ${
                            isCorrect ? 'bg-emerald-100/60 text-emerald-900' : 'bg-rose-100/60 text-rose-900'
                          }`}>
                            <span className="font-bold block mb-0.5">{isCorrect ? '✓ Correct' : '✗ Explanation:'}</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {Object.keys(quizAnswers).length} of {GIT_QUIZZES[selectedQuizTier].questions.length} answered
                  </span>

                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(quizAnswers).length < GIT_QUIZZES[selectedQuizTier].questions.length}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
                    >
                      Submit & Score
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 6: CHEAT SHEET TAB
        ═══════════════════════════════════════════════ */}
        {activeTab === 'cheatsheet' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-xl font-black text-slate-900">Git Quick Reference Cheat Sheet</h2>
              <p className="text-xs text-slate-500 font-medium">
                Copyable commands for day-to-day software engineering and developer workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {GIT_CHEATSHEET.map((cat, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <h3 className="text-sm font-extrabold text-blue-600 uppercase tracking-wider">{cat.category}</h3>
                  <div className="space-y-2">
                    {cat.commands.map((item, cIdx) => (
                      <div key={cIdx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col space-y-1">
                        <code className="text-xs font-mono font-bold text-slate-900 select-all">{item.cmd}</code>
                        <span className="text-[11px] text-slate-500 font-medium">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
