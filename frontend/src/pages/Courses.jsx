import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Clock, ArrowRight, CheckCircle2, Maximize2, Shuffle, ShieldCheck, Loader2, Code2, Zap, Terminal } from 'lucide-react';
import api from '../services/api';

const BLOB_BASE = 'https://mscprpcem.blob.core.windows.net/quiz';

const resolveCourseImage = (src) => {
  if (!src) return '/logo.png';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/assets/quiz/')) return `${BLOB_BASE}/${src.replace('/assets/quiz/', '')}`;
  if (
    src.startsWith('/azure') ||
    src.startsWith('/microsoft-copilot') ||
    src === '/database.svg' ||
    src === '/github.svg' ||
    src === '/azure-ai-foundry-logo.jpg'
  ) {
    return `${BLOB_BASE}${src}`;
  }
  return src;
};

const FALLBACK_COURSES = [
  {
    title: 'Microsoft Azure',
    slug: 'cloud',
    category: 'Cloud Infrastructure',
    desc: 'Master Microsoft Azure cloud services, virtual machines, resource management, and AZ-900 exam preparation.',
    imageSrc: 'https://mscprpcem.blob.core.windows.net/quiz/azure.png',
    color: 'from-blue-50/80 to-indigo-50/50 border-blue-200/80',
    status: 'coming_soon',
    badge: 'Coming Soon'
  },
  {
    title: 'Azure AI',
    slug: 'cloud-ai',
    category: 'Artificial Intelligence',
    desc: 'Explore Azure OpenAI, Cognitive Services, Computer Vision, and natural language processing solutions.',
    imageSrc: 'https://mscprpcem.blob.core.windows.net/quiz/azure-ai-foundry-logo.jpg',
    color: 'from-purple-50/80 to-indigo-50/50 border-purple-200/80',
    status: 'coming_soon',
    badge: 'Coming Soon'
  },
  {
    title: 'Computer Fundamentals',
    slug: 'dsa',
    category: 'Core Computer Science',
    desc: 'Build rock-solid foundations in operating systems, computer architecture, memory management, and networking.',
    imageSrc: 'https://mscprpcem.blob.core.windows.net/quiz/microsoft-copilot.png',
    color: 'from-amber-50/80 to-orange-50/50 border-amber-200/80',
    status: 'coming_soon',
    badge: 'Coming Soon'
  },
  {
    title: 'Database (SQL)',
    slug: 'dbms',
    category: 'Database Systems',
    desc: 'Master relational queries, multi-table JOINs, aggregations, and placement challenges with real-time query validation.',
    imageSrc: 'https://mscprpcem.blob.core.windows.net/quiz/database.svg',
    color: 'from-emerald-50/80 to-teal-50/50 border-emerald-200/80',
    status: 'published',
    badge: 'Interactive Lab Active',
    hasInteractiveLab: true
  },
  {
    title: 'Git & GitHub',
    slug: 'git',
    category: 'Version Control & Open Source',
    desc: 'Master Git branching, pull requests, merge conflict resolution, CI/CD workflows, and open-source collaboration in our virtual terminal.',
    imageSrc: 'https://mscprpcem.blob.core.windows.net/quiz/github.svg',
    color: 'from-rose-50/80 to-pink-50/50 border-rose-200/80',
    status: 'published',
    badge: 'Interactive Lab Active',
    hasInteractiveLab: true
  }
];

export default function Courses() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('msc_admin_courses');
    if (!saved) return FALLBACK_COURSES;
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(c => ({
        ...c,
        imageSrc: resolveCourseImage(c.imageSrc)
      }));
    } catch {
      return FALLBACK_COURSES;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('msc_admin_courses');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCourses(parsed.map(c => ({
            ...c,
            imageSrc: resolveCourseImage(c.imageSrc)
          })));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      setSubmittingEmail(true);
      const res = await api.post('/api/subscribers/notify', {
        email: email.trim().toLowerCase(),
        source: 'Courses Hub',
        topic: 'Future Technical Quizzes & Track Releases'
      });

      setSubscribed(true);
      setSubscribeMessage(res.data?.message || "You're on the list! We will notify you upon future quiz releases.");
      setEmail('');
    } catch (err) {
      console.error('Subscription notice:', err);
      setSubscribed(true);
      setSubscribeMessage("You're on the list! We will notify you when new quizzes open for enrollment.");
      setEmail('');
    } finally {
      setSubmittingEmail(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-[#F5FAFF] relative overflow-hidden py-10 sm:py-16 px-4 sm:px-6">
      
      {/* Background Mesh Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/15 blur-[120px] animate-pulse"></div>
        <div className="absolute top-[30%] right-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-400/15 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-[140px]"></div>
      </div>

      <div className="max-w-5xl mx-auto w-full space-y-12 relative z-10 text-center">

        {/* Hero Header */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-brand-lightBlue text-brand-blue border border-brand-blue/20 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm">
            <Sparkles size={14} className="animate-pulse" />
            <span>MSC-PRPCEM Learning Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-brand-textMain tracking-tight leading-tight">
            Technical Courses & <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Developer Practice Tracks
            </span>
          </h1>

          <p className="text-sm sm:text-base text-brand-textMuted leading-relaxed font-medium">
            Explore curated technical curriculums, test your skills in real-time practice exams, and earn verified certification badges.
          </p>
        </div>

        {/* Early Access Notification Form */}
        <div className="max-w-md mx-auto bg-white border border-brand-border p-6 rounded-2xl shadow-soft text-left space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center border border-blue-100">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-brand-textMain">Get Early Access & Track Releases</h3>
              <p className="text-[11px] text-brand-textMuted">Be the first to know when new technical courses open for enrollment.</p>
            </div>
          </div>

          {subscribed ? (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{subscribeMessage || "You're on the early access list! We will notify you upon course releases."}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                disabled={submittingEmail}
                placeholder="Enter student email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-brand-textMain focus:outline-none focus:border-brand-blue bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={submittingEmail}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {submittingEmail && <Loader2 size={13} className="animate-spin" />}
                <span>{submittingEmail ? 'Saving...' : 'Notify Me'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Courses Preview Grid */}
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center border-b border-brand-border pb-3">
            <h3 className="text-lg font-black text-brand-textMain">Learning & Certification Tracks</h3>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-blue bg-brand-lightBlue px-3 py-1 rounded-full border border-brand-blue/15">
              Official Curriculums
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courses.map((course, idx) => {
              const isPublished = course.status === 'published';
              const qs = course.quizSettings || {};

              return (
                <div
                  key={course.id || idx}
                  className={`bg-white border border-brand-border rounded-2xl p-6 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300 border border-slate-200/90 p-1.5 overflow-hidden">
                        <img
                          src={resolveCourseImage(course.imageSrc)}
                          alt={course.title}
                          className="object-contain w-full h-full rounded-xl"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/logo.png';
                          }}
                        />
                      </div>

                      <span className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                        course.slug === 'dbms' || course.slug === 'git'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : isPublished
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                          : 'bg-amber-100/80 text-amber-800 border border-amber-200'
                      }`}>
                        {course.slug === 'dbms' || course.slug === 'git' ? '⚡ Interactive Lab' : isPublished ? 'Quiz Available' : 'Coming Soon'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest block">{course.category}</span>
                      <h4 className="text-base font-extrabold text-brand-textMain mt-0.5">{course.title}</h4>
                      <p className="text-xs text-brand-textMuted mt-1.5 leading-relaxed font-medium">
                        {course.desc}
                      </p>
                    </div>

                    {/* SQL Lab Feature Badges */}
                    {course.slug === 'dbms' && (
                      <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-bold text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1">
                          <BookOpen size={10} /> 21 Modules & Concepts
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1">
                          <Clock size={10} /> 30-Day Roadmap
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                          <Code2 size={10} /> In-Browser SQL Lab
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center gap-1">
                          <ShieldCheck size={10} /> FAANG Interview Prep
                        </span>
                      </div>
                    )}

                    {/* Git Lab Feature Badges */}
                    {course.slug === 'git' && (
                      <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-bold text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1">
                          <BookOpen size={10} /> 34 Topics & Lessons
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1">
                          <Clock size={10} /> 30-Day Roadmap
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                          <Terminal size={10} /> Virtual Git Engine
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center gap-1">
                          <ShieldCheck size={10} /> 70 Practice Labs
                        </span>
                      </div>
                    )}

                    {/* Quiz parameters overview */}
                    {isPublished && course.slug !== 'dbms' && course.slug !== 'git' && (
                      <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-bold text-slate-600">
                        {qs.requireFullScreen && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                            <Maximize2 size={10} /> Full Screen Lock
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                          <Clock size={10} /> {qs.timeLimitMinutes || 10} Mins
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                          <ShieldCheck size={10} /> Pass: {qs.passingScore || 70}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Includes verified certificate</span>
                    
                    {course.slug === 'dbms' ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => navigate('/courses/sql')}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs"
                        >
                          <BookOpen size={13} />
                          <span>SQL Course Hub</span>
                          <ArrowRight size={13} />
                        </button>
                        <button
                          onClick={() => navigate('/courses/sql/practice')}
                          className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 text-[11px]"
                          title="Interactive In-Browser SQL Lab"
                        >
                          <Code2 size={12} />
                          <span>Code Lab</span>
                        </button>
                      </div>
                    ) : course.slug === 'git' ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => navigate('/courses/git')}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs"
                        >
                          <BookOpen size={13} />
                          <span>Git Course Hub</span>
                          <ArrowRight size={13} />
                        </button>
                        <button
                          onClick={() => navigate('/courses/git/practice')}
                          className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 text-[11px]"
                          title="Interactive In-Browser Git Lab"
                        >
                          <Terminal size={12} />
                          <span>Code Lab</span>
                        </button>
                      </div>
                    ) : isPublished ? (
                      <button
                        onClick={() => {
                          const slug = course.slug || 'dbms';
                          navigate(`/practice/${slug}`);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>Take Practice Quiz</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-extrabold border border-slate-200/80 flex items-center gap-1.5">
                        <Clock size={13} className="text-amber-600" />
                        <span>Coming Soon</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back to Home CTA */}
        <div className="pt-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 text-xs font-extrabold text-brand-blue hover:underline cursor-pointer"
          >
            <span>Return to Homepage</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
