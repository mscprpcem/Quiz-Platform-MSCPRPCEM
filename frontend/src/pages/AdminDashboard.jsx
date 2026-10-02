import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Play,
  Calendar,
  AlertTriangle,
  QrCode,
  BarChart2,
  Users,
  BookOpen,
  X,
  Copy,
  Download,
  Share2,
  Check,
  Award,
  ShieldCheck,
  RefreshCw,
  Clock,
  Database,
  CheckCircle2,
  ExternalLink,
  Search
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Quizzes list state
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // QR Sharing Modal State
  const [qrQuiz, setQrQuiz] = useState(null);
  const [showCatalogQRModal, setShowCatalogQRModal] = useState(false);
  const [catalogCopyFeedback, setCatalogCopyFeedback] = useState(false);
  const [catalogCopyCodeFeedback, setCatalogCopyCodeFeedback] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyJoinCode = (code, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  // Branding config
  const [branding, setBranding] = useState(null);

  // Navigation Tabs: 'quizzes' | 'reach' | 'completions'
  const [activeTab, setActiveTab] = useState('quizzes');
  const [practiceActivity, setPracticeActivity] = useState(null);
  const [courseCompletions, setCourseCompletions] = useState([]);
  const [loadingPractice, setLoadingPractice] = useState(false);
  const [releasingEmail, setReleasingEmail] = useState(null);
  const [certFilter, setCertFilter] = useState('all'); // 'all' | 'pending' | 'released'

  // Load practice reach & certificate completions
  const loadPracticeActivity = async () => {
    try {
      setLoadingPractice(true);
      const [actRes, compRes] = await Promise.all([
        api.get('/api/analytics/practice-activity').catch(() => ({ data: null })),
        api.get('/api/student/course-completions').catch(() => ({ data: { completions: [] } }))
      ]);
      if (actRes?.data) setPracticeActivity(actRes.data);
      if (compRes?.data?.completions) setCourseCompletions(compRes.data.completions);
    } catch (e) {
      console.warn('Practice activity fetch error:', e);
    } finally {
      setLoadingPractice(false);
    }
  };

  const handleReleaseCertificate = async (email, courseTitle) => {
    try {
      setReleasingEmail(email);
      const res = await api.post('/api/student/release-certificate', { email, courseTitle });
      if (res.data?.success) {
        alert(res.data.message || `Certificate released for ${email}!`);
        loadPracticeActivity();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to release certificate.');
    } finally {
      setReleasingEmail(null);
    }
  };

  // Load quizzes (all=true fetches both Live and Scheduled)
  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/quizzes?all=true');
      const list = response.data || [];
      setQuizzes(list);

      // Check if there is an active session currently running
      const session = list.find(
        (q) =>
          (q.mode === 'LIVE' || (!q.mode && !q.schedule_type)) &&
          (q.status === 'waiting_lobby' || q.status === 'in_progress')
      );
      setActiveSession(session || null);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load branding config
  const loadBranding = async () => {
    try {
      const res = await api.get('/api/branding');
      setBranding(res.data);
    } catch (err) {
      console.error('Error loading branding:', err);
    }
  };

  useEffect(() => {
    loadQuizzes();
    loadBranding();
    loadPracticeActivity();
  }, []);

  // Lock background scroll whenever QR popup modal is open
  useEffect(() => {
    if (showCatalogQRModal && qrQuiz) {
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const mainContainers = document.querySelectorAll('main, .overflow-y-auto');
      const originalMainOverflows = Array.from(mainContainers).map((el) => el.style.overflow);
      mainContainers.forEach((el) => {
        el.style.overflow = 'hidden';
      });

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        mainContainers.forEach((el, idx) => {
          el.style.overflow = originalMainOverflows[idx] || '';
        });
      };
    }
  }, [showCatalogQRModal, qrQuiz]);

  // QR Modal helpers
  const handleOpenCatalogQR = (quiz) => {
    setQrQuiz(quiz);
    setCatalogCopyFeedback(false);
    setShowCatalogQRModal(true);
  };

  const handleCatalogCopyLink = () => {
    if (!qrQuiz) return;
    const url = `${window.location.protocol}//${window.location.host}/join/${qrQuiz.join_code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCatalogCopyFeedback(true);
      setTimeout(() => setCatalogCopyFeedback(false), 2000);
    });
  };

  const handleCatalogShareSession = () => {
    if (!qrQuiz) return;
    const url = `${window.location.protocol}//${window.location.host}/join/${qrQuiz.join_code}`;
    if (navigator.share) {
      navigator
        .share({
          title: qrQuiz.title,
          text: `Join my quiz "${qrQuiz.title}" by scanning the QR or using the link!`,
          url: url
        })
        .catch((err) => console.log('Error sharing:', err));
    } else {
      handleCatalogCopyLink();
    }
  };

  // Helper to draw branded QR card on canvas and download
  const drawBrandedCard = (ctx, qrImage, quizData, brandData, logoImg) => {
    const W = 400;
    const H = 650;

    const getValidColor = (hex, fallback = '#2563EB') => {
      if (!hex || typeof hex !== 'string') return fallback;
      const cleaned = hex.trim();
      return /^#[0-9A-F]{6}$/i.test(cleaned) || /^#[0-9A-F]{3}$/i.test(cleaned) ? cleaned : fallback;
    };

    const colorToRgba = (hex, alpha, fallback = '#2563EB') => {
      const color = getValidColor(hex, fallback);
      let c = color.substring(1);
      if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const primaryColor = getValidColor(brandData?.primary_color);
    const rawClub = (brandData?.club_name || 'Microsoft Student Club').trim();
    const rawChap = (brandData?.chapter_name || 'PRPCEM').trim();

    let clubName = rawClub.replace(/\s+PRPCEM$/i, '').trim() || 'Microsoft Student Club';
    let chapterName =
      rawChap
        .replace(/^Microsoft\s+Student\s+Club\s*/i, '')
        .replace(/^MSC[-\s]*/i, '')
        .replace(/\s*chapter\s*/gi, '')
        .trim() || 'PRPCEM';

    clubName = clubName.toUpperCase();
    chapterName = chapterName.toUpperCase();
    const footerText = brandData?.footer_text || 'Powered by Microsoft Student Club PRPCEM Quiz Platform';

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Top gradient bar
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, primaryColor);
    grad.addColorStop(0.5, colorToRgba(primaryColor, 0.8));
    grad.addColorStop(1, primaryColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 8);

    // Logo
    if (logoImg) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(200, 34, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(logoImg, 178, 12, 44, 44);
    } else {
      ctx.fillStyle = '#f25022';
      ctx.fillRect(188, 18, 11, 11);
      ctx.fillStyle = '#7fba00';
      ctx.fillRect(201, 18, 11, 11);
      ctx.fillStyle = '#00a4ef';
      ctx.fillRect(188, 31, 11, 11);
      ctx.fillStyle = '#ffb900';
      ctx.fillRect(201, 31, 11, 11);
    }

    // Club & Chapter
    ctx.fillStyle = '#323130';
    ctx.font = 'bold 13px Inter, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(clubName, 200, 75);

    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 11px Inter, "Segoe UI", sans-serif';
    ctx.fillText(chapterName, 200, 95);

    // Separator
    ctx.strokeStyle = '#edebe9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 115);
    ctx.lineTo(360, 115);
    ctx.stroke();

    // Quiz Title
    ctx.fillStyle = '#201f1e';
    ctx.font = 'bold 16px Inter, "Segoe UI", sans-serif';
    const titleText = (quizData.title || '').toUpperCase();
    ctx.fillText(titleText.length > 35 ? titleText.slice(0, 35) + '...' : titleText, 200, 140);

    // Event name
    ctx.fillStyle = '#605e5c';
    ctx.font = '600 10px Inter, "Segoe UI", sans-serif';
    ctx.fillText((quizData.event_name || '').toUpperCase(), 200, 160);

    // QR frame
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(80, 185, 240, 240);
    ctx.strokeStyle = '#edebe9';
    ctx.strokeRect(80, 185, 240, 240);

    // QR image
    ctx.drawImage(qrImage, 90, 195, 220, 220);

    // Scan instructions
    ctx.fillStyle = '#605e5c';
    ctx.font = '600 11px Inter, "Segoe UI", sans-serif';
    ctx.fillText('Scan with camera or visit:', 200, 455);

    // Join URL
    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 12px Inter, "Segoe UI", sans-serif';
    const joinUrl = `${window.location.origin}/join/${quizData.join_code}`;
    ctx.fillText(joinUrl, 200, 478);

    // Code box
    ctx.fillStyle = '#f3f2f1';
    ctx.fillRect(80, 505, 240, 70);
    ctx.strokeStyle = '#edebe9';
    ctx.strokeRect(80, 505, 240, 70);

    ctx.fillStyle = '#605e5c';
    ctx.font = 'bold 9px Inter, "Segoe UI", sans-serif';
    ctx.fillText('UNIQUE JOIN CODE', 200, 525);

    ctx.fillStyle = primaryColor;
    ctx.font = '900 28px Inter, "Segoe UI", sans-serif';
    ctx.fillText(quizData.join_code, 200, 560);

    // Footer
    ctx.fillStyle = '#a19f9d';
    ctx.font = 'bold 8px Inter, "Segoe UI", sans-serif';
    ctx.fillText(footerText, 200, 610);

    // Bottom gradient bar
    ctx.fillStyle = grad;
    ctx.fillRect(0, H - 4, W, 4);
  };

  const handleCatalogDownloadQR = (elementId) => {
    if (!qrQuiz) return;
    const svgElement = document.getElementById(elementId);
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const logoSrc = branding?.logo_path
      ? branding.logo_path.startsWith('http')
        ? branding.logo_path
        : `/${branding.logo_path}`
      : null;

    const image = new Image();
    image.onload = () => {
      const drawCard = (logoImg) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 650;
        const ctx = canvas.getContext('2d');

        drawBrandedCard(ctx, image, qrQuiz, branding, logoImg);

        const png = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = png;
        downloadLink.download = `quiz-${qrQuiz.join_code}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };

      if (logoSrc) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => drawCard(logoImg);
        logoImg.onerror = () => drawCard(null);
        logoImg.src = logoSrc;
      } else {
        drawCard(null);
      }
    };
    image.src = blobURL;
  };

  // Status helper
  const getStatusBadge = (quiz) => {
    const isScheduled = quiz.mode === 'SCHEDULED' || !!quiz.schedule_type;
    if (quiz.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <CheckCircle2 size={10} className="text-slate-500" />
          <span>Completed</span>
        </span>
      );
    }
    if (isScheduled) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
          <Calendar size={10} className="text-indigo-600" />
          <span>Scheduled</span>
        </span>
      );
    }
    if (quiz.status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Live Now</span>
        </span>
      );
    }
    if (quiz.status === 'waiting_lobby') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={10} className="text-amber-600" />
          <span>In Lobby</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300/80">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        <span>Draft</span>
      </span>
    );
  };

  // Filtered quizzes by search query
  const filteredQuizzes = useMemo(() => {
    if (!searchQuery.trim()) return quizzes;
    const q = searchQuery.toLowerCase().trim();
    return quizzes.filter(
      (quiz) =>
        (quiz.title || '').toLowerCase().includes(q) ||
        (quiz.event_name || '').toLowerCase().includes(q) ||
        (quiz.join_code || '').toLowerCase().includes(q)
    );
  }, [quizzes, searchQuery]);

  // Filtered completions
  const filteredCompletions = useMemo(() => {
    if (certFilter === 'pending') return courseCompletions.filter((c) => c.certificateStatus !== 'released');
    if (certFilter === 'released') return courseCompletions.filter((c) => c.certificateStatus === 'released');
    return courseCompletions;
  }, [courseCompletions, certFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-8 text-left">
      {/* ── 1. HEADER BAR (CLEAN & BALANCED) ── */}
      <div className="dashboard-header-card p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Admin Session Center</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Monitor real-time lobbies, launch live quizzes, and verify student completions.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              loadQuizzes();
              loadPracticeActivity();
            }}
            disabled={loading || loadingPractice}
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={14} className={loading || loadingPractice ? 'animate-spin text-blue-600' : ''} />
          </button>
          <button
            onClick={() => navigate('/admin/quizzes')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center space-x-1.5"
          >
            <span>Manage Quizzes</span>
          </button>
        </div>
      </div>

      {/* ── 2. BALANCED SEGMENTED TABS (LINEAR / MACOS STYLE) ── */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 overflow-x-auto">
        <div className="dashboard-tabs-track">
          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`dashboard-tab-btn ${
              activeTab === 'quizzes'
                ? 'dashboard-tab-btn-active'
                : 'dashboard-tab-btn-inactive'
            }`}
          >
            <Play size={12} fill="currentColor" />
            <span>Live & Scheduled Sessions</span>
            <span className="dashboard-tab-badge">{quizzes.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reach')}
            className={`dashboard-tab-btn ${
              activeTab === 'reach'
                ? 'dashboard-tab-btn-active'
                : 'dashboard-tab-btn-inactive'
            }`}
          >
            <BarChart2 size={13} />
            <span>Practice Reach</span>
            <span className="dashboard-tab-badge">{practiceActivity?.uniqueStudents || 0}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completions')}
            className={`dashboard-tab-btn ${
              activeTab === 'completions'
                ? 'dashboard-tab-btn-active'
                : 'dashboard-tab-btn-inactive'
            }`}
          >
            <Award size={13} />
            <span>Course Certificates</span>
            <span className="dashboard-tab-badge">{courseCompletions.length}</span>
          </button>
        </div>
      </div>

      {/* ── 3. ACTIVE LIVE QUIZ ALERT ── */}
      {activeTab === 'quizzes' && activeSession && (
        <div className="dashboard-active-banner p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0"></span>
            <div className="text-xs">
              <span className="font-bold text-amber-950">Active Live Quiz Detected: </span>
              <span className="font-semibold text-amber-900">"{activeSession.title}"</span>
              <span className="text-amber-800 ml-1.5 font-mono uppercase font-bold text-[11px] bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/60">
                {activeSession.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/admin/run-quiz/${activeSession.id}`)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 active:scale-95 shadow-xs"
          >
            <Play size={11} fill="currentColor" />
            <span>Go to Control Room</span>
          </button>
        </div>
      )}

      {/* ── 4. TAB 1: QUIZZES CATALOG (COMPACT CARDS & CLEAN SEARCH) ── */}
      {activeTab === 'quizzes' && (
        <div className="space-y-3.5">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title, event, or join code..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredQuizzes.length} of {quizzes.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-white border border-slate-200 rounded-xl">
              Loading quizzes...
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-white border border-dashed border-slate-200 rounded-xl">
              No quizzes found. Click "Manage Quizzes" to configure.
            </div>
          ) : (
            /* ── MODERN, POLISHED CARDS GRID ── */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredQuizzes.map((quiz) => {
                const isScheduled = quiz.mode === 'SCHEDULED' || !!quiz.schedule_type;
                const isLive = !isScheduled;
                const isLiveActive =
                  isLive && (quiz.status === 'in_progress' || quiz.status === 'waiting_lobby');

                return (
                  <div
                    key={quiz.id}
                    className="dashboard-quiz-card p-3.5 flex flex-col justify-between group"
                  >
                    {/* Top micro-gradient indicator line on hover */}
                    <div className="dashboard-card-top-accent" />

                    <div className="space-y-2">
                      {/* Top Event Tag & Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="dashboard-event-pill"
                          title={quiz.event_name || 'General Event'}
                        >
                          {quiz.event_name || 'General Event'}
                        </span>
                        {getStatusBadge(quiz)}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3
                          className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug"
                          title={quiz.title}
                        >
                          {quiz.title}
                        </h3>
                        <p
                          className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium leading-relaxed"
                          title={quiz.description}
                        >
                          {quiz.description || 'Interactive quiz session'}
                        </p>
                      </div>

                      {/* Unified Join Code Chip + Telemetry Counters */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/90 text-xs">
                        {/* Interactive Code & QR Group */}
                        <div className="dashboard-code-group">
                          <button
                            type="button"
                            onClick={(e) => handleCopyJoinCode(quiz.join_code, e)}
                            className="inline-flex items-center space-x-1.5 px-1.5 py-0.5 rounded text-xs transition-colors hover:text-blue-600 cursor-pointer"
                            title="Click to copy join code"
                          >
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Code</span>
                            <span className="font-mono font-black text-xs text-slate-800">
                              {quiz.join_code}
                            </span>
                            {copiedCode === quiz.join_code ? (
                              <Check size={11} className="text-emerald-500 ml-0.5 animate-fadeIn" />
                            ) : (
                              <Copy size={11} className="text-slate-400 ml-0.5 hover:text-slate-600 transition-colors" />
                            )}
                          </button>
                          <span className="w-px h-3.5 bg-slate-200" />
                          <button
                            type="button"
                            onClick={() => handleOpenCatalogQR(quiz)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-all cursor-pointer"
                            title="Share / Save QR Poster"
                          >
                            <QrCode size={13} />
                          </button>
                        </div>

                        {/* Telemetry Stats */}
                        <div className="flex items-center space-x-2.5 text-slate-500 font-semibold text-xs">
                          <span className="flex items-center space-x-1" title="Question Count">
                            <BookOpen size={12} className="text-blue-600/70" />
                            <span className="text-slate-700 font-bold">{quiz.questionCount || 0}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Qs</span>
                          </span>
                          <span className="flex items-center space-x-1" title="Total Plays">
                            <Users size={12} className="text-indigo-600/70" />
                            <span className="text-slate-700 font-bold">{quiz.participantCount || 0}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Plays</span>
                          </span>
                        </div>
                      </div>

                      {/* Anti-cheat violations flag (only visible when > 0) */}
                      {(quiz.violationCount || 0) > 0 && (
                        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200/70 text-rose-700 text-[10px] font-bold">
                          <AlertTriangle size={11} className="text-rose-500 shrink-0" />
                          <span>
                            {quiz.violationCount} {quiz.violationCount === 1 ? 'Violation' : 'Violations'} Flagged
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Symmetrical 50/50 Action Buttons Footer */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100/90 mt-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/analytics/${quiz.id}`)}
                        className="dashboard-btn-secondary"
                        title="View Detailed Analytics"
                      >
                        <BarChart2 size={13} className="text-slate-500" />
                        <span>Analytics</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            isScheduled
                              ? `/admin/scheduled-quizzes/${quiz.id}`
                              : `/admin/run-quiz/${quiz.id}`
                          )
                        }
                        className={`dashboard-btn-primary ${
                          isLiveActive
                            ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 animate-pulse'
                            : isScheduled
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/15'
                            : quiz.status === 'completed'
                            ? 'bg-slate-800 hover:bg-slate-900'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/15'
                        }`}
                      >
                        {isLiveActive ? (
                          <>
                            <Play size={11} fill="currentColor" />
                            <span>Control Room</span>
                          </>
                        ) : isScheduled ? (
                          <>
                            <Calendar size={11} />
                            <span>Manage</span>
                          </>
                        ) : quiz.status === 'completed' ? (
                          <>
                            <CheckCircle2 size={11} />
                            <span>Results</span>
                          </>
                        ) : (
                          <>
                            <Play size={11} fill="currentColor" />
                            <span>Run Live</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 5. TAB 2: PRACTICE REACH ANALYTICS ── */}
      {activeTab === 'reach' && (
        <div className="space-y-4">
          {/* Simple 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-500">Unique SQL Learners</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {practiceActivity?.uniqueStudents || practiceActivity?.totalLearners || 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Students accessing interactive SQL lab</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-500">Active Learners Today</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {practiceActivity?.activeToday ?? 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Active in the last 24 hours</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-500">Engine Mode</div>
              <div className="text-2xl font-bold text-purple-700 mt-1 flex items-center space-x-1.5">
                <Database size={18} />
                <span>Client WASM</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero server compute — in-browser SQLite</p>
            </div>
          </div>

          {/* Clean Learners Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Registered SQL Learners
                </h3>
                <p className="text-[11px] text-slate-400">Activity telemetry from interactive queries</p>
              </div>
              <button
                type="button"
                onClick={loadPracticeActivity}
                disabled={loadingPractice}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
              >
                <RefreshCw size={11} className={loadingPractice ? 'animate-spin text-blue-600' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-3.5 py-2.5">Learner</th>
                    <th className="px-3.5 py-2.5">Email</th>
                    <th className="px-3.5 py-2.5 text-center">Sessions</th>
                    <th className="px-3.5 py-2.5">Last Active</th>
                    <th className="px-3.5 py-2.5 text-right">Engine Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {!practiceActivity?.learners || practiceActivity.learners.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs">
                        No SQL learner telemetry recorded yet.
                      </td>
                    </tr>
                  ) : (
                    practiceActivity.learners.map((lrn, idx) => (
                      <tr key={lrn.id || lrn.studentEmail || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3.5 py-2.5 font-bold text-slate-900">
                          <div className="flex items-center space-x-1.5">
                            <span>{lrn.studentName || 'Student Learner'}</span>
                            {lrn.studentUsername && (
                              <a
                                href={`https://verify.mscprpcem.tech/u/${encodeURIComponent(lrn.studentUsername)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-600 font-mono hover:underline"
                              >
                                @{lrn.studentUsername}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-600 font-mono text-[11px]">{lrn.studentEmail}</td>
                        <td className="px-3.5 py-2.5 text-center font-bold text-slate-700">
                          {lrn.sessionCount || 1}
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-500 text-[11px]">
                          {lrn.lastActive ? new Date(lrn.lastActive).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recently'}
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            Client WASM
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. TAB 3: COURSE COMPLETION & CERTIFICATE RELEASE ── */}
      {activeTab === 'completions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {['all', 'pending', 'released'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCertFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    certFilter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f === 'all' ? 'All Records' : f === 'pending' ? 'Pending Approval' : 'Released'}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Total {filteredCompletions.length} records
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-3.5 py-2.5">Student Name</th>
                    <th className="px-3.5 py-2.5">Email</th>
                    <th className="px-3.5 py-2.5">Course</th>
                    <th className="px-3.5 py-2.5 text-center">Score / Solved</th>
                    <th className="px-3.5 py-2.5">Completed Date</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCompletions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                        No course completion records found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCompletions.map((comp) => (
                      <tr key={comp.id || comp.email} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3.5 py-2.5 font-bold text-slate-900">
                          <div>{comp.name}</div>
                          {comp.username && (
                            <span className="text-[10px] text-blue-600 font-mono">@{comp.username}</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-slate-600 text-[11px]">{comp.email}</td>
                        <td className="px-3.5 py-2.5 font-bold text-slate-800">{comp.courseTitle}</td>
                        <td className="px-3.5 py-2.5 text-center font-mono font-bold text-blue-700">
                          {comp.challengesSolved ? `${comp.challengesSolved} Solved` : `${comp.score}%`}
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-500 text-[11px]">
                          {comp.completedAt ? new Date(comp.completedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-3.5 py-2.5">
                          {comp.certificateStatus === 'released' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              <ShieldCheck size={11} />
                              <span>Released</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
                              <Clock size={11} />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          {comp.certificateStatus === 'released' ? (
                            <a
                              href={comp.verificationUrl || `https://verify.mscprpcem.tech/verify/${comp.certificateId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                            >
                              <span>Verify</span>
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReleaseCertificate(comp.email, comp.courseTitle)}
                              disabled={releasingEmail === comp.email}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              {releasingEmail === comp.email ? 'Releasing...' : 'Release'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. FULLSCREEN QR CODE MODAL (PORTALED TO BODY TO PREVENT SCROLL BREAK) ── */}
      {qrQuiz && showCatalogQRModal && createPortal(
        <div
          onClick={() => {
            setShowCatalogQRModal(false);
            setQrQuiz(null);
          }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer overflow-hidden animate-fade-in"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-[280px] w-full relative cursor-default overflow-hidden text-slate-800 animate-scale-in my-auto"
          >
            <div className="h-1 w-full bg-blue-600" />

            <button
              onClick={() => {
                setShowCatalogQRModal(false);
                setQrQuiz(null);
              }}
              className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer z-20"
            >
              <X size={12} strokeWidth={3} />
            </button>

            <div className="px-4 pt-4 pb-3 text-center space-y-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate pr-6">
                {qrQuiz.event_name}
              </p>

              <div className="inline-block bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
                <QRCodeSVG
                  id="dashboard-catalog-qr-svg"
                  value={`${window.location.protocol}//${window.location.host}/join/${qrQuiz.join_code}`}
                  size={150}
                  level="H"
                  includeMargin={false}
                  imageSettings={
                    branding?.logo_path
                      ? {
                          src: branding.logo_path.startsWith('http')
                            ? branding.logo_path
                            : `/${branding.logo_path}`,
                          x: undefined,
                          y: undefined,
                          height: branding?.qr_logo_size || 26,
                          width: branding?.qr_logo_size || 26,
                          excavate: true
                        }
                      : undefined
                  }
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Join Code</span>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-xl font-black font-mono tracking-widest text-blue-600 select-all">
                    {qrQuiz.join_code}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(qrQuiz.join_code).then(() => {
                        setCatalogCopyCodeFeedback(true);
                        setTimeout(() => setCatalogCopyCodeFeedback(false), 2000);
                      });
                    }}
                    className="p-1 hover:bg-slate-200 text-slate-500 rounded cursor-pointer"
                    title="Copy Join Code"
                  >
                    {catalogCopyCodeFeedback ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-3 py-2 grid grid-cols-3 gap-1.5 text-center">
              <button
                onClick={handleCatalogCopyLink}
                className="flex flex-col items-center gap-0.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold cursor-pointer"
              >
                {catalogCopyFeedback ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{catalogCopyFeedback ? 'Copied' : 'Link'}</span>
              </button>
              <button
                onClick={() => handleCatalogDownloadQR('dashboard-catalog-qr-svg')}
                className="flex flex-col items-center gap-0.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold cursor-pointer"
              >
                <Download size={12} />
                <span>Save</span>
              </button>
              <button
                onClick={handleCatalogShareSession}
                className="flex flex-col items-center gap-0.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold cursor-pointer"
              >
                <Share2 size={12} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
