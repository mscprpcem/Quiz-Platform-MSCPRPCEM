import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { formatToISTDateTimeString } from '../utils/dateUtils';
import {
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  BarChart2,
  ListCollapse,
  Calendar,
  AlertCircle,
  AlertTriangle,
  FileUp,
  X,
  Share2,
  Copy,
  Download,
  Check,
  QrCode,
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  Sparkles,
  Globe,
  Award,
  ExternalLink,
  Radio,
  Play,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import EventSelector from '../components/EventSelector';
import IssueBadgeModal from '../components/IssueBadgeModal';
import './QuizManagement.css';

/* ── Status badge helper ── */
function StatusBadge({ status, violationCount = 0 }) {
  if (status === 'completed') {
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
        violationCount > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-zinc-150 text-zinc-650 border border-zinc-250'
      }`}>
        <AlertTriangle size={10} className={violationCount > 0 ? "text-rose-600" : "text-zinc-500"} />
        <span>{violationCount} {violationCount === 1 ? 'Violation' : 'Violations'}</span>
      </span>
    );
  }
  const map = {
    draft: 'bg-blue-50 text-blue-700 border border-blue-200',
    in_progress: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    waiting_lobby: 'bg-amber-50 text-amber-700 border border-amber-200',
  };
  const cls = map[status] || map.draft;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${cls}`}>
      {status === 'in_progress' ? 'Live' : status === 'waiting_lobby' ? 'Lobby' : status.replace('_', ' ')}
    </span>
  );
}

/* ── Modal overlay wrapper ── */
function Modal({ onClose, children }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-h-[92vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export default function QuizManagement() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [qrQuiz, setQrQuiz] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Delete Confirmation States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetQuiz, setDeleteTargetQuiz] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Issue Badge Modal State
  const [badgeModalQuiz, setBadgeModalQuiz] = useState(null);

  // Prevent background scrolling while any modal is open
  useEffect(() => {
    if (showCreateModal || showImportModal || showQRModal || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal, showImportModal, showQRModal, showDeleteModal]);

  // Form States
  const [quizForm, setQuizForm] = useState({
    title: '',
    event_name: '',
    description: '',
    scheduled_start: '',
    scheduled_end: '',
    issue_badge: false,
    badge_sys_id: '',
    badge_title: 'Certified Specialist'
  });
  const [availableBadges, setAvailableBadges] = useState([]);
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Branding config
  const [branding, setBranding] = useState(null);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/quizzes?mode=LIVE');
      setQuizzes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBranding = async () => {
    try {
      const res = await api.get('/api/branding');
      setBranding(res.data);
    } catch (err) {
      console.error('Error loading branding:', err);
    }
  };

  const handlePublishQuiz = async (quizId) => {
    try {
      await api.put(`/api/quizzes/${quizId}/publish`);
      loadQuizzes();
    } catch (err) {
      console.error(err);
    }
  };

  const [nowTick, setNowTick] = useState(Date.now());

  const isQuizExpired = (q) => {
    if (q.status === 'completed') return true;
    if (q.scheduled_end && new Date(q.scheduled_end).getTime() < nowTick) return true;
    return false;
  };

  useEffect(() => {
    loadQuizzes();
    loadBranding();
    
    const fetchBadges = async () => {
      try {
        const res = await api.get('/api/student/available-badges');
        if (res.data?.badges && Array.isArray(res.data.badges)) {
          setAvailableBadges(res.data.badges);
        }
      } catch (err) {
        console.warn('Failed to load badges list:', err);
      }
    };
    fetchBadges();

    const interval = setInterval(() => {
      setNowTick(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDateForInput = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleSetOneDaySchedule = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const startStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const endStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T23:59`;
    setQuizForm((p) => ({ ...p, scheduled_start: startStr, scheduled_end: endStr }));
  };

  const handleOpenCreate = (quiz = null) => {
    if (quiz) {
      setSelectedQuiz(quiz);
      setIsSlugCustomized(Boolean(quiz.custom_slug));
      setQuizForm({
        title: quiz.title,
        custom_slug: quiz.custom_slug || '',
        event_name: quiz.event_name,
        description: quiz.description || '',
        scheduled_start: formatDateForInput(quiz.scheduled_start),
        scheduled_end: formatDateForInput(quiz.scheduled_end),
        issue_badge: Boolean(quiz.badge_title || quiz.badge_sys_id),
        badge_sys_id: quiz.badge_sys_id || '',
        badge_title: quiz.badge_title || (availableBadges[0]?.title || 'Certified Specialist')
      });
    } else {
      setSelectedQuiz(null);
      setIsSlugCustomized(false);
      setQuizForm({
        title: '',
        custom_slug: '',
        event_name: '',
        description: '',
        scheduled_start: '',
        scheduled_end: '',
        issue_badge: false,
        badge_sys_id: availableBadges[0]?.id || '',
        badge_title: availableBadges[0]?.title || 'Certified Specialist'
      });
    }
    setFormError('');
    setShowCreateModal(true);
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title || !quizForm.event_name) {
      setFormError('Quiz Title and Event Name are required fields.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...quizForm,
        badge_sys_id: quizForm.issue_badge ? (quizForm.badge_sys_id || null) : null,
        badge_title: quizForm.issue_badge ? (quizForm.badge_title || `${quizForm.title || 'MSC Quiz'} Certified Specialist`) : null
      };
      if (selectedQuiz) {
        await api.put(`/api/quizzes/${selectedQuiz.id}`, payload);
      } else {
        await api.post('/api/quizzes', payload);
      }
      setShowCreateModal(false);
      loadQuizzes();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save quiz. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteModal = (quiz) => {
    setDeleteTargetQuiz(quiz);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetQuiz) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/api/quizzes/${deleteTargetQuiz.id}`);
      setShowDeleteModal(false);
      setDeleteTargetQuiz(null);
      loadQuizzes();
    } catch (err) {
      alert('Error deleting quiz session. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Copy Link Helper
  const handleCopyLink = () => {
    if (!qrQuiz) return;
    const url = `${window.location.protocol}//${window.location.host}/join/${qrQuiz.join_code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  // Share Helper
  const handleShareSession = () => {
    if (!qrQuiz) return;
    const url = `${window.location.protocol}//${window.location.host}/join/${qrQuiz.join_code}`;
    if (navigator.share) {
      navigator.share({
        title: qrQuiz.title,
        text: `Join my live quiz "${qrQuiz.title}" by scanning the QR or using the link!`,
        url: url
      }).catch((err) => console.log('Error sharing:', err));
    } else {
      handleCopyLink();
    }
  };

  // Download QR Code Helper (branded)
  const handleDownloadQR = (elementId) => {
    if (!qrQuiz) return;
    const svgElement = document.getElementById(elementId);
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const getValidColor = (hex, fallback = '#2563EB') => {
      if (!hex || typeof hex !== 'string') return fallback;
      const cleaned = hex.trim();
      const isValid = /^#[0-9A-F]{6}$/i.test(cleaned) || /^#[0-9A-F]{3}$/i.test(cleaned);
      return isValid ? cleaned : fallback;
    };

    const colorToRgba = (hex, alpha, fallback = '#2563EB') => {
      const color = getValidColor(hex, fallback);
      let c = color.substring(1);
      if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      }
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const primaryColor = getValidColor(branding?.primary_color);
    const rawClub = (branding?.club_name || 'Microsoft Student Club').trim();
    const rawChap = (branding?.chapter_name || 'PRPCEM').trim();

    let clubName = rawClub.replace(/\s+PRPCEM$/i, '').trim();
    if (!clubName) clubName = 'Microsoft Student Club';

    let chapterName = rawChap
      .replace(/^Microsoft\s+Student\s+Club\s*/i, '')
      .replace(/^MSC[-\s]*/i, '')
      .replace(/\s*chapter\s*/gi, '')
      .trim();

    if (!chapterName) chapterName = 'PRPCEM';

    clubName = clubName.toUpperCase();
    chapterName = chapterName.toUpperCase();
    const footerText = branding?.footer_text || 'Powered by Microsoft Student Club PRPCEM Quiz Platform';
    const logoSrc = branding?.logo_path ? (branding.logo_path.startsWith('http') ? branding.logo_path : `/${branding.logo_path}`) : null;

    const image = new Image();
    image.onload = () => {
      const drawCard = (logoImg) => {
        const canvas = document.createElement('canvas');
        const W = 400;
        const H = 650;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, W, H);

        // Flowing wave/grid pattern (Azure AI style)
        ctx.strokeStyle = colorToRgba(primaryColor, 0.07); // very light opacity
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.bezierCurveTo(100, 50, 300, 250, W, 150);
        ctx.stroke();

        ctx.strokeStyle = colorToRgba(primaryColor, 0.03);
        ctx.beginPath();
        ctx.moveTo(0, 480);
        ctx.bezierCurveTo(100, 550, 300, 380, W, 480);
        ctx.stroke();

        // Decorative dot grid pattern
        ctx.globalAlpha = 0.03;
        for (let x = 0; x < W; x += 16) {
          for (let y = 0; y < H; y += 16) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fillStyle = primaryColor;
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;

        // Stylized background nodes
        ctx.fillStyle = colorToRgba(primaryColor, 0.06);
        ctx.beginPath();
        ctx.arc(40, 180, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(360, 520, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(330, 220, 6, 0, Math.PI * 2);
        ctx.fill();

        // Top bar
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

        ctx.fillStyle = '#323130';
        ctx.font = 'bold 13px Inter, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(clubName, 200, 75);

        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 11px Inter, "Segoe UI", sans-serif';
        ctx.fillText(chapterName, 200, 95);

        ctx.strokeStyle = '#edebe9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 115);
        ctx.lineTo(360, 115);
        ctx.stroke();

        ctx.fillStyle = '#201f1e';
        ctx.font = 'bold 16px Inter, "Segoe UI", sans-serif';
        const titleText = qrQuiz.title.toUpperCase();
        ctx.fillText(titleText.length > 35 ? titleText.slice(0, 35) + '...' : titleText, 200, 140);

        ctx.fillStyle = '#605e5c';
        ctx.font = '600 10px Inter, "Segoe UI", sans-serif';
        ctx.fillText(qrQuiz.event_name.toUpperCase(), 200, 160);

        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(80, 185, 240, 240);
        ctx.strokeStyle = '#edebe9';
        ctx.strokeRect(80, 185, 240, 240);
        ctx.drawImage(image, 90, 195, 220, 220);

        // Center Logo in QR code
        if (logoImg) {
          const logoSize = branding?.qr_logo_size !== undefined ? branding.qr_logo_size : 28;
          const L = Math.round(logoSize * 1.375);
          const radius = Math.round(L / 2) + 3;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(200, 305, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.drawImage(logoImg, 200 - Math.round(L / 2), 305 - Math.round(L / 2), L, L);
        }

        ctx.fillStyle = '#605e5c';
        ctx.font = '600 11px Inter, "Segoe UI", sans-serif';
        ctx.fillText('Scan with camera or visit:', 200, 455);

        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 12px Inter, "Segoe UI", sans-serif';
        ctx.fillText(`${window.location.origin}/join/${qrQuiz.join_code}`, 200, 478);

        ctx.fillStyle = '#f3f2f1';
        ctx.fillRect(80, 505, 240, 70);
        ctx.strokeStyle = '#edebe9';
        ctx.strokeRect(80, 505, 240, 70);

        ctx.fillStyle = '#605e5c';
        ctx.font = 'bold 9px Inter, "Segoe UI", sans-serif';
        ctx.fillText('UNIQUE JOIN CODE', 200, 525);

        ctx.fillStyle = primaryColor;
        ctx.font = '900 28px Inter, "Segoe UI", sans-serif';
        ctx.fillText(qrQuiz.join_code, 200, 560);

        ctx.fillStyle = '#a19f9d';
        ctx.font = 'bold 8px Inter, "Segoe UI", sans-serif';
        ctx.fillText(footerText, 200, 610);

        ctx.fillStyle = grad;
        ctx.fillRect(0, H - 4, W, 4);

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

  // Helper to open QR Modal
  const handleOpenQR = (quiz) => {
    setQrQuiz(quiz);
    setCopyFeedback(false);
    setShowQRModal(true);
  };

  const handleOpenImport = (quiz) => {
    setSelectedQuiz(quiz);
    setUploadFile(null);
    setUploadErrors([]);
    setUploadSuccess('');
    setShowImportModal(true);
  };

  const handleDownloadTemplate = (format = 'xlsx') => {
    const headers = [
      'Question',
      'Option A',
      'Option B',
      'Option C',
      'Option D',
      'Correct Answer',
      'Question Type',
      'Timer',
      'Marks',
      'Explanation'
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers]);
    ws['!cols'] = [
      { wch: 45 },
      { wch: 32 },
      { wch: 32 },
      { wch: 32 },
      { wch: 32 },
      { wch: 18 },
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 45 }
    ];

    if (format === 'csv') {
      const csvOutput = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'quiz_questions_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Questions');
      XLSX.writeFile(wb, 'quiz_questions_template.xlsx');
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
    setUploadErrors([]);
    setUploadSuccess('');
  };

  const handleUploadExcel = async (e) => {
    e.preventDefault();
    if (!uploadFile) { setUploadErrors(['Please select an Excel or CSV file first.']); return; }
    const formData = new FormData();
    formData.append('file', uploadFile);
    try {
      setLoading(true);
      const res = await api.post(`/api/quizzes/${selectedQuiz.id}/import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadSuccess(res.data.message || 'Questions imported successfully!');
      setUploadFile(null);
      await loadQuizzes();
    } catch (err) {
      const errRes = err.response?.data;
      if (errRes?.details && Array.isArray(errRes.details)) {
        setUploadErrors(errRes.details);
      } else {
        setUploadErrors([errRes?.error || 'Failed to upload spreadsheet.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in space-y-6">
        
        {/* Page Header */}
        <div className="quiz-mgmt-header p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Radio size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Live Quiz Catalog
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configure draft question sheets, launch interactive live sessions, or review archives.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="quiz-mgmt-tabs-track">
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`quiz-mgmt-tab-btn ${activeTab === 'active' ? 'quiz-mgmt-tab-btn-active' : ''}`}
              >
                <span>Active & Draft</span>
                <span className="quiz-mgmt-tab-badge">
                  {quizzes.filter(q => q.mode !== 'SCHEDULED' && !isQuizExpired(q)).length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                className={`quiz-mgmt-tab-btn ${activeTab === 'completed' ? 'quiz-mgmt-tab-btn-active' : ''}`}
              >
                <span>Completed</span>
                <span className="quiz-mgmt-tab-badge">
                  {quizzes.filter(q => q.mode !== 'SCHEDULED' && isQuizExpired(q)).length}
                </span>
              </button>
            </div>

            <button
              onClick={() => handleOpenCreate()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Create Live Quiz</span>
            </button>
          </div>
        </div>

        {/* Quiz Grid */}
        {loading && quizzes.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Loading live quizzes...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {quizzes
              .filter(q => q.mode !== 'SCHEDULED')
              .filter(q => activeTab === 'completed' ? isQuizExpired(q) : !isQuizExpired(q))
              .map((quiz) => {
                const isDraft = quiz.status === 'draft';
                const isLive = quiz.status === 'in_progress';
                const isLobby = quiz.status === 'waiting_lobby';

                return (
                  <div
                    key={quiz.id}
                    className="quiz-mgmt-card"
                  >
                    {deleteTargetQuiz?.id === quiz.id ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-3.5 text-center animate-fade-in my-auto">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
                          <Trash2 size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-red-950 truncate">Delete {quiz.title}?</h4>
                          <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                            All question sheets, student submissions, and logs will be permanently erased.
                          </p>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => setDeleteTargetQuiz(null)}
                            className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleConfirmDelete}
                            disabled={deleteLoading}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                          >
                            {deleteLoading ? 'Deleting...' : 'Delete Quiz'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3.5">
                          {/* Top Row: Event name chip & Status */}
                          <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full truncate max-w-[170px]">
                                {quiz.event_name || 'General Quiz'}
                              </span>
                              {quiz.badge_issued_at ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <Award size={10} className="text-emerald-600" />
                                  <span>Badge Issued</span>
                                </span>
                              ) : (quiz.badge_sys_id || quiz.badge_title) ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                  <Award size={10} className="text-amber-600" />
                                  <span>Badge Ready</span>
                                </span>
                              ) : null}
                            </div>
                            <StatusBadge status={quiz.status} violationCount={quiz.violationCount || 0} />
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h3
                              onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                              className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug hover:text-blue-600 transition-colors cursor-pointer truncate"
                              title={quiz.title}
                            >
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                              {quiz.description || 'No description provided.'}
                            </p>
                          </div>

                          {/* Schedule & Telemetry Card */}
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-600">
                              <span className="text-slate-400 font-semibold flex items-center gap-1">
                                <Calendar size={11} className="text-blue-600" /> Start:
                              </span>
                              <span className="font-bold text-slate-800 truncate max-w-[180px]">
                                {quiz.scheduled_start ? `${formatToISTDateTimeString(quiz.scheduled_start)} IST` : 'Flexible / On-Demand'}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200/60 text-center text-xs">
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Questions</span>
                                <span className="font-extrabold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                                  <BookOpen size={11} className="text-blue-600" /> {quiz.questionCount || 0}
                                </span>
                              </div>
                              <div className="border-x border-slate-200/60">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Plays</span>
                                <span className="font-extrabold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                                  <Users size={11} className="text-blue-600" /> {quiz.participantCount || 0}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Violations</span>
                                <span className={`font-extrabold flex items-center justify-center gap-1 mt-0.5 ${(quiz.violationCount || 0) > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                  <AlertTriangle size={11} className={(quiz.violationCount || 0) > 0 ? 'text-rose-500' : 'text-slate-400'} /> {quiz.violationCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons Footer */}
                        <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
                          {/* Row 1: Primary Action & Question Sheet */}
                          <div className="grid grid-cols-2 gap-2">
                            {isLive ? (
                              <button
                                onClick={() => navigate(`/admin/run-quiz/${quiz.id}`)}
                                className="quiz-btn-action-primary"
                                title="Open Live Control Room"
                              >
                                <Play size={12} />
                                <span>Live Room</span>
                              </button>
                            ) : isLobby ? (
                              <button
                                onClick={() => navigate(`/admin/run-quiz/${quiz.id}`)}
                                className="quiz-btn-action-primary"
                                title="Open Participant Lobby"
                              >
                                <Users size={12} />
                                <span>Open Lobby</span>
                              </button>
                            ) : isDraft ? (
                              <button
                                onClick={() => handlePublishQuiz(quiz.id)}
                                className="quiz-btn-action-primary"
                                title="Publish quiz to generate QR & link"
                              >
                                <Globe size={12} />
                                <span>Publish</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate(`/admin/analytics/${quiz.id}`)}
                                className="quiz-btn-action-primary"
                                title="View Performance Analytics"
                              >
                                <BarChart2 size={12} />
                                <span>Analytics</span>
                              </button>
                            )}

                            <button
                              onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                              className="quiz-btn-action"
                              title="Manage Questions Sheet"
                            >
                              <ListCollapse size={12} />
                              <span>Sheet ({quiz.questionCount || 0})</span>
                            </button>
                          </div>

                          {/* Row 2: Secondary Utility Buttons */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenImport(quiz)}
                              className="quiz-btn-action flex-1"
                              title="Import Questions (.xlsx / .csv)"
                            >
                              <FileSpreadsheet size={12} />
                              <span>Import</span>
                            </button>

                            <button
                              onClick={() => handleOpenQR(quiz)}
                              className="quiz-btn-action px-2.5"
                              title="View & Download QR Poster"
                            >
                              <QrCode size={13} />
                            </button>

                            <button
                              onClick={() => setBadgeModalQuiz(quiz)}
                              className={`quiz-btn-action px-2.5 ${quiz.badge_issued_at ? 'text-emerald-750 bg-emerald-50 border-emerald-300' : quiz.badge_sys_id ? 'text-amber-750 bg-amber-50 border-amber-300' : ''}`}
                              title={quiz.badge_issued_at ? 'Badge Issued (Click to manage credentials)' : quiz.badge_sys_id ? 'Badge Configured (Click to issue credentials)' : 'Issue Verification Platform Badge'}
                            >
                              <Award size={13} />
                            </button>

                            <button
                              onClick={() => handleOpenCreate(quiz)}
                              className="quiz-btn-action px-2.5"
                              title="Edit Quiz Details"
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              onClick={() => handleOpenDeleteModal(quiz)}
                              className="quiz-btn-action-danger px-2.5"
                              title="Delete Quiz"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

            {quizzes.length === 0 && !loading && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white border-2 border-dashed border-slate-200 rounded-2xl gap-3 text-center p-6">
                <BookOpen size={36} className="text-slate-300" />
                <div>
                  <p className="text-sm font-bold text-slate-700">No live quizzes found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Click "Create Live Quiz" above to set up a new assessment.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT QUIZ MODAL ── */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-800">
            {/* Modal header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                    {selectedQuiz ? 'Edit Live Quiz' : 'Create New Live Quiz'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedQuiz ? 'Update the quiz session details and parameters below.' : 'Configure parameters for a real-time interactive quiz session.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 max-h-[calc(85vh-120px)] overflow-y-auto space-y-4">
              {formError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form id="live-quiz-details-form" onSubmit={handleSaveQuiz} className="space-y-4">
                {/* Basic Details Group */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Quiz Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={quizForm.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setQuizForm((p) => ({
                          ...p,
                          title: newTitle,
                          custom_slug: isSlugCustomized ? p.custom_slug : autoSlug
                        }));
                      }}
                      placeholder="e.g. Botathon Challenge, Cloud Fundamentals"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Associated Event / Chapter <span className="text-red-500">*</span>
                    </label>
                    <EventSelector
                      value={quizForm.event_name}
                      onChange={({ eventId, eventName }) => {
                        setQuizForm((p) => ({
                          ...p,
                          event_id: eventId,
                          event_name: eventName
                        }));
                      }}
                    />
                    <p className="text-[10.5px] text-slate-400 font-medium mt-1">
                      Assign to an event or chapter track to group this quiz on the official platform portal.
                    </p>
                  </div>
                </div>

                {/* Direct Join URL Vanity Slug */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Direct Join URL Slug
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      Vanity Link
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg whitespace-nowrap font-mono select-none shadow-2xs">
                      quiz.mscprpcem.tech/q/
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. both-on"
                      value={quizForm.custom_slug || ''}
                      onChange={(e) => {
                        setIsSlugCustomized(true);
                        setQuizForm((p) => ({
                          ...p,
                          custom_slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                        }));
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-blue-700 font-mono font-bold text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs"
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium leading-tight">
                    Participants navigating to <strong className="text-blue-700 font-mono">/q/{quizForm.custom_slug || 'preview'}</strong> can enter this live session directly.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={quizForm.description}
                    onChange={(e) => setQuizForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of the topics and agenda covered in this quiz..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Schedule & Time Window */}
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/90">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Quiz Schedule / Time Window
                    </label>
                    <button
                      type="button"
                      onClick={handleSetOneDaySchedule}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 text-blue-600 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <Sparkles size={11} />
                      <span>Set for 1 Day (Today)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        value={quizForm.scheduled_start}
                        onChange={(e) => setQuizForm((p) => ({ ...p, scheduled_start: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">End Date & Time</label>
                      <input
                        type="datetime-local"
                        value={quizForm.scheduled_end}
                        onChange={(e) => setQuizForm((p) => ({ ...p, scheduled_end: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Verified Digital Badge Toggle */}
                <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-amber-500" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Issue Verified Digital Badge</span>
                        <span className="text-[10px] text-slate-500 font-medium">Verification Platform Integration (verify.mscprpcem.tech)</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={quizForm.issue_badge}
                        onChange={(e) => setQuizForm((p) => ({ ...p, issue_badge: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {quizForm.issue_badge && (
                    <div className="pt-3 border-t border-slate-200/70 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Badge Sys ID <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">verify.mscprpcem.tech</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. SYS-BADGE-101, EVENT-CERT-2026"
                          value={quizForm.badge_sys_id || ''}
                          onChange={(e) => setQuizForm((p) => ({ ...p, badge_sys_id: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs font-mono font-bold focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs"
                        />
                        <p className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">
                          This Sys ID matches the badge/credential registered on the Verification Platform.
                        </p>
                      </div>

                      {availableBadges.length > 0 && (
                        <div className="space-y-1">
                          <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                            Quick Select from Available Badges:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {availableBadges.slice(0, 4).map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => setQuizForm(p => ({
                                  ...p,
                                  badge_sys_id: b.id,
                                  badge_title: b.title || p.badge_title
                                }))}
                                className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                                  quizForm.badge_sys_id === b.id
                                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                {b.title || b.id}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">Badge Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Certified Cloud Practitioner"
                          value={quizForm.badge_title}
                          onChange={(e) => setQuizForm((p) => ({ ...p, badge_title: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs"
                        />
                      </div>

                      <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg flex items-start gap-2 text-[10.5px] text-blue-800 font-medium leading-relaxed">
                        <ShieldCheck size={14} className="text-blue-600 shrink-0 mt-0.5" />
                        <span>Admin Permission: After event completion, admins can choose to <strong>Issue Now</strong> or <strong>Save for Later</strong> from the Quiz dashboard.</span>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="live-quiz-details-form"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>{selectedQuiz ? 'Update Live Quiz' : 'Create Live Quiz'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── EXCEL IMPORT MODAL ── */}
      {showImportModal && (
        <Modal onClose={() => setShowImportModal(false)}>
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl border border-zinc-150 overflow-hidden text-zinc-750">
            {/* Modal header */}
            <div className="relative bg-gradient-to-r from-emerald-650 to-emerald-700 px-6 py-5 text-white">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white leading-tight">Import Questions</h2>
                  <p className="text-xs text-white/80 mt-0.5 line-clamp-1">
                    For: <span className="font-semibold text-white">{selectedQuiz?.title}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Template Download Section */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <p className="text-xs font-bold text-emerald-900">Need the official spreadsheet template?</p>
                  <p className="text-[11px] text-emerald-700">Pre-formatted with Single Choice, True/False, and Multi-Select examples.</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('xlsx')}
                    className="flex items-center gap-1 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg text-xs font-extrabold shadow-2xs transition-all cursor-pointer active:scale-95"
                    title="Download Excel Template (.xlsx)"
                  >
                    <FileSpreadsheet size={13} className="text-emerald-600" />
                    <span>.XLSX</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('csv')}
                    className="flex items-center gap-1 bg-white border border-blue-300 text-blue-800 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg text-xs font-extrabold shadow-2xs transition-all cursor-pointer active:scale-95"
                    title="Download CSV Template (.csv)"
                  >
                    <FileText size={13} className="text-blue-600" />
                    <span>.CSV</span>
                  </button>
                </div>
              </div>

              {/* Error panel */}
              {uploadErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs space-y-1 max-h-36 overflow-y-auto">
                  <p className="font-bold flex items-center gap-1.5 mb-2">
                    <AlertCircle size={14} /> Validation Errors ({uploadErrors.length})
                  </p>
                  {uploadErrors.map((err, i) => <p key={i} className="leading-relaxed">• {err}</p>)}
                </div>
              )}

              {/* Success panel */}
              {uploadSuccess && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  {uploadSuccess}
                </div>
              )}

              <form onSubmit={handleUploadExcel} className="space-y-4">
                {/* File drop zone */}
                <label
                  htmlFor="excelFile"
                  className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                    uploadFile
                      ? 'border-emerald-400 bg-emerald-50/50'
                      : 'border-brand-border hover:border-brand-blue/50 bg-brand-bgLight/50 hover:bg-brand-bgLight'
                  }`}
                >
                  <input
                    type="file"
                    id="excelFile"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadFile ? (
                    <>
                      <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
                      <p className="text-sm font-bold text-emerald-750">{uploadFile.name}</p>
                      <p className="text-xs text-emerald-650 mt-1">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <FileUp size={32} className="mx-auto mb-2 text-zinc-450" />
                      <p className="text-sm font-semibold text-zinc-650">Drop your Excel or CSV file here</p>
                      <p className="text-xs text-zinc-450 mt-1">or <span className="text-brand-blue font-bold underline">browse to upload</span></p>
                      <p className="text-[10px] text-brand-textMuted mt-2">Supports .xlsx, .xls, and .csv files</p>
                    </>
                  )}
                </label>

                {/* Supported Question Types Guide */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Supported Question Formats in Spreadsheet
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left text-[11px]">
                    <div className="bg-white border border-slate-200 p-2.5 rounded-lg">
                      <span className="font-extrabold text-blue-700 block">Single Choice</span>
                      <span className="text-slate-500 block text-[10px] mt-0.5">Option A–D filled</span>
                      <span className="text-slate-700 font-bold block text-[10px] mt-0.5">Answer: A (or B, C, D)</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-2.5 rounded-lg">
                      <span className="font-extrabold text-emerald-700 block">True / False</span>
                      <span className="text-slate-500 block text-[10px] mt-0.5">Option A: True, B: False</span>
                      <span className="text-slate-700 font-bold block text-[10px] mt-0.5">Answer: True or False (or A/B)</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-2.5 rounded-lg">
                      <span className="font-extrabold text-purple-700 block">Multi-Select</span>
                      <span className="text-slate-500 block text-[10px] mt-0.5">Multiple correct keys</span>
                      <span className="text-slate-700 font-bold block text-[10px] mt-0.5">Answer: A, C or A, B, D</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-brand-border text-zinc-650 font-semibold text-sm hover:bg-brand-bgLight transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadFile || loading}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-sm"
                  >
                    <FileUp size={15} />
                    {loading ? 'Uploading...' : 'Upload Sheet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* QR CODE SHARE MODAL */}
      {qrQuiz && showQRModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => { setShowQRModal(false); setQrQuiz(null); }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-[280px] w-full relative cursor-default overflow-hidden animate-fade-in border border-slate-200"
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-blue-600" style={{ background: branding?.primary_color || '#2563EB' }} />

            {/* Close button */}
            <button
              onClick={() => { setShowQRModal(false); setQrQuiz(null); }}
              className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer z-20"
            >
              <X size={13} strokeWidth={2.5} />
            </button>

            {/* Content */}
            <div className="px-4 pt-4 pb-3 text-center space-y-3">
              {/* Event name */}
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate pr-6">{qrQuiz.event_name}</p>

              {/* QR Code */}
              <div className="inline-block bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
                <QRCodeSVG
                  id="catalog-qr-svg"
                  value={`${window.location.protocol}//${window.location.host}/join/${qrQuiz.join_code}`}
                  size={160}
                  level="H"
                  includeMargin={false}
                  imageSettings={branding?.logo_path ? {
                    src: branding.logo_path.startsWith('http') ? branding.logo_path : `/${branding.logo_path}`,
                    x: undefined,
                    y: undefined,
                    height: branding?.qr_logo_size || 28,
                    width: branding?.qr_logo_size || 28,
                    excavate: true,
                  } : undefined}
                />
              </div>

              {/* Join Code */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Entry Code</span>
                <span className="block text-2xl font-black tracking-[0.25em] mt-0.5 select-all text-blue-600" style={{ color: branding?.primary_color || '#2563EB' }}>{qrQuiz.join_code}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-slate-100 px-3 py-2.5 grid grid-cols-3 gap-1.5 bg-slate-50/50">
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-all text-[10px] font-bold cursor-pointer shadow-2xs"
              >
                {copyFeedback ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copyFeedback ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleDownloadQR('catalog-qr-svg')}
                className="flex flex-col items-center gap-1 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-all text-[10px] font-bold cursor-pointer shadow-2xs"
              >
                <Download size={13} />
                <span>Save</span>
              </button>
              <button
                onClick={handleShareSession}
                className="flex flex-col items-center gap-1 py-1.5 rounded-lg text-white transition-all text-[10px] font-bold cursor-pointer shadow-xs"
                style={{ backgroundColor: branding?.primary_color || '#2563EB' }}
              >
                <Share2 size={13} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && deleteTargetQuiz && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => { setShowDeleteModal(false); setDeleteTargetQuiz(null); }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex justify-center items-center p-4 cursor-pointer animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200/90 animate-fade-in cursor-default space-y-5 text-left"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center justify-center shrink-0 shadow-2xs">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Quiz Session?</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3.5 space-y-1">
              <p className="text-xs font-black text-rose-950 truncate">{deleteTargetQuiz.title}</p>
              <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
                All participant response sheets, score leaderboards, and session logs will be permanently erased.
              </p>
            </div>

            <div className="flex space-x-3 pt-1">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteTargetQuiz(null); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs flex items-center justify-center space-x-1.5"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── ISSUE BADGE MODAL ── */}
      {badgeModalQuiz && (
        <IssueBadgeModal
          quiz={badgeModalQuiz}
          isOpen={Boolean(badgeModalQuiz)}
          onClose={() => setBadgeModalQuiz(null)}
          onSuccess={() => {
            setBadgeModalQuiz(null);
            loadQuizzes();
          }}
        />
      )}
    </div>
  );
}
