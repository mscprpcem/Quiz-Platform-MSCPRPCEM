import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Trophy, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Award,
  ExternalLink,
  ShieldCheck,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  QrCode,
  Lock,
  Tv,
  Check,
  Search,
  Info,
  X
} from 'lucide-react';
import api from '../services/api';
import QRScanner from '../components/QRScanner';
import {
  getISTDay,
  getISTMonthShort,
  formatToISTTimeString,
  formatToISTDateString
} from '../utils/dateUtils';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  
  // Section 4 States (Join Tabs)
  const [joinTab, setJoinTab] = useState('code'); // 'code', 'qr', 'login'
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [homeLookupQuery, setHomeLookupQuery] = useState('');
  
  const verificationPortalUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VERIFICATION_PORTAL_URL) || 'https://verify.mscprpcem.tech';

  // Dynamic Data States (Fetched from backend)
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Fallback contenders ensuring top 5 spots (Top 3 + Runner Ups #4 and #5) are always fully displayed
  const DEFAULT_LEADERBOARD = [
    { id: 'lb-1', name: 'Pradnya Bharsakale', college: 'PRPCEM Amravati', score: 20, is_authenticated: true },
    { id: 'lb-2', name: 'Rachi Ramaji Mandhare', college: 'PRPCEM Amravati', score: 20, is_authenticated: true },
    { id: 'lb-3', name: 'Hindavi Pravin Tekade', college: 'PRPCEM Amravati', score: 20, is_authenticated: true },
    { id: 'lb-4', name: 'Pranav Bhagat', college: 'PRPCEM Amravati', score: 20, is_authenticated: true },
    { id: 'lb-5', name: 'Shrawani Giri', college: 'PRPCEM Amravati', score: 20, is_authenticated: true }
  ];

  const displayLeaderboard = (() => {
    const isTest = (p) => {
      const n = (p?.name || '').toLowerCase().trim();
      const e = (p?.email || '').toLowerCase().trim();
      if (!n && !e) return true;
      const terms = ['test', 'tester', 'dummy', 'sample', 'demo', 'admin', 'trial', 'fake', 'temp', 'asdf', 'qwerty', 'alex rivers', 'sarah connor'];
      return terms.some(t => n.includes(t) || e.includes(t));
    };

    const validFromApi = (leaderboard || []).filter(p => !isTest(p));
    const base = validFromApi.length === 0 ? DEFAULT_LEADERBOARD : validFromApi;
    const merged = [...base];
    if (merged.length < 5) {
      for (let i = merged.length; i < 5; i++) {
        merged.push(DEFAULT_LEADERBOARD[i]);
      }
    }
    const mapped = merged.map(p => {
      let s = Math.round(Number(p.score) || 0);
      // Normalize legacy inflated scores (e.g. 10000) to 1 count per question for beginner level
      if (s >= 50 && p.correctCount && p.correctCount <= 30) {
        s = p.correctCount;
      }
      return { ...p, score: s };
    });

    return mapped.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
  })();

  // Section 10 States (FAQ Accordion Multi-Open Map)
  const [openFaqs, setOpenFaqs] = useState({});

  const handleHomeLookupSubmit = (e) => {
    e.preventDefault();
    const raw = (homeLookupQuery || '').trim();
    if (!raw) {
      window.open(verificationPortalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Direct URL support
    if (/^https?:\/\//i.test(raw)) {
      window.open(raw, '_blank', 'noopener,noreferrer');
      return;
    }

    const isExplicitHandle = raw.startsWith('@');
    const clean = raw.replace(/^@+/, '').trim();
    if (!clean) {
      window.open(verificationPortalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Credential IDs follow recognized formats:
    // e.g. MSC-..., CERT-..., SYS-..., or standard UUID
    const isCredentialId = !isExplicitHandle && (
      /^msc[-_]/i.test(clean) ||
      /^cert[-_]/i.test(clean) ||
      /^sys[-_]/i.test(clean) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)
    );

    if (isCredentialId) {
      window.open(`${verificationPortalUrl}/verify?id=${encodeURIComponent(clean)}`, '_blank', 'noopener,noreferrer');
    } else {
      // Student handles/usernames (e.g. amityadav1, amityadav, pradnyabharsakale)
      const handle = clean.includes('@') ? clean.split('@')[0] : clean;
      window.open(`${verificationPortalUrl}/u/${encodeURIComponent(handle.toLowerCase())}`, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoadingData(true);
        const [quizzesRes, scheduledRes, leaderboardRes, eventsRes] = await Promise.all([
          api.get('/api/quizzes/public').catch(() => ({ data: [] })),
          api.get('/api/scheduled-quizzes/public/all').catch(() => ({ data: [] })),
          api.get('/api/analytics/public/leaderboard').catch(() => ({ data: { leaderboard: [], recentEvents: [] } })),
          api.get('/api/events').catch(() => ({ data: { events: [] } }))
        ]);

        const allPublicQuizzes = [];
        const availableQuizzesMap = new Map();
        if (Array.isArray(leaderboardRes?.data?.availableQuizzes)) {
          leaderboardRes.data.availableQuizzes.forEach(q => {
            if (q.id) availableQuizzesMap.set(q.id, q);
          });
        }

        // 1. Process Live/Standard Quizzes
        if (Array.isArray(quizzesRes?.data)) {
          quizzesRes.data.forEach((q) => {
            if (!q) return;
            // Exclude archived, cancelled, or disqualified
            if (['archived', 'cancelled', 'disqualified'].includes(q.status)) {
              return;
            }
            const matchedMeta = availableQuizzesMap.get(q.id);
            const pCount = Math.max(Number(q.participantCount) || 0, Number(matchedMeta?.participantCount) || 0);

            allPublicQuizzes.push({
              ...q,
              participantCount: pCount
            });
          });
        }

        // 2. Process Scheduled Quizzes
        if (Array.isArray(scheduledRes?.data)) {
          scheduledRes.data.forEach(sQuiz => {
            if (!sQuiz) return;
            const avail = (sQuiz.availability || '').toUpperCase();
            if (['CANCELLED', 'ARCHIVED'].includes(avail)) {
              return;
            }
            const qId = sQuiz.occurrenceId || sQuiz.quizId;
            const existingIndex = allPublicQuizzes.findIndex(q => q.id === qId || (sQuiz.quizId && q.id === sQuiz.quizId));
            const matchedMeta = availableQuizzesMap.get(sQuiz.quizId || sQuiz.occurrenceId);
            const pCount = Math.max(Number(sQuiz.participantCount) || 0, Number(matchedMeta?.participantCount) || 0);

            if (existingIndex >= 0) {
              allPublicQuizzes[existingIndex].participantCount = Math.max(
                allPublicQuizzes[existingIndex].participantCount || 0,
                pCount
              );
            } else {
              allPublicQuizzes.push({
                ...sQuiz,
                id: qId,
                mode: 'SCHEDULED',
                status: sQuiz.availability === 'ACTIVE' ? 'in_progress' : sQuiz.availability === 'COMPLETED' ? 'completed' : (sQuiz.availability?.toLowerCase() || 'draft'),
                subject: sQuiz.category || 'Technology',
                participantCount: pCount
              });
            }
          });
        }

        // Sort by most recent first: active/live first, then by latest creation / scheduled time
        allPublicQuizzes.sort((a, b) => {
          const aActive = a.status === 'in_progress' || a.status === 'waiting_lobby' ? 1 : 0;
          const bActive = b.status === 'in_progress' || b.status === 'waiting_lobby' ? 1 : 0;
          if (bActive !== aActive) return bActive - aActive;

          const aDate = new Date(a.createdAt || a.scheduled_start || a.startTime || 0).getTime();
          const bDate = new Date(b.createdAt || b.scheduled_start || b.startTime || 0).getTime();
          return bDate - aDate;
        });

        setUpcomingQuizzes(allPublicQuizzes);

        if (leaderboardRes?.data) {
          setLeaderboard(Array.isArray(leaderboardRes.data.leaderboard) ? leaderboardRes.data.leaderboard : []);
        }

        // Process Recent Events: prioritize official events API sorted descending, fallback to leaderboard recentEvents
        let eventsList = [];
        if (Array.isArray(eventsRes?.data?.events) && eventsRes.data.events.length > 0) {
          const sorted = [...eventsRes.data.events].sort((a, b) => {
            const dA = new Date(a.start_date || a.startDate || a.createdAt || 0).getTime();
            const dB = new Date(b.start_date || b.startDate || b.createdAt || 0).getTime();
            return dB - dA;
          });
          eventsList = sorted.map(ev => ({
            id: ev.id,
            title: ev.name || ev.title || 'MSC Technical Event',
            event_name: ev.category || 'Technical Workshop',
            date: ev.start_date || ev.startDate || ev.createdAt,
            players: ev.registration_count || ev.attendeeCount || ev.initial_registration_count || 0,
            status: ev.status || (ev.isEventCompleted ? 'Completed' : 'Upcoming')
          }));
        } else if (Array.isArray(leaderboardRes?.data?.recentEvents)) {
          eventsList = leaderboardRes.data.recentEvents;
        }
        setRecentEvents(eventsList);
      } catch (err) {
        console.error('Fetch homepage data error:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleQuickJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinCode) {
      setJoinError('Please enter a join code.');
      return;
    }
    if (joinCode.length !== 6) {
      setJoinError('Code must be exactly 6 characters.');
      return;
    }
    navigate(`/join/${joinCode.toUpperCase()}`);
  };

  const scrollSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (idx) => {
    setOpenFaqs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const features = [
    { title: 'Interactive Live Quiz', desc: 'Syncs questions instantly on all participant screens via WebSockets.', icon: Play, color: 'blue' },
    { title: 'Scheduled Quizzes', desc: 'Time-window availability, recurring slots, and independent attempts.', icon: Calendar, color: 'emerald' },
    { title: 'Real-Time Leaderboards', desc: 'Rankings update dynamically after every question based on speed & accuracy.', icon: Trophy, color: 'purple' },
    { title: 'Instant Analytics', desc: 'Detailed scorecards and question breakdown analytics provided immediately.', icon: Award, color: 'amber' },
    { title: 'Proctoring & Anti-Cheat', desc: 'Academic integrity protected via focus-loss & tab-switch violation trackers.', icon: Lock, color: 'red' }
  ];

  const faqs = [
    { 
      q: 'How do I join a live quiz or scheduled assessment?', 
      a: 'Enter the 6-digit room code or event link slug in the Join Quiz section at the top of the page, or scan the event QR code using your smartphone camera.' 
    },
    { 
      q: 'Do I need to register or create an account to participate?', 
      a: 'You can quickly join live quiz lobbies as a guest by entering your name and college ID. However, signing in with your MSC Student Account ensures your scores, certificates, and podium badges are permanently linked to your profile.' 
    },
    { 
      q: 'What happens if my network disconnects during an active quiz?', 
      a: 'Our real-time WebSocket reconnect engine allows you to resume your attempt immediately. Simply refresh your browser or re-enter the room code to rejoin from the current question.' 
    },
    { 
      q: 'How are scores calculated and winners ranked on the leaderboard?', 
      a: 'Points are awarded for correct answers weighted by question difficulty (1x Beginner, 2x Intermediate, 3x Advanced). Tie-breaks are decided by faster cumulative response speed and fewer focus violations.' 
    },
    { 
      q: 'How do I verify and download my participation certificate?', 
      a: 'All event certificates are cryptographically verifiable with SHA-256 hashes. Enter your student handle (e.g., @amityadav) or credential ID in the Official Verification Portal section below to inspect or download your verified PDF.' 
    },
    { 
      q: 'What is the anti-cheat and focus protection system?', 
      a: 'To guarantee academic fairness during competitions, our system monitors full-screen lock and window blur / tab-switch violations. Exceeding allowed violation tolerances automatically locks or submits the session.' 
    },
    { 
      q: 'Can I practice questions before official club competitions?', 
      a: 'Yes! Check out our Courses and Practice hub to access curated tracks, including the interactive In-Browser SQL Lab, Cloud Fundamentals, and FAANG interview prep modules.' 
    },
    { 
      q: 'Can I participate using a smartphone or tablet?', 
      a: 'Absolutely. The platform is responsive, fast, and works seamlessly on all modern mobile and desktop browsers with no app download required.' 
    }
  ];

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5FAFF] relative overflow-hidden pb-12">
      
      {/* Background ambient mesh glow circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/15 blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-400/15 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-[140px]"></div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-3.5 sm:px-6 space-y-12 sm:space-y-24 relative z-10 py-6 sm:py-16">

        {/* ════════ 1. HERO SECTION ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center text-left">
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-brand-textMain tracking-tight leading-tight sm:leading-[1.15]">
              Microsoft Student Club PRPCEM <br/>
              <span className="text-brand-blue bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent">
                Quiz Platform
              </span>
            </h1>

            <p className="text-xs sm:text-base text-brand-textMuted leading-relaxed">
              Participate in quizzes conducted during club events. Compete, learn, and excel. Built for students, developers, and tech enthusiasts.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button 
                onClick={() => scrollSection('join-quiz')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer text-xs uppercase tracking-wide"
              >
                <span>Join Quiz</span>
                <Play size={13} fill="currentColor" />
              </button>
              <button 
                onClick={() => scrollSection('upcoming-quizzes')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white hover:bg-zinc-50 border border-brand-border text-brand-textMain font-bold py-3.5 px-6 rounded-xl shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer text-xs uppercase tracking-wide"
              >
                <span>Upcoming Events</span>
                <Calendar size={13} />
              </button>
            </div>
          </div>

          <div id="join-quiz" className="lg:col-span-5 w-full text-left">
            <div className="bg-white border border-brand-border rounded-2xl shadow-soft relative overflow-hidden">
              {/* Tabs Header */}
              <div className="grid grid-cols-2 border-b border-brand-border bg-zinc-50">
                <button 
                  onClick={() => { setJoinTab('code'); setJoinError(''); }}
                  className={`py-2.5 sm:py-3 px-2 text-center text-xs font-bold leading-tight transition-all border-b-2 cursor-pointer ${joinTab === 'code' ? 'border-brand-blue text-brand-blue bg-white' : 'border-transparent text-brand-textMuted hover:text-brand-textMain'}`}
                >
                  Enter Join Code
                </button>
                <button 
                  onClick={() => { setJoinTab('qr'); setJoinError(''); }}
                  className={`py-2.5 sm:py-3 px-2 text-center text-xs font-bold leading-tight transition-all border-b-2 cursor-pointer ${joinTab === 'qr' ? 'border-brand-blue text-brand-blue bg-white' : 'border-transparent text-brand-textMuted hover:text-brand-textMain'}`}
                >
                  Scan QR Code
                </button>
              </div>

              <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                {joinError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-3.5 py-2 rounded-xl text-xs font-semibold animate-fade-in">
                    {joinError}
                  </div>
                )}

                {joinTab === 'code' && (
                  <form onSubmit={handleQuickJoinSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="quizCode" className="block text-[10px] font-bold text-brand-textMuted uppercase tracking-widest">
                        6-Digit Quiz Code
                      </label>
                      <input
                        id="quizCode"
                        type="text"
                        maxLength={6}
                        placeholder="ABC123"
                        value={joinCode}
                        onChange={(e) => {
                          setJoinCode(e.target.value.toUpperCase());
                          setJoinError('');
                        }}
                        className="block w-full border rounded-xl py-3 sm:py-3.5 px-3 sm:px-4 text-center font-black text-lg sm:text-xl tracking-[0.2em] sm:tracking-[0.35em] text-brand-textMain uppercase transition-all duration-200 placeholder:text-zinc-300 focus:bg-white focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10 home-join-card-bg"
                      />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer text-xs uppercase tracking-wider">
                      Join Quiz
                    </button>
                  </form>
                )}

                {joinTab === 'qr' && (
                  <div className="py-2">
                    <QRScanner onScanSuccess={(scannedCode) => navigate(`/join/${scannedCode}`)} />
                  </div>
                )}

                {joinTab === 'login' && (
                  <div className="text-center space-y-4 py-3">
                    <p className="text-xs text-brand-textMuted">Are you pre-registered for the event? Login to access your active event lobby.</p>
                    <button 
                      onClick={() => navigate('/login')}
                      className="flex items-center justify-center space-x-1.5 px-6 py-2.5 mx-auto bg-white border border-brand-border text-brand-blue hover:text-brand-dark hover:bg-zinc-50 font-bold rounded-xl shadow-sm transition-all active:scale-95 text-xs"
                    >
                      <span>Login Credentials</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ════════ 3. RECENT QUIZZES ════════ */}
        <div id="upcoming-quizzes" className="space-y-8 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-textMain tracking-tight">Recent Quizzes</h2>
            <p className="text-brand-textMuted text-xs sm:text-sm">Explore recent and active challenges conducted by Microsoft Student Club PRPCEM.</p>
          </div>
          
          {upcomingQuizzes.length === 0 ? (
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-violet-50/30 border border-blue-200/50 rounded-2xl p-6 sm:p-8 shadow-[0_10px_25px_-5px_rgba(59,130,246,0.05)] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden text-left group w-full">
              <div className="absolute top-0 left-0 h-full w-[4px] bg-gradient-to-b from-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(59,130,246,0.25)]"></div>
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-400/5 rounded-full blur-2xl group-hover:bg-blue-400/10 transition-all duration-500"></div>

              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 w-full md:w-auto">
                <svg className="w-16 h-16 text-brand-blue/25 shrink-0" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 6" className="animate-[spin_40s_linear_infinite]" />
                  <rect x="70" y="65" width="60" height="65" rx="8" fill="white" stroke="#3B82F6" strokeWidth="3" className="shadow-sm" />
                  <rect x="70" y="65" width="60" height="18" rx="2" fill="#3B82F6" />
                  <circle cx="85" cy="74" r="2.5" fill="white" />
                  <circle cx="115" cy="74" r="2.5" fill="white" />
                  <line x1="80" y1="95" x2="120" y2="95" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="80" y1="108" x2="120" y2="108" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                  <g className="animate-[bounce_2.5s_ease-in-out_infinite]">
                    <circle cx="135" cy="85" r="14" fill="white" stroke="#8B5CF6" strokeWidth="2" />
                    <path d="M131 80H139L135 85L131 80Z" fill="#8B5CF6" />
                    <path d="M131 90H139L135 85L131 90Z" fill="#8B5CF6" />
                  </g>
                </svg>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                    <span className="inline-flex items-center gap-1.5 bg-blue-100/60 border border-blue-200/50 px-3 py-1 rounded-full text-brand-blue">
                      <span className="text-[10px] font-black uppercase tracking-wider">Lobbies Cleared</span>
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-black text-brand-textMain tracking-tight leading-tight">
                      No Quizzes Scheduled Right Now
                    </h3>
                    <p className="text-xs text-brand-textMuted max-w-lg leading-relaxed">
                      We are currently curating new learning tracks and workshop challenges. Click Notify Me to get alerts immediately when slots open!
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  const foot = document.querySelector('footer');
                  if (foot) foot.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer text-xs uppercase tracking-wider relative z-10 flex-shrink-0"
              >
                <span>Notify Me</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingQuizzes.slice(0, 6).map((q) => {
                if (!q) return null;
                const startDate = q.scheduled_start || q.startTime ? new Date(q.scheduled_start || q.startTime) : new Date(q.createdAt || Date.now());
                const endDate = q.scheduled_end || q.endTime ? new Date(q.scheduled_end || q.endTime) : null;
                const day = isNaN(startDate.getTime()) ? '15' : getISTDay(startDate);
                const month = isNaN(startDate.getTime()) ? 'AUG' : getISTMonthShort(startDate);
                const startTimeStr = isNaN(startDate.getTime()) ? '10:00 AM' : formatToISTTimeString(startDate);
                const endTimeStr = endDate && !isNaN(endDate.getTime()) ? formatToISTTimeString(endDate) : null;
                const qSlug = q.slug || (q.title ? q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : q.join_code);

                const isQuizEnded = Boolean(
                  q.status === 'completed' ||
                  q.status === 'ended' ||
                  q.status === 'closed' ||
                  (q.availability && ['COMPLETED', 'CLOSED', 'ARCHIVED'].includes(String(q.availability).toUpperCase())) ||
                  (endDate && !isNaN(endDate.getTime()) && Date.now() > endDate.getTime())
                );

                return (
                  <div key={q.id || Math.random()} className="bg-white border border-brand-border rounded-2xl shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col xs:flex-row overflow-hidden group">
                    
                    <div className="w-full xs:w-20 sm:w-24 py-3 xs:py-0 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-white flex flex-row xs:flex-col justify-center items-center gap-2 xs:gap-0 text-blue-900 shrink-0 border-b xs:border-b-0 xs:border-r border-blue-100/80 relative">
                      <div className="hidden xs:block absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#F4F8FC] rounded-full border border-brand-border/60"></div>
                      <div className="hidden xs:block absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#F4F8FC] rounded-full border border-brand-border/60"></div>
                      
                      <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-blue-600">{month}</span>
                      <span className="text-xl xs:text-2xl sm:text-3xl font-black xs:mt-1.5 leading-none text-slate-800">{day}</span>
                    </div>

                    <div className="flex-grow p-5 sm:p-6 text-left flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-bold text-brand-blue uppercase bg-brand-lightBlue px-2.5 py-1 rounded-full border border-brand-blue/5 truncate max-w-[130px] sm:max-w-none">
                              {q.event_name || 'MSC Event'}
                            </span>
                            <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                              {q.subject || 'Technical'}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded border border-zinc-200/50 uppercase whitespace-nowrap">
                            <User size={10} />
                            <span>{q.participantCount || 0} Joined</span>
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="text-sm sm:text-base font-black text-brand-textMain leading-snug group-hover:text-brand-blue transition-colors duration-250">
                            {q.title || 'Live Quiz Challenge'}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-textMuted pt-1 font-medium">
                            <span className="flex items-center gap-1"><BookOpen size={12} className="text-brand-blue" /> {q.questionCount || 0} Questions</span>
                            <span className="flex items-center gap-1 text-slate-700 font-bold"><Calendar size={12} className="text-brand-blue" /> Start: {startTimeStr}</span>
                            {endTimeStr && (
                              <span className="flex items-center gap-1 text-emerald-600 font-bold"><Clock size={12} /> End: {endTimeStr}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-brand-border pt-4 flex justify-between items-center">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${
                          isQuizEnded
                            ? 'text-slate-500 bg-slate-100 border border-slate-200'
                            : q.status === 'in_progress'
                              ? 'text-emerald-600 bg-emerald-50 border border-emerald-100'
                              : q.status === 'waiting_lobby'
                                ? 'text-blue-600 bg-blue-50 border border-blue-100'
                                : 'text-indigo-600 bg-indigo-50 border border-indigo-100'
                        }`}>
                          {isQuizEnded ? 'Quiz Ended' : q.status === 'in_progress' ? 'Live Now' : q.status === 'waiting_lobby' ? 'Lobby Open' : 'Scheduled'}
                        </span>

                        {!isQuizEnded ? (
                          <button
                            onClick={() => navigate(q.mode === 'SCHEDULED' || q.occurrenceId ? `/q/${q.custom_slug || q.slug || qSlug}` : `/join/${q.join_code}`)}
                            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer text-[10px] uppercase tracking-wider"
                          >
                            <span>Join Quiz</span>
                            <ArrowRight size={10} />
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 bg-slate-50 rounded border border-slate-100">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}


        </div>

        {/* ════════ 5. PLATFORM FEATURES ════════ */}
        <div className="space-y-8 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-textMain tracking-tight">Platform Features</h2>
            <p className="text-brand-textMuted text-xs sm:text-sm">A simplified overview of key functionalities supporting our events.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 items-stretch">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              const configs = {
                blue: { iconClass: 'icon-grad-blue', dot: 'bg-blue-500' },
                purple: { iconClass: 'icon-grad-purple', dot: 'bg-purple-500' },
                amber: { iconClass: 'icon-grad-amber', dot: 'bg-amber-500' },
                emerald: { iconClass: 'icon-grad-emerald', dot: 'bg-emerald-500' },
                red: { iconClass: 'icon-grad-red', dot: 'bg-red-500' }
              };
              const c = configs[feat.color] || configs.blue;

              return (
                <div 
                  key={idx} 
                  className="feature-card-glow rounded-2xl p-5 flex flex-col justify-between h-full min-h-[170px] text-left group relative overflow-hidden opacity-0 animate-fade-in shadow-2xs"
                  style={{ animationDelay: `${(idx + 1) * 80}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="absolute top-4 right-4 flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${c.dot}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`}></span>
                  </div>

                  <div className="space-y-4 relative z-10 flex flex-col justify-between h-full">
                    <div className={`w-11 h-11 ${c.iconClass} rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <Icon size={19} className="stroke-[2.5]" />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-brand-textMain leading-tight">{feat.title}</h4>
                      <p className="text-xs text-brand-textMuted leading-relaxed font-medium">{feat.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ════════ 6. HOW IT WORKS ════════ */}
        <div className="space-y-12 text-left relative overflow-hidden">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-textMain tracking-tight">How It Works</h2>
            <p className="text-brand-textMuted text-xs sm:text-sm">Follow these 4 simple steps to participate and validate your success.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-[44px] left-10 right-10 h-[2px] bg-gradient-to-r from-blue-200 via-indigo-200 to-emerald-200 pointer-events-none z-0"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              {[
                { num: '01', title: 'Register for Event', desc: 'Secure your seat for the active workshop or tournament on the official MSC-PRPCEM portal to receive check-in access.', icon: Calendar, color: 'text-blue-500 bg-blue-50/50 border-blue-100' },
                { num: '02', title: 'Join Quiz Lobby', desc: 'Access the console, enter the 6-digit lobby code, and check in with your registered student credentials.', icon: Play, color: 'text-indigo-500 bg-indigo-50/50 border-indigo-100' },
                { num: '03', title: 'Answer Questions', desc: 'Tackle synchronous multi-choice questions in real-time. Speed and accuracy maximize your score weights!', icon: Zap, color: 'text-amber-500 bg-amber-50/50 border-amber-100' },
                { num: '04', title: 'Review Leaderboard', desc: 'Review final leaderboard podium places and celebration rankings.', icon: Award, color: 'text-emerald-500 bg-emerald-50/50 border-emerald-100' }
              ].map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <div 
                    key={idx} 
                    className="bg-white border border-brand-border rounded-2xl p-6 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 hover:border-brand-blue/30 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group opacity-0 animate-fade-in"
                    style={{ animationDelay: `${(idx + 1) * 120}ms`, animationFillMode: 'forwards' }}
                  >
                    <span className="text-7xl font-black text-zinc-100/50 absolute -bottom-2 -right-1 pointer-events-none select-none group-hover:text-brand-blue/5 group-hover:-translate-y-1 transition-all duration-300">
                      {step.num}
                    </span>

                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.color} shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          <IconComponent size={20} className="stroke-[2.5]" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 border border-zinc-100 px-2.5 py-0.5 rounded">
                          Step {step.num}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs sm:text-sm font-black text-brand-textMain uppercase tracking-wider">{step.title}</h4>
                        <p className="text-xs text-brand-textMuted leading-relaxed pr-2 font-medium">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ════════ 7. LEADERBOARD PREVIEW ════════ */}
        <div className="space-y-6 sm:space-y-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-brand-textMain tracking-tight">Top Performers</h2>
              <p className="text-brand-textMuted text-xs sm:text-sm">Recognizing top scoring members across live quizzes and scheduled tests.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/leaderboard')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition-all shadow-xs w-fit cursor-pointer active:scale-98"
              >
                <Trophy size={14} />
                <span>View Full Leaderboard</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMatrixModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-brand-border bg-white hover:bg-brand-bgLight text-brand-blue text-xs font-extrabold transition-all shadow-xs w-fit cursor-pointer active:scale-98"
              >
                <Info size={14} />
                <span>Scoring Matrix & Rules</span>
              </button>
            </div>
          </div>

          <div className="leaderboard-grid-wrapper">
              
              {/* Top 3 Performers Podium */}
              <div className="leaderboard-top3-container">
                
                {/* 2nd Place */}
                {displayLeaderboard[1] && (
                  <div className="medalist-card medalist-card-silver order-2 sm:order-1">
                    <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-slate-200 shadow-sm mb-3">
                      Overall #2
                    </span>
                    <div className="flex flex-col items-center space-y-3.5 w-full">
                      <div className="medalist-avatar-silver">
                        <div className="medalist-avatar-inner">{getInitials(displayLeaderboard[1].name)}</div>
                      </div>
                      <div className="space-y-0.5 text-center w-full px-1">
                        <h4 className="font-extrabold text-zinc-900 text-xs sm:text-sm line-clamp-1 max-w-[170px] sm:max-w-none mx-auto" title={displayLeaderboard[1].name}>
                          {displayLeaderboard[1].name || 'Participant'}
                        </h4>
                        <p className="text-[10px] font-semibold text-zinc-500">{displayLeaderboard[1].college || 'MSC Member'}</p>
                        {displayLeaderboard[1].totalTimeSeconds ? (
                          <p className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            ⏱ {displayLeaderboard[1].totalTimeSeconds}s
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <span className="score-capsule score-capsule-silver">{displayLeaderboard[1].score || 0} pts</span>
                  </div>
                )}

                {/* 1st Place */}
                {displayLeaderboard[0] && (
                  <div className="medalist-card medalist-card-gold order-1 sm:order-2">
                    <span className="inline-flex items-center justify-center bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm mb-3">
                      👑 Overall #1
                    </span>
                    <div className="flex flex-col items-center space-y-3.5 w-full">
                      <div className="medalist-avatar-gold">
                        <div className="medalist-avatar-inner medalist-avatar-inner-gold">{getInitials(displayLeaderboard[0].name)}</div>
                      </div>
                      <div className="space-y-0.5 text-center w-full px-1">
                        <h4 className="font-extrabold text-zinc-900 text-xs sm:text-sm md:text-base line-clamp-1 max-w-[180px] sm:max-w-none mx-auto" title={displayLeaderboard[0].name}>
                          {displayLeaderboard[0].name || 'Participant'}
                        </h4>
                        <p className="text-[10px] font-semibold text-zinc-500">{displayLeaderboard[0].college || 'MSC Member'}</p>
                        {displayLeaderboard[0].totalTimeSeconds ? (
                          <p className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            ⏱ {displayLeaderboard[0].totalTimeSeconds}s
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <span className="score-capsule score-capsule-gold">{displayLeaderboard[0].score || 0} pts</span>
                  </div>
                )}

                {/* 3rd Place */}
                {displayLeaderboard[2] && (
                  <div className="medalist-card medalist-card-bronze order-3 sm:order-3">
                    <span className="inline-flex items-center justify-center bg-orange-50 text-orange-800 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-orange-200 shadow-sm mb-3">
                      Overall #3
                    </span>
                    <div className="flex flex-col items-center space-y-3.5 w-full">
                      <div className="medalist-avatar-bronze">
                        <div className="medalist-avatar-inner medalist-avatar-inner-bronze">{getInitials(displayLeaderboard[2].name)}</div>
                      </div>
                      <div className="space-y-0.5 text-center w-full px-1">
                        <h4 className="font-extrabold text-zinc-900 text-xs sm:text-sm line-clamp-1 max-w-[170px] sm:max-w-none mx-auto" title={displayLeaderboard[2].name}>
                          {displayLeaderboard[2].name || 'Participant'}
                        </h4>
                        <p className="text-[10px] font-semibold text-zinc-500">{displayLeaderboard[2].college || 'MSC Member'}</p>
                        {displayLeaderboard[2].totalTimeSeconds ? (
                          <p className="text-[9px] font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            ⏱ {displayLeaderboard[2].totalTimeSeconds}s
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <span className="score-capsule score-capsule-bronze">{displayLeaderboard[2].score || 0} pts</span>
                  </div>
                )}

              </div>

              {/* Runner Ups #4 and #5 */}
              <div className="leaderboard-runnerups-container">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Runner Ups</h4>
                    <span className="text-[10px] font-bold text-brand-blue bg-brand-lightBlue px-2 py-0.5 rounded-full">Top 5</span>
                  </div>
                  <div className="space-y-3">
                    {displayLeaderboard.slice(3, 5).map((player, idx) => {
                      if (!player) return null;
                      return (
                        <div key={idx} className="leaderboard-runnerup-row group">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-black text-[10px] group-hover:bg-brand-blue group-hover:text-white transition-colors duration-200">
                              {idx + 4}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-black text-[10px] group-hover:scale-105 transition-transform duration-200">
                              {getInitials(player.name)}
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-xs text-brand-textMain leading-tight">{player.name || 'Participant'}</p>
                              <p className="text-[9px] text-brand-textMuted mt-0.5">{player.college || 'MSC Member'}</p>
                            </div>
                          </div>
                          <span className="font-black text-xs text-brand-blue bg-brand-lightBlue px-2.5 py-1 rounded-full border border-brand-blue/10">{player.score || 0} pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>

        {/* ── SCORING & DIFFICULTY MATRIX MODAL ── */}
        {showMatrixModal && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowMatrixModal(false)}
          >
            <div 
              className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden text-left animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-white border-b border-slate-200 px-6 py-5 text-slate-900 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200">
                    <Trophy size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Leaderboard Scoring & Rules Matrix</h3>
                    <p className="text-slate-500 text-xs font-medium">Standardized Evaluation Engine for MSC Quizzes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMatrixModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                
                {/* 1. Difficulty Multipliers */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-brand-lightBlue text-brand-blue font-black text-xs flex items-center justify-center">1</span>
                    <h4 className="font-extrabold text-sm text-brand-textMain">Standardized Evaluation & Question Multipliers</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">🟢 Beginner / Easy</span>
                      <p className="text-base font-black text-emerald-900">1 Count / Q</p>
                      <p className="text-[11px] text-emerald-700 font-medium">1.0x Weight (Clean 1:1 Standard)</p>
                    </div>
                    <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">🟡 Intermediate</span>
                      <p className="text-base font-black text-amber-900">2 Counts / Q</p>
                      <p className="text-[11px] text-amber-700 font-medium">2.0x Weight Multiplier</p>
                    </div>
                    <div className="bg-rose-50/70 border border-rose-200/80 p-3.5 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">🔴 Hard / Advanced</span>
                      <p className="text-base font-black text-rose-900">3 Counts / Q</p>
                      <p className="text-[11px] text-rose-700 font-medium">3.0x Weight Multiplier</p>
                    </div>
                  </div>
                </div>

                {/* 2. Mode Evaluation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 font-black text-xs flex items-center justify-center">2</span>
                    <h4 className="font-extrabold text-sm text-brand-textMain">Live Quiz vs. Scheduled Test Scoring</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-brand-blue uppercase">
                        <Zap size={14} />
                        <span>Live Synchronous Quiz</span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                        Points = <span className="font-bold text-zinc-800">1 pt per question (Beginner)</span>. Normalized from legacy 10,000 inflated scale so each question represents a clean, transparent score.
                      </p>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 uppercase">
                        <Clock size={14} />
                        <span>Scheduled Assessment</span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                        Points = <span className="font-bold text-zinc-800">Correct Questions Count</span>. Time taken in seconds serves as the primary tie-breaker for podium rankings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Verified Student vs Guest */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center">3</span>
                    <h4 className="font-extrabold text-sm text-brand-textMain">Verified Student vs. Guest Eligibility</h4>
                  </div>
                  <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl space-y-2 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-slate-900">Verified Logged-in Students:</strong> Automatically accumulate platform XP, gain rankings on the Global Hall of Fame, and are eligible for verified digital badges.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <User size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-slate-900">Guest Players:</strong> Can join live rounds without logging in and view real-time in-room scores. Logging in links past achievements permanently.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Tie-Breaking Hierarchy */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 font-black text-xs flex items-center justify-center">4</span>
                    <h4 className="font-extrabold text-sm text-brand-textMain">Tie-Breaking Hierarchy</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-semibold">
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Priority 1</p>
                      <p className="text-slate-800 font-extrabold mt-0.5">Total Score</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Priority 2</p>
                      <p className="text-slate-800 font-extrabold mt-0.5">Accuracy Count</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Priority 3</p>
                      <p className="text-slate-800 font-extrabold mt-0.5">Speed / Time</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Priority 4</p>
                      <p className="text-slate-800 font-extrabold mt-0.5">Fewest Violations</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-zinc-50 border-t border-zinc-100 p-4 px-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowMatrixModal(false)}
                  className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-dark text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  Got It, Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ════════ 8. RECENT EVENTS ════════ */}
        <div className="space-y-8 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-textMain tracking-tight">Recent Events</h2>
            <p className="text-brand-textMuted text-xs sm:text-sm">Summary of successfully completed quiz challenges.</p>
          </div>

          {recentEvents.length === 0 ? (
            <div className="bg-white border border-brand-border rounded-2xl p-8 sm:p-10 text-center space-y-3 shadow-soft">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 shadow-sm">
                <Calendar size={28} />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-brand-textMain">No Recent Events Recorded</h3>
              <p className="text-xs sm:text-sm text-brand-textMuted max-w-md mx-auto leading-relaxed">
                Summaries of completed workshops and quiz challenges will be recorded here automatically once sessions end.
              </p>
            </div>
          ) : (
            <div className="recent-events-grid">
              {recentEvents.slice(0, 6).map((event, idx) => {
                if (!event) return null;
                const dateStr = formatToISTDateString(event.date);
                return (
                  <div key={idx} className="recent-event-card">
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{dateStr}</span>
                      <h4 className="text-sm font-bold text-brand-textMain">{event.title || 'Completed Event'}</h4>
                      <div className="flex gap-4 text-[11px] text-brand-textMuted mt-1">
                        <span>👥 Participants: <span className="font-bold text-brand-textMain">{event.players || 0}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
                      <Check size={11} className="stroke-[3]" />
                      <span>Completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ════════ 9. VERIFICATION PORTAL & PROFILE SEARCH ════════ */}
        <div className="bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/50 text-brand-textMain rounded-3xl p-6 sm:p-10 shadow-soft relative overflow-hidden text-left border border-blue-200/80">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs">
                <ShieldCheck size={14} className="text-blue-600" />
                <span>Official Verification Engine</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Verify Student Profiles & Digital Certificates
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed font-medium">
                All MSC credentials, event completions, and student rank profiles are cryptographically verifiable on the MSC-PRPCEM Verification Portal.
              </p>

              <div className="flex flex-wrap gap-4 text-xs pt-1">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-[10px]">✓</div>
                  <span>Instant Public Handle Search</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-[10px]">✓</div>
                  <span>Tamper-proof SHA-256 Hashes</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/90 backdrop-blur-md border border-blue-200/80 p-5 sm:p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">Search Profile or Certificate</h3>
                <p className="text-[11px] text-slate-500 font-medium">Enter a student handle (e.g. <span className="text-blue-600 font-mono font-bold">@amityadav</span>) or Credential ID</p>
              </div>

              <form onSubmit={handleHomeLookupSubmit} className="space-y-3">
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    placeholder="amityadav or MSC-2026-XXXX"
                    value={homeLookupQuery}
                    onChange={(e) => setHomeLookupQuery(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 font-mono font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Search size={13} />
                    <span>Search Profile</span>
                  </button>

                  <a
                    href={verificationPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200 shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <span>Open Portal</span>
                    <ExternalLink size={13} className="text-slate-500" />
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ════════ 10. FAQ SECTION ════════ */}
        <div className="max-w-5xl mx-auto w-full text-left space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-textMain tracking-tight">FAQ</h2>
            <p className="text-brand-textMuted text-xs sm:text-sm">Common questions about joining events and earning credentials.</p>
          </div>

          <div className="faq-grid-container">
            {faqs.map((faq, idx) => {
              const isOpen = Boolean(openFaqs[idx]);
              return (
                <div key={idx} className={`faq-accordion-item ${isOpen ? 'faq-accordion-item-active' : ''}`}>
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="faq-question-btn"
                  >
                    <div className="flex items-center">
                      <span className="faq-badge-q">Q</span>
                      <span className="faq-question-text">{faq.q}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-blue' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="faq-answer-panel">
                      <div className="flex items-start">
                        <span className="faq-badge-a">A</span>
                        <p className="flex-1 mt-0.5">{faq.a}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate('/faq')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-500 text-blue-600 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
            >
              <span>Have more questions? Read Full Documentation & FAQ</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
