import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ThemeDropdown from '../components/ThemeDropdown';
import {
  Sparkles, Plus, Search, Calendar, MapPin, Globe, Users,
  Trash2, Edit3, ExternalLink, Mail, ArrowRight, ShieldCheck,
  AlertCircle, RefreshCw, X, Radio, BookOpen, Image, Check, Download, FileText,
  Copy, Link as LinkIcon, Upload, CloudUpload, CheckCircle2, Clock, Timer,
  Lock, Unlock, Tag, AlertTriangle, QrCode, Unlink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  downloadBrandedQRCard,
  fetchBrandingConfig,
  getLogoUrl
} from '../utils/qrCardGenerator';

const DEFAULT_SPARK_POSTER = 'https://mscprpcem.blob.core.windows.net/events/clean_529287766.png';

const POSTER_GALLERY = [
  {
    id: 'spark',
    name: 'Spark Flagship Poster (Default)',
    matchKeywords: ['spark', 'inauguration', 'team', 'gai', 'default'],
    url: DEFAULT_SPARK_POSTER
  }
];

const DEFAULT_VENUES = [
  'PRPCEM Main Auditorium',
  'PRPCEM Campus, Amravati',
  'PRPCEM Campus & Virtual',
  'Virtual / Online',
  'Computer Lab 1 - Department of CSE',
  'Seminar Hall 2 - PRPCEM'
];

import {
  formatToIST_DateTimeLocal as formatToDateTimeLocal,
  parseDateTimeLocalToISTIso as toSafeIso,
  formatToISTDateTimeString as formatDisplayDateTime,
  formatToISTDateString
} from '../utils/dateUtils';

export default function AdminEvents() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [venueSuggestions, setVenueSuggestions] = useState(DEFAULT_VENUES);
  
  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Innovation Challenge',
    mode: 'Hybrid',
    venue: 'PRPCEM Main Auditorium',
    poster_url: DEFAULT_SPARK_POSTER,
    description: '',
    start_date: '',
    end_date: '',
    registration_start_date: '',
    registration_end_date: '',
    max_registrations: '',
    initial_registration_count: '',
    fee: 'Free',
    feeNumeric: 0,
    is_registration_open: true,
    rewards: 'Certificates, Prizes & Swags',
    status: 'upcoming'
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [posterUploadSuccess, setPosterUploadSuccess] = useState(false);

  // Registrations Modal State
  const [regsModalOpen, setRegsModalOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [regsSearch, setRegsSearch] = useState('');
  const [regsPage, setRegsPage] = useState(1);
  const [regsLimit, setRegsLimit] = useState(25);
  const [copyFeedback, setCopyFeedback] = useState(null);

  // Pagination for Events List (9 items per page)
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsLimit, setEventsLimit] = useState(9);

  // Quick Event QR Modal State
  const [qrModalEvent, setQrModalEvent] = useState(null);
  const [qrCopied, setQrCopied] = useState(false);
  const [branding, setBranding] = useState(null);

  // Manage Quizzes Modal & Delink States
  const [quizModalEvent, setQuizModalEvent] = useState(null);
  const [quizModalTab, setQuizModalTab] = useState('attached');
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loadingAllQuizzes, setLoadingAllQuizzes] = useState(false);
  const [quizSearch, setQuizSearch] = useState('');
  const [delinkingQuizId, setDelinkingQuizId] = useState(null);
  const [linkingQuizId, setLinkingQuizId] = useState(null);

  // Custom Confirm Dialog State (Replaces native browser window.confirm)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    quiz: null,
    event: null,
    confirmLabel: 'Confirm',
    confirmVariant: 'danger',
    onConfirm: null
  });

  useEffect(() => {
    fetchBrandingConfig().then(b => setBranding(b)).catch(err => console.error(err));
  }, []);

  const handleDownloadEventQR = async (ev) => {
    if (!ev) return;
    const slug = ev.slug || ev.id;
    const regUrl = `https://www.mscprpcem.tech/register/${slug}`;
    await downloadBrandedQRCard({
      svgElementId: 'admin-event-qr-svg',
      quizData: {
        title: ev.name,
        subtitle: `${ev.category || 'FLAGSHIP EVENT'} • ${ev.mode || 'HYBRID'}`,
        custom_slug: slug,
        join_code: slug,
        code_label: 'EVENT REGISTRATION SLUG',
        join_url: regUrl,
        isEvent: true
      },
      brandData: branding,
      fileName: `msc-event-${slug}-card.png`
    });
  };

  const handleCopyEventQrLink = (url) => {
    navigator.clipboard.writeText(url);
    setQrCopied(true);
    setTimeout(() => setQrCopied(false), 2000);
  };

  // Lock body and workspace scroll when any modal is open
  const isAnyModalOpen = Boolean(
    modalOpen || regsModalOpen || qrModalEvent || quizModalEvent || confirmDialog.isOpen
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const mainEl = document.querySelector('main');
      const prevMainOverflow = mainEl ? mainEl.style.overflow : '';
      if (mainEl) mainEl.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        if (mainEl) mainEl.style.overflow = prevMainOverflow;
      };
    }
  }, [isAnyModalOpen]);

  const handlePosterUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Please select a valid image file (PNG, JPG, JPEG, WEBP, GIF, SVG).', 'Invalid Image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.warning('Image file size must be under 10MB.', 'File Too Large');
      return;
    }

    try {
      setUploadingPoster(true);
      setPosterUploadSuccess(false);
      const uploadFormData = new FormData();
      uploadFormData.append('poster', file);

      const res = await api.post('/api/events/upload-poster', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success && res.data.url) {
        setFormData(prev => ({
          ...prev,
          poster_url: res.data.url
        }));
        setPosterUploadSuccess(true);
        toast.success('Event poster uploaded successfully!', 'Upload Complete');
        setTimeout(() => setPosterUploadSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Poster upload failed:', err);
      toast.error(err.response?.data?.error || 'Failed to upload poster image to Azure Blob Storage.', 'Upload Failed');
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleDeleteRegistration = (regId) => {
    handleDeleteReg(regId, 'Attendee');
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/events');
      if (res.data?.success && Array.isArray(res.data.events)) {
        setEvents(res.data.events);
        const existingVenues = res.data.events.map(e => e.venue).filter(Boolean);
        setVenueSuggestions(prev => Array.from(new Set([...prev, ...existingVenues])));
      }
    } catch (err) {
      console.warn('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleNameChange = (nameVal) => {
    const autoSlug = nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const updated = {
      ...formData,
      name: nameVal,
      slug: (!editingEvent || !formData.slug) ? autoSlug : formData.slug,
      poster_url: (!formData.poster_url || formData.poster_url.trim() === '') ? DEFAULT_SPARK_POSTER : formData.poster_url
    };
    setFormData(updated);
  };

  const openCreateModal = () => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    nextWeek.setHours(10, 0, 0, 0);
    const nextWeekEnd = new Date(nextWeek.getTime() + 6 * 60 * 60 * 1000); // 4 PM same day
    const regDeadline = new Date(nextWeek.getTime() - 2 * 60 * 60 * 1000); // 8 AM same day

    setEditingEvent(null);
    setFormData({
      name: '',
      slug: '',
      category: 'Innovation Challenge',
      mode: 'Hybrid',
      venue: venueSuggestions[0] || 'PRPCEM Main Auditorium',
      poster_url: DEFAULT_SPARK_POSTER,
      description: '',
      start_date: formatToDateTimeLocal(nextWeek),
      end_date: formatToDateTimeLocal(nextWeekEnd),
      registration_start_date: formatToDateTimeLocal(new Date()),
      registration_end_date: formatToDateTimeLocal(regDeadline),
      max_registrations: '',
      initial_registration_count: '',
      fee: 'Free',
      feeNumeric: 0,
      is_registration_open: true,
      rewards: 'Certificates, Prizes & Swags',
      status: 'upcoming'
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (ev) => {
    if (!ev) return;
    setEditingEvent(ev);

    const resolvedStartDate = ev.start_date || ev.startDate || ev.start_time || ev.date || (ev.source === 'json' ? ev.startDate : null);
    const resolvedEndDate = ev.end_date || ev.endDate || ev.end_time || null;
    const resolvedRegStart = ev.registration_start_date || ev.registrationStartDate || null;
    const resolvedRegEnd = ev.registration_end_date || ev.registrationEndDate || null;

    const startTimeHint = ev.startTimeIST || ev.start_time || '10:00';
    const endTimeHint = ev.endTimeIST || ev.end_time || '16:30';

    const parseToTimeStr = (tHint, defaultTime) => {
      if (!tHint) return defaultTime;
      const str = String(tHint).trim();
      const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const ampm = (match[3] || '').toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return `${String(h).padStart(2, '0')}:${m}`;
      }
      return defaultTime;
    };

    const sTime = parseToTimeStr(startTimeHint, '10:00');
    const eTime = parseToTimeStr(endTimeHint, '16:30');

    const startDateObj = resolvedStartDate ? new Date(resolvedStartDate) : null;
    const isFuture = Boolean(startDateObj && !isNaN(startDateObj.getTime()) && startDateObj > new Date());

    const rawFee = ev.fee || ev.price || 'Free';
    const isFree = !rawFee || String(rawFee).toLowerCase().includes('free') || String(rawFee).trim() === '0' || String(rawFee).trim() === '₹0';
    const numFee = isFree ? 0 : (parseInt(String(rawFee).replace(/[^0-9]/g, ''), 10) || 0);

    setFormData({
      name: ev.name || ev.title || ev.event_name || '',
      slug: ev.slug || (ev.name ? ev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : ''),
      category: ev.category || 'Technical Workshop',
      mode: ev.mode || 'Offline',
      venue: ev.venue || venueSuggestions[0] || 'PRPCEM Main Auditorium',
      poster_url: ev.poster_url || ev.poster || ev.banner || ev.image || DEFAULT_SPARK_POSTER,
      description: ev.description || '',
      start_date: formatToDateTimeLocal(resolvedStartDate, sTime),
      end_date: formatToDateTimeLocal(resolvedEndDate, eTime),
      registration_start_date: formatToDateTimeLocal(resolvedRegStart, '09:00'),
      registration_end_date: formatToDateTimeLocal(resolvedRegEnd, '09:00'),
      max_registrations: (ev.max_registrations !== null && ev.max_registrations !== undefined && ev.max_registrations !== '')
        ? String(ev.max_registrations)
        : (ev.maxRegistrations !== null && ev.maxRegistrations !== undefined ? String(ev.maxRegistrations) : ''),
      initial_registration_count: (ev.initial_registration_count !== undefined && ev.initial_registration_count !== null && ev.initial_registration_count !== '')
        ? String(ev.initial_registration_count)
        : (ev.initialRegistrationCount !== undefined ? String(ev.initialRegistrationCount) : '0'),
      fee: isFree ? 'Free' : `₹${numFee}`,
      feeNumeric: numFee,
      is_registration_open: ev.is_registration_open !== false && ev.isRegistrationOpen !== false,
      rewards: ev.rewards || ev.prizes || 'Certificates & Swags',
      status: isFuture ? 'upcoming' : ((ev.status === 'past' || ev.status === 'completed' || ev.event_status === 'completed') ? 'completed' : (ev.status || ev.event_status || 'upcoming'))
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleViewRegistrations = async (ev) => {
    setViewingEvent(ev);
    setRegsModalOpen(true);
    setRegistrations([]);
    try {
      setLoadingRegs(true);
      const res = await api.get(`/api/events/${ev.id}/registrations`);
      if (res.data?.success) {
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      console.warn('Failed to load registrations:', err);
    } finally {
      setLoadingRegs(false);
    }
  };

  const exportRegistrationsCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast.warning('No registrations available to export.', 'Export Warning');
      return;
    }

    const headers = ['Full Name', 'Email', 'College', 'Branch', 'Year', 'Phone', 'Roll No', 'Submitted Date', 'Status'];
    const rows = registrations.map(r => [
      `"${(r.full_name || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.college || '').replace(/"/g, '""')}"`,
      `"${(r.branch || '').replace(/"/g, '""')}"`,
      `"${(r.year_of_study || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.roll_no || '').replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toLocaleString()}"`,
      `"${r.status || 'registered'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${(viewingEvent?.name || 'event').replace(/[^a-z0-9]/gi, '_')}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Registration list downloaded as CSV!', 'Export Complete');
  };

  const handleDeleteEvent = (id, name) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Event?',
      description: `Are you sure you want to permanently delete event "${name}"? Linked quizzes will remain safe.`,
      quiz: null,
      event: null,
      isDelink: false,
      safeNote: 'Linked quizzes, questions, and standalone attempts will remain completely safe and intact.',
      cancelLabel: 'Cancel',
      confirmLabel: 'Delete Event',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/api/events/${id}`);
          setEvents(prev => prev.filter(e => e.id !== id));
          toast.success(`Event "${name}" deleted successfully.`);
        } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to delete event');
        }
      }
    });
  };

  const fetchAllQuizzes = async () => {
    try {
      setLoadingAllQuizzes(true);
      const res = await api.get('/api/quizzes?all=true');
      if (Array.isArray(res.data)) {
        setAllQuizzes(res.data);
      } else if (res.data?.quizzes) {
        setAllQuizzes(res.data.quizzes);
      }
    } catch (err) {
      console.warn('Failed to fetch quizzes list:', err.message);
    } finally {
      setLoadingAllQuizzes(false);
    }
  };

  const openManageQuizzesModal = (ev) => {
    setQuizModalEvent(ev);
    setQuizSearch('');
    setQuizModalTab((ev.quizzes && ev.quizzes.length > 0) ? 'attached' : 'link_new');
    fetchAllQuizzes();
  };

  const promptDelinkQuiz = (ev, quiz) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delink Quiz Track?',
      description: `Are you sure you want to detach "${quiz.title}" from "${ev.name}"?`,
      quiz: quiz,
      event: ev,
      isDelink: true,
      safeNote: 'The quiz, questions, student attempts, and past scores will remain 100% intact as an independent assessment.',
      cancelLabel: 'Cancel / Keep Linked',
      confirmLabel: 'Yes, Delink Quiz',
      confirmVariant: 'danger',
      onConfirm: () => executeDelinkQuiz(ev, quiz)
    });
  };

  const executeDelinkQuiz = async (ev, quiz) => {
    if (!ev || !quiz) return;
    try {
      setDelinkingQuizId(quiz.id);
      const res = await api.post(`/api/events/${encodeURIComponent(ev.id)}/delink-quiz`, {
        quiz_id: quiz.id
      });

      if (res.data?.success) {
        toast.success(`Quiz "${quiz.title}" successfully delinked from "${ev.name}".`);

        // Immediately update local events state
        setEvents(prev => prev.map(e => {
          if (e.id === ev.id) {
            const currentQuizzes = e.quizzes || [];
            const nextQuizzes = currentQuizzes.filter(q => q.id !== quiz.id);
            return {
              ...e,
              quizzes: nextQuizzes,
              total_quizzes: nextQuizzes.length
            };
          }
          return e;
        }));

        // Also update quizModalEvent if open
        setQuizModalEvent(prev => {
          if (!prev || prev.id !== ev.id) return prev;
          const nextQuizzes = (prev.quizzes || []).filter(q => q.id !== quiz.id);
          return {
            ...prev,
            quizzes: nextQuizzes,
            total_quizzes: nextQuizzes.length
          };
        });

        fetchAllQuizzes();
      } else {
        toast.error(res.data?.error || 'Failed to delink quiz.');
      }
    } catch (err) {
      console.error('Delink quiz error:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to delink quiz.');
    } finally {
      setDelinkingQuizId(null);
    }
  };

  const handleLinkExistingQuiz = async (ev, quizId) => {
    if (!ev || !quizId) return;
    try {
      setLinkingQuizId(quizId);
      const res = await api.post(`/api/events/${encodeURIComponent(ev.id)}/link-quiz`, {
        quiz_id: quizId
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Quiz linked to event successfully.');

        const linkedQuizObj = res.data.quiz || allQuizzes.find(q => q.id === quizId) || { id: quizId, title: 'Linked Quiz' };

        // Update events state in UI
        setEvents(prev => prev.map(e => {
          if (e.id === ev.id) {
            const currentQuizzes = e.quizzes || [];
            const nextQuizzes = [...currentQuizzes, linkedQuizObj];
            return {
              ...e,
              quizzes: nextQuizzes,
              total_quizzes: nextQuizzes.length
            };
          }
          return e;
        }));

        // Update quizModalEvent if open
        setQuizModalEvent(prev => {
          if (!prev || prev.id !== ev.id) return prev;
          const nextQuizzes = [...(prev.quizzes || []), linkedQuizObj];
          return {
            ...prev,
            quizzes: nextQuizzes,
            total_quizzes: nextQuizzes.length
          };
        });

        fetchAllQuizzes();
      } else {
        toast.error(res.data?.error || 'Failed to link quiz.');
      }
    } catch (err) {
      console.error('Link quiz error:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to link quiz.');
    } finally {
      setLinkingQuizId(null);
    }
  };

  const handleDeleteReg = (regId, fullName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Registration?',
      description: `Are you sure you want to delete the registration for "${fullName || 'this participant'}"? This attendee will also be removed from the event mail dispatch list.`,
      quiz: null,
      event: null,
      isDelink: false,
      safeNote: null,
      cancelLabel: 'Cancel',
      confirmLabel: 'Delete Registration',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/api/events/registrations/${regId}`);
          setRegistrations(prev => prev.filter(r => r.id !== regId));
          toast.success('Registration deleted successfully.');
        } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to delete registration.');
        }
      }
    });
  };

  const handleCopyLink = (slugOrId) => {
    const url = `https://www.mscprpcem.tech/register/${slugOrId}`;
    navigator.clipboard.writeText(url);
    setCopyFeedback(slugOrId);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Event name is required');
      return;
    }

    const resolvedStartIso = toSafeIso(formData.start_date);
    const resolvedEndIso = toSafeIso(formData.end_date);
    const resolvedRegStartIso = toSafeIso(formData.registration_start_date);
    const resolvedRegEndIso = toSafeIso(formData.registration_end_date);

    if (resolvedStartIso && resolvedEndIso && new Date(resolvedEndIso) < new Date(resolvedStartIso)) {
      setErrorMsg('Event End Date & Time cannot be earlier than Start Date & Time.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const isFuture = resolvedStartIso && new Date(resolvedStartIso) > new Date();
      const cleanStatus = isFuture && (formData.status === 'past' || formData.status === 'completed')
        ? 'upcoming'
        : ((formData.status === 'past' || formData.status === 'completed') ? 'completed' : (formData.status || 'upcoming'));

      const numFee = Number(formData.feeNumeric);
      const isZeroFee = isNaN(numFee) || numFee <= 0 || formData.fee === 'Free' || !formData.fee;
      const finalFee = isZeroFee ? 'Free' : `₹${numFee || String(formData.fee).replace(/[^0-9.]/g, '')}`;
      const finalPoster = (formData.poster_url && formData.poster_url.trim()) ? formData.poster_url.trim() : DEFAULT_SPARK_POSTER;
      const cleanVenue = (formData.venue && formData.venue.trim()) ? formData.venue.trim() : (venueSuggestions[0] || 'PRPCEM Main Auditorium');

      if (cleanVenue && !venueSuggestions.includes(cleanVenue)) {
        setVenueSuggestions(prev => [cleanVenue, ...prev]);
      }

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        category: formData.category,
        mode: formData.mode,
        venue: cleanVenue,
        poster_url: finalPoster,
        description: formData.description,
        start_date: resolvedStartIso,
        end_date: resolvedEndIso,
        registration_start_date: resolvedRegStartIso,
        registration_end_date: resolvedRegEndIso,
        max_registrations: formData.max_registrations !== '' && formData.max_registrations !== null ? parseInt(formData.max_registrations, 10) : null,
        initial_registration_count: formData.initial_registration_count !== '' && formData.initial_registration_count !== null ? parseInt(formData.initial_registration_count, 10) : 0,
        fee: finalFee,
        is_registration_open: Boolean(formData.is_registration_open),
        rewards: formData.rewards,
        status: cleanStatus
      };

      if (editingEvent && !String(editingEvent.id).startsWith('auto-') && !String(editingEvent.id).startsWith('event-')) {
        const res = await api.put(`/api/events/${editingEvent.id}`, payload);
        if (res.data?.success) {
          await fetchEvents();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/api/events', payload);
        if (res.data?.success) {
          await fetchEvents();
          setModalOpen(false);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.slug || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.venue || '').toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedFilter === 'ALL') return true;
    
    const status = (e.status || '').toUpperCase();
    const now = new Date();
    const startDate = e.start_date ? new Date(e.start_date) : (e.startDate ? new Date(e.startDate) : null);
    const endDate = e.end_date ? new Date(e.end_date) : (e.endDate ? new Date(e.endDate) : null);
    const isFutureEvent = Boolean(startDate && !isNaN(startDate.getTime()) && startDate > now);
    const isEventEnded = Boolean(endDate && !isNaN(endDate.getTime())
      ? endDate < now 
      : (startDate && !isNaN(startDate.getTime()) ? startDate < now : false));
    const isCompleted = !isFutureEvent && (status === 'COMPLETED' || status === 'PAST' || status === 'CONCLUDED' || isEventEnded);

    if (selectedFilter === 'COMPLETED') {
      return isCompleted;
    }
    if (selectedFilter === 'UPCOMING') {
      return isFutureEvent || (!isCompleted && (status === 'UPCOMING' || status === 'OPEN' || status === 'ACTIVE'));
    }
    if (selectedFilter === 'LIVE') {
      return (status === 'LIVE' || e.is_live) && !isEventEnded;
    }
    if (selectedFilter === 'REG_OPEN') {
      return e.is_registration_open && !e.is_registration_ended && !isEventEnded;
    }
    return status === selectedFilter;
  }).sort((a, b) => {
    const timeA = new Date(a.start_date || a.startDate || a.date || a.createdAt || 0).getTime() || 0;
    const timeB = new Date(b.start_date || b.startDate || b.date || b.createdAt || 0).getTime() || 0;
    if (timeB !== timeA) return timeB - timeA;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const filteredRegs = registrations.filter(r => {
    if (!regsSearch.trim()) return true;
    const q = regsSearch.toLowerCase();
    return (r.full_name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.college || '').toLowerCase().includes(q) ||
      (r.branch || '').toLowerCase().includes(q);
  });

  const totalEventsPages = eventsLimit === 0 ? 1 : (Math.ceil(filteredEvents.length / eventsLimit) || 1);
  const paginatedEvents = eventsLimit === 0 ? filteredEvents : filteredEvents.slice((eventsPage - 1) * eventsLimit, eventsPage * eventsLimit);

  const renderEventCard = (ev) => {
    const currentSlug = ev.slug || ev.id;
    const isCopied = copyFeedback === currentSlug;
    const hasDates = Boolean(ev.start_date);
    const isRegClosed = !ev.is_registration_open || ev.is_registration_ended;

    const startDateObj = ev.start_date ? new Date(ev.start_date) : (ev.startDate ? new Date(ev.startDate) : null);
    const isFutureEv = Boolean(startDateObj && !isNaN(startDateObj.getTime()) && startDateObj > new Date());
    const rawStatus = (ev.status || '').toLowerCase();
    const isLive = rawStatus === 'live' || ev.is_live;
    const isCompleted = !isFutureEv && (rawStatus === 'completed' || rawStatus === 'past');
    const badgeLabel = isLive ? 'Live' : (isCompleted ? 'Completed' : 'Upcoming');

    return (
      <div
        key={ev.id}
        className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
      >
        <div>
          {/* Poster Preview Header */}
          <div className="relative h-48 bg-slate-950 overflow-hidden">
            <img
              src={ev.poster_url || POSTER_GALLERY[0].url}
              alt={ev.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = POSTER_GALLERY[0].url;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            
            {/* Status & Fee Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                isLive
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : isCompleted
                  ? 'bg-slate-600/90 text-white backdrop-blur-xs'
                  : 'bg-purple-600 text-white'
              }`}>
                {badgeLabel}
              </span>
              {ev.fee && (
                <span className="px-2 py-1 rounded-full text-[10px] font-extrabold bg-black/60 text-white backdrop-blur-xs border border-white/20">
                  {ev.fee}
                </span>
              )}
            </div>

            {/* Top Action Icons */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <button
                onClick={() => openEditModal(ev)}
                className="p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-xl backdrop-blur-xs transition-colors cursor-pointer shadow-xs"
                title="Edit event"
              >
                <Edit3 size={13} />
              </button>
              {ev.source === 'database' && (
                <button
                  onClick={() => handleDeleteEvent(ev.id, ev.name)}
                  className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl backdrop-blur-xs transition-colors cursor-pointer shadow-xs"
                  title="Delete event"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Category Pill on bottom of image */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
              <span className="text-[11px] font-bold opacity-90 truncate">
                {ev.category || 'MSC Flagship Event'}
              </span>
              <span className="text-[11px] font-medium opacity-80">
                {ev.mode || 'Offline'}
              </span>
            </div>
          </div>

          {/* Event Content Body */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                {ev.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-medium leading-relaxed">
                {ev.description || 'No description provided.'}
              </p>
            </div>

            {/* 📅 Event Date & Timing Badge */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-800 font-bold">
                <div className="flex items-center gap-1.5 truncate">
                  <Calendar size={13} className="text-purple-600 shrink-0" />
                  <span className="truncate">
                    {ev.start_date
                      ? `${formatDisplayDateTime(ev.start_date, true)}${ev.end_date ? ` → ${formatDisplayDateTime(ev.end_date, false)}` : ''}`
                      : 'Date TBA'}
                  </span>
                </div>
              </div>

              {/* ⏳ Registration Deadline */}
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1 text-slate-500 font-medium truncate">
                  <Clock size={11} className="text-slate-400 shrink-0" />
                  <span>
                    Reg Deadline: {ev.registration_end_date ? formatDisplayDateTime(ev.registration_end_date, true) : 'Open till start'}
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 rounded font-extrabold uppercase text-[9px] ${
                  isRegClosed
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isRegClosed ? 'Closed' : 'Open'}
                </span>
              </div>
            </div>

            {/* Live Website Slug Registration Badge */}
            <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2 flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 truncate">
                <LinkIcon size={12} className="text-purple-600 shrink-0" />
                <span className="font-mono font-bold text-purple-800 truncate">
                  /register/{currentSlug}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleCopyLink(currentSlug)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-100'
                  }`}
                  title="Copy Full Registration URL"
                >
                  {isCopied ? <Check size={11} /> : <Copy size={11} />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={`https://www.mscprpcem.tech/register/${currentSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-purple-600 hover:text-purple-800 hover:bg-white rounded-md cursor-pointer"
                  title="Open Registration Page"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1.5 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{ev.venue || 'PRPCEM Amravati'}</span>
              </div>
              
              {/* Website Registrations Count & Capacity */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Users size={13} className="text-purple-600 shrink-0" />
                  <span className="font-extrabold text-purple-700">
                    {ev.registration_count || 0}
                    {ev.max_registrations ? ` / ${ev.max_registrations} Seats` : ' Enrolled'}
                  </span>
                  {parseInt(ev.initial_registration_count, 10) > 0 && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      ({ev.actual_registration_count || 0} online + {ev.initial_registration_count} base)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleViewRegistrations(ev)}
                  className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  View List ({ev.actual_registration_count || 0})
                </button>
              </div>

              {/* Capacity Progress Bar if limit set */}
              {ev.max_registrations && (
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (ev.registration_count || 0) >= ev.max_registrations ? 'bg-rose-500' : 'bg-purple-600'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round(((ev.registration_count || 0) / ev.max_registrations) * 100))}%`
                    }}
                  />
                </div>
              )}

              {/* Attached Quizzes Information on Card (Clean row, no card clutter) */}
              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={13} className="text-purple-600 shrink-0" />
                  <span>
                    {ev.total_quizzes > 0 ? (
                      <span className="text-slate-800 font-bold">
                        {ev.total_quizzes} Quiz Track{ev.total_quizzes > 1 ? 's' : ''} Attached
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Standalone Event (0 Quizzes Attached)</span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openManageQuizzesModal(ev)}
                  className="text-[11px] font-black text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                >
                  {ev.total_quizzes > 0 ? `Manage (${ev.total_quizzes})` : '+ Attach'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-5 pt-0 grid grid-cols-3 gap-2 text-xs font-bold mt-2">
          <button
            onClick={() => openManageQuizzesModal(ev)}
            className="py-2 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Manage & Link/Delink Quizzes"
          >
            <Plus size={13} />
            <span className="truncate">Quiz Track</span>
          </button>

          <button
            onClick={() => navigate(`/admin/email-dispatch?eventId=${encodeURIComponent(ev.id)}&event=${encodeURIComponent(ev.name)}`)}
            className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Dispatch Email"
          >
            <Mail size={13} />
            <span className="truncate">Email</span>
          </button>

          <button
            onClick={() => setQrModalEvent(ev)}
            className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="View & Download Event QR Card"
          >
            <QrCode size={13} />
            <span className="truncate">QR Card</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Event Management</h1>
              <p className="text-xs text-slate-500 font-medium">
                Configure event dates, registration deadlines, capacity limits, and custom URLs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEvents}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors cursor-pointer"
            title="Refresh events"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setEventsPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-hidden focus:border-purple-600"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 self-stretch sm:self-auto overflow-x-auto">
          {[
            { key: 'ALL', label: 'All Events' },
            { key: 'UPCOMING', label: 'Upcoming' },
            { key: 'REG_OPEN', label: 'Reg Open' },
            { key: 'LIVE', label: 'Live Now' },
            { key: 'COMPLETED', label: 'Completed' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setSelectedFilter(key);
                setEventsPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === key
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 animate-pulse">
              <div className="h-44 bg-slate-100 rounded-2xl w-full" />
              <div className="h-5 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Sparkles size={24} />
          </div>
          <h3 className="text-base font-black text-slate-900">No Events Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create an event (e.g. <strong>VisionX Season 2</strong>) with full scheduling, registration deadlines, and link challenge quizzes.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Create First Event</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map((ev) => renderEventCard(ev))}
          </div>

          {/* Pagination Controls Bar (9 items per page) */}
          {filteredEvents.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="text-slate-500 font-bold">
                Showing{' '}
                <span className="text-slate-900 font-extrabold">
                  {filteredEvents.length === 0 ? 0 : (eventsPage - 1) * (eventsLimit || filteredEvents.length) + 1}
                </span>{' '}
                to{' '}
                <span className="text-slate-900 font-extrabold">
                  {eventsLimit === 0 ? filteredEvents.length : Math.min(eventsPage * eventsLimit, filteredEvents.length)}
                </span>{' '}
                of <span className="text-purple-600 font-black">{filteredEvents.length}</span> event(s)
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="text-[11px] font-bold text-slate-400">Show:</span>
                  <ThemeDropdown
                    value={eventsLimit}
                    onChange={(val) => {
                      setEventsLimit(Number(val));
                      setEventsPage(1);
                    }}
                    options={[
                      { value: 9, label: '9 / page' },
                      { value: 18, label: '18 / page' },
                      { value: 27, label: '27 / page' },
                      { value: 0, label: 'All events' }
                    ]}
                    size="sm"
                    buttonClassName="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/70 border-slate-200"
                  />
                </div>

                {eventsLimit > 0 && totalEventsPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEventsPage((prev) => Math.max(1, prev - 1))}
                      disabled={eventsPage === 1}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalEventsPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setEventsPage(pg)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          eventsPage === pg
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      onClick={() => setEventsPage((prev) => Math.min(totalEventsPages, prev + 1))}
                      disabled={eventsPage >= totalEventsPages}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Registrations List Modal (Rendered in Portal) */}
      {regsModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-3xl w-full shadow-2xl border border-slate-200 my-auto max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {viewingEvent?.name} — Registrations
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {registrations.length} student(s) registered online through the portal.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={exportRegistrationsCSV}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setRegsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Search & Items Per Page Selector */}
            <div className="my-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <input
                type="text"
                placeholder="Search registered students by name, email, college, branch..."
                value={regsSearch}
                onChange={(e) => {
                  setRegsSearch(e.target.value);
                  setRegsPage(1);
                }}
                className="w-full sm:flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
              />
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Show:</span>
                <ThemeDropdown
                  value={regsLimit}
                  onChange={(val) => {
                    setRegsLimit(Number(val));
                    setRegsPage(1);
                  }}
                  options={[
                    { value: 10, label: '10' },
                    { value: 20, label: '20' },
                    { value: 50, label: '50' }
                  ]}
                  size="sm"
                  buttonClassName="bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 border-blue-200"
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto max-h-[50vh] border border-slate-100 rounded-2xl">
              {loadingRegs ? (
                <div className="p-8 text-center text-xs font-bold text-slate-500">Loading registrations...</div>
              ) : filteredRegs.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-400">No registrations found.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100">
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">College & Branch</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Registered At</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredRegs
                      .slice((regsPage - 1) * regsLimit, regsPage * regsLimit)
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900">{r.full_name}</td>
                          <td className="p-3 text-blue-600">{r.email}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800 truncate max-w-[180px]">{r.college}</div>
                            <div className="text-[10px] text-slate-400">{r.branch} {r.year_of_study ? `(${r.year_of_study})` : ''}</div>
                          </td>
                          <td className="p-3 text-slate-600">{r.phone || '—'}</td>
                          <td className="p-3 text-[11px] text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteReg(r.id, r.full_name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              title="Delete registration"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Paginator Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-bold">
                Showing{' '}
                <span className="text-slate-900 font-extrabold">
                  {filteredRegs.length === 0 ? 0 : (regsPage - 1) * regsLimit + 1}
                </span>{' '}
                to{' '}
                <span className="text-slate-900 font-extrabold">
                  {Math.min(regsPage * regsLimit, filteredRegs.length)}
                </span>{' '}
                of <span className="text-slate-900 font-extrabold">{filteredRegs.length}</span> record(s)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRegsPage(prev => Math.max(1, prev - 1))}
                  disabled={regsPage === 1 || filteredRegs.length === 0}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Prev
                </button>
                <span className="font-bold text-slate-700 font-mono">
                  {regsPage} / {Math.ceil(filteredRegs.length / regsLimit) || 1}
                </span>
                <button
                  onClick={() => setRegsPage(prev => Math.min(Math.ceil(filteredRegs.length / regsLimit), prev + 1))}
                  disabled={regsPage >= Math.ceil(filteredRegs.length / regsLimit) || filteredRegs.length === 0}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Next
                </button>
                <button
                  onClick={() => setRegsModalOpen(false)}
                  className="ml-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create / Edit Event Modal (Rendered in Portal on document.body) */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingEvent ? `Edit Event: ${editingEvent.name}` : 'Create New Club Event'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure event details, dates, attendee counts, and registration settings.</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="mt-5 space-y-4 text-xs">
              
              {/* Event Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VisionX Season 2, Spark '26, .NET Conf Amravati"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-bold text-slate-900"
                />
              </div>

              {/* Event URL Slug Configuration */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Custom Registration Page URL Slug *</span>
                  <span className="text-[10px] text-purple-600 font-medium">Direct Link on Main Website</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-mono text-[11px] select-none">
                    www.mscprpcem.tech/register/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="visionx-s2, spark26, dotnet2025"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-xs font-mono font-bold text-purple-700 outline-none focus:bg-white focus:border-purple-600"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Students can open <code className="text-purple-600 font-bold">https://www.mscprpcem.tech/register/{formData.slug || 'event-slug'}</code> directly to register.
                </p>
              </div>

              {/* ════════ SECTION 1: ATTENDEES & REGISTRATIONS COUNT ════════ */}
              <div className="p-4 bg-gradient-to-br from-purple-50/70 via-indigo-50/50 to-blue-50/70 border border-purple-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-2xs">
                      <Users size={15} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-purple-950 uppercase tracking-wide block">
                        Attendees & Registration Numbers
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Set base count for past/offline events & configure seat limits
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Displayed on Website</span>
                    <span className="text-xs font-black text-purple-700 bg-white/80 px-2 py-0.5 rounded-lg border border-purple-200 inline-block">
                      {(parseInt(formData.initial_registration_count, 10) || 0) + (editingEvent?.actual_registration_count || 0)} Students Enrolled
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center justify-between">
                      <span>Initial / Base Count</span>
                      <span className="text-[9px] text-purple-600 font-bold bg-purple-100/80 px-1.5 py-0.2 rounded">Editable</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 150 (Default: 0)"
                      value={formData.initial_registration_count}
                      onChange={(e) => setFormData({ ...formData, initial_registration_count: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-black text-purple-950 outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                    />
                    <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                      Base count for past or offline participants. Online signups automatically add to this.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Seat / Capacity Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 200 (Blank = Unlimited)"
                      value={formData.max_registrations}
                      onChange={(e) => setFormData({ ...formData, max_registrations: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-[9px] text-slate-400 mt-1 leading-tight">
                      Maximum total seats allowed.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Registration Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_registration_open: !formData.is_registration_open })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                        formData.is_registration_open
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300'
                      }`}
                    >
                      {formData.is_registration_open ? (
                        <>
                          <Unlock size={13} />
                          <span>Accepting Signups</span>
                        </>
                      ) : (
                        <>
                          <Lock size={13} />
                          <span>Registration Closed</span>
                        </>
                      )}
                    </button>
                    <p className="text-[9px] text-slate-400 mt-1 leading-tight">
                      Toggle if student registration form is active.
                    </p>
                  </div>
                </div>

                {editingEvent && (
                  <div className="flex items-center justify-between bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-purple-100 text-[11px] flex-wrap gap-2">
                    <span className="text-slate-600 font-medium">
                      🌐 Online student signups: <strong className="text-purple-700 font-black">{editingEvent.actual_registration_count || 0}</strong>
                    </span>
                    <span className="text-slate-600 font-medium">
                      ➕ Base count: <strong className="text-purple-700 font-black">{parseInt(formData.initial_registration_count, 10) || 0}</strong>
                    </span>
                    <span className="text-purple-950 font-extrabold">
                      = Total Count: <strong className="text-purple-600 font-black">{(parseInt(formData.initial_registration_count, 10) || 0) + (editingEvent.actual_registration_count || 0)}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* ════════ SECTION 2: EVENT DATE & TIME ════════ */}
              <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-purple-600" />
                  <span className="text-xs font-black text-purple-950 uppercase tracking-wide">
                    Event Schedule (Date & Time)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Event Starts At (Date & Time) *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Event Ends At (Date & Time)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* ════════ SECTION 3: REGISTRATION DEADLINE WINDOW ════════ */}
              <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Timer size={16} className="text-blue-600" />
                  <span className="text-xs font-black text-blue-950 uppercase tracking-wide">
                    Registration Deadline Window & Fee
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Registration Opens On
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.registration_start_date}
                      onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[9px] text-slate-400 mt-0.5">Leave blank for immediate opening.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Registration Last Date / Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.registration_end_date}
                      onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[9px] text-slate-400 mt-0.5">Auto-closes after this date.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Entry Fee / Price</span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        Number(formData.feeNumeric || 0) === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {Number(formData.feeNumeric || 0) === 0 ? 'Free' : `₹${formData.feeNumeric} INR`}
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs select-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0 for Free, or amount in INR"
                        value={formData.feeNumeric !== undefined ? formData.feeNumeric : (formData.fee === 'Free' ? 0 : (String(formData.fee).replace(/[^0-9.]/g, '') || 0))}
                        onChange={(e) => {
                          const num = e.target.value;
                          const isZero = num === '' || num === '0' || Number(num) === 0;
                          setFormData({
                            ...formData,
                            feeNumeric: num,
                            fee: isZero ? 'Free' : `₹${num}`
                          });
                        }}
                        className="w-full pl-7 pr-12 py-2 bg-white border border-blue-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-slate-400 select-none">
                        INR
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {Number(formData.feeNumeric || 0) === 0 ? '0 = Free Event. Displayed as "Free" on website.' : `Participants will pay ₹${formData.feeNumeric} INR.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Poster Upload & Gallery Section */}
              <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                    <CloudUpload size={15} className="text-purple-600" />
                    <span>Event Poster Image</span>
                  </label>
                  <span className="text-[10px] text-purple-600 font-bold">Azure Blob Storage Enabled</span>
                </div>

                {/* Azure Blob File Uploader Box */}
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-dashed border-purple-200 hover:border-purple-400 transition-all">
                  {/* Current Poster Preview Thumbnail */}
                  {formData.poster_url ? (
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 shadow-2xs">
                      <img
                        src={formData.poster_url}
                        alt="Current Poster"
                        className="w-full h-full object-cover"
                      />
                      {formData.poster_url.includes('blob.core.windows.net') && (
                        <span className="absolute top-0.5 right-0.5 bg-blue-600 text-[7px] text-white font-bold px-1 rounded-xs">
                          Azure
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-20 h-14 rounded-lg border border-slate-200 flex-shrink-0 bg-slate-100 flex items-center justify-center text-slate-400">
                      <Image size={20} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <label className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-black cursor-pointer shadow-2xs flex items-center gap-1.5 transition-all">
                        {uploadingPoster ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Uploading to Azure...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={12} />
                            <span>Upload Image</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterUpload}
                          disabled={uploadingPoster}
                          className="hidden"
                        />
                      </label>

                      {posterUploadSuccess && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Uploaded!
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400">
                      Supports PNG, JPG, WEBP, GIF, SVG (Max 10MB). Automatically stored in Azure Blob Storage.
                    </p>
                  </div>
                </div>

                {/* Preset Gallery */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">
                    Pre-Designed Event Poster:
                  </label>
                  <div className="flex items-center gap-2">
                    {POSTER_GALLERY.map((p) => {
                      const isSelected = formData.poster_url === p.url || (!formData.poster_url && p.url === DEFAULT_SPARK_POSTER);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, poster_url: p.url })}
                          className={`relative w-40 aspect-4/3 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-purple-600 ring-2 ring-purple-600/30 shadow-xs'
                              : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                          }`}
                          title={p.name}
                        >
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center text-white">
                              <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                <Check size={11} /> Default Spark
                              </span>
                            </div>
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-bold text-white text-center py-0.5 truncate px-1">
                            Spark Flagship Poster (Default)
                          </span>
                        </button>
                      );
                    })}
                    <div className="text-[10px] text-slate-500 font-medium leading-relaxed pl-2">
                      <p className="font-bold text-slate-700">Official Default Poster</p>
                      <p className="text-[9px] text-slate-400">If no custom image is uploaded, this official Spark poster is automatically attached.</p>
                    </div>
                  </div>
                </div>

                {/* Direct URL Input */}
                <div>
                  <input
                    type="url"
                    placeholder="Or enter direct image URL: https://..."
                    value={formData.poster_url}
                    onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden focus:border-purple-600 font-mono text-[10px] text-slate-600"
                  />
                </div>
              </div>

              {/* Category, Mode, and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                  <ThemeDropdown
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                    options={[
                      { value: 'Innovation Challenge', label: 'Innovation Challenge' },
                      { value: 'Flagship Event', label: 'Flagship Event' },
                      { value: 'Technical Workshop', label: 'Technical Workshop' },
                      { value: 'Hackathon', label: 'Hackathon' },
                      { value: 'AI / Cloud Skill Fest', label: 'AI / Cloud Skill Fest' },
                      { value: 'Conference', label: 'Conference' }
                    ]}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mode</label>
                  <ThemeDropdown
                    value={formData.mode}
                    onChange={(val) => setFormData({ ...formData, mode: val })}
                    options={[
                      { value: 'Hybrid', label: 'Hybrid', dotColor: 'bg-purple-500' },
                      { value: 'Offline', label: 'Offline', dotColor: 'bg-emerald-500' },
                      { value: 'Online', label: 'Online', dotColor: 'bg-blue-500' }
                    ]}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Event Status</label>
                  <ThemeDropdown
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val })}
                    options={[
                      { value: 'upcoming', label: 'Upcoming', dotColor: 'bg-blue-500' },
                      { value: 'registration_open', label: 'Registration Open', dotColor: 'bg-emerald-500' },
                      { value: 'registration_closed', label: 'Registration Closed', dotColor: 'bg-rose-500' },
                      { value: 'live', label: 'Live Now', dotColor: 'bg-amber-500' },
                      { value: 'completed', label: 'Completed / Past', dotColor: 'bg-slate-400' }
                    ]}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Venue / Location</span>
                  <span className="text-[10px] text-purple-600 font-medium">Type new or choose suggestion</span>
                </label>
                <input
                  type="text"
                  list="admin-event-venue-suggestions"
                  placeholder="e.g. PRPCEM Main Auditorium, Virtual / Online"
                  value={formData.venue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, venue: val });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-purple-600"
                />
                <datalist id="admin-event-venue-suggestions">
                  {venueSuggestions.map((v, i) => (
                    <option key={i} value={v} />
                  ))}
                </datalist>

                {/* Quick Venue Suggestion Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <span className="text-[10px] font-bold text-slate-400">Suggestions:</span>
                  {venueSuggestions.slice(0, 6).map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, venue: v })}
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        formData.venue === v
                          ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs font-black'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe the vision, agenda, and outcomes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rewards & Badges</label>
                <input
                  type="text"
                  placeholder="e.g. Official Microsoft Swags, Cash Prizes & Verified Certificates"
                  value={formData.rewards}
                  onChange={(e) => setFormData({ ...formData, rewards: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs shadow-sm cursor-pointer transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Quick Event QR Modal */}
      {qrModalEvent && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                  <QrCode size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Event QR Card</h3>
                  <p className="text-[11px] text-slate-400 font-bold">PRPCEM Chapter</p>
                </div>
              </div>
              <button
                onClick={() => setQrModalEvent(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1 text-center">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-[10px] font-black uppercase">
                <Sparkles size={12} />
                <span>{qrModalEvent.category || 'Flagship Event'}</span>
              </div>
              <h3 className="text-base font-black text-slate-900 line-clamp-1 px-4">{qrModalEvent.name}</h3>
              <p className="text-xs text-slate-500 font-medium">Scan to open event registration & details</p>
            </div>

            {/* QR Card Container */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3">
              {(() => {
                const slug = qrModalEvent.slug || qrModalEvent.id;
                const fullUrl = `https://www.mscprpcem.tech/register/${slug}`;
                return (
                  <>
                    <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-100">
                      <QRCodeSVG
                        id="admin-event-qr-svg"
                        value={fullUrl}
                        size={140}
                        bgColor="#FFFFFF"
                        fgColor="#0F172A"
                        level="H"
                        imageSettings={{
                          src: getLogoUrl(branding?.logo_path),
                          x: undefined,
                          y: undefined,
                          height: branding?.qr_logo_size || 28,
                          width: branding?.qr_logo_size || 28,
                          excavate: true,
                        }}
                      />
                    </div>

                    <div className="w-full flex items-center space-x-1.5">
                      <input
                        type="text"
                        readOnly
                        value={fullUrl}
                        className="bg-white border border-slate-200 text-purple-700 font-mono font-bold text-[11px] px-2.5 py-1.5 rounded-lg w-full truncate"
                      />
                      <button
                        onClick={() => handleCopyEventQrLink(fullUrl)}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer shrink-0"
                        title="Copy registration link"
                      >
                        {qrCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{qrCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownloadEventQR(qrModalEvent)}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Download Event Card</span>
              </button>
              <button
                onClick={() => setQrModalEvent(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Manage Quizzes Modal */}
      {quizModalEvent && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-scale-in">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/90 via-indigo-50/50 to-white">
              <div className="flex items-center gap-3 truncate">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <BookOpen size={20} />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 truncate">
                      Manage Quizzes
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 truncate max-w-[200px]">
                      {quizModalEvent.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Link challenge tracks to this event or safely detach existing quizzes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuizModalEvent(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="px-5 pt-4 pb-1">
              <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setQuizModalTab('attached')}
                  className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    quizModalTab === 'attached'
                      ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>Attached Tracks ({quizModalEvent.quizzes?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuizModalTab('link_new')}
                  className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    quizModalTab === 'link_new'
                      ? 'bg-white text-purple-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Plus size={14} />
                  <span>Link More Quizzes</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* TAB 1: Currently Attached Quizzes */}
              {quizModalTab === 'attached' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                        Active Quizzes for this Event
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        These quizzes appear on the official registration page for {quizModalEvent.name}.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const eventName = quizModalEvent.name;
                        setQuizModalEvent(null);
                        navigate(`/admin/scheduled-quizzes/create?event=${encodeURIComponent(eventName)}`);
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      <Plus size={13} />
                      <span>Create New Quiz</span>
                    </button>
                  </div>

                  {(!quizModalEvent.quizzes || quizModalEvent.quizzes.length === 0) ? (
                    <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                        <BookOpen size={22} />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">No Quiz Tracks Attached Yet</p>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        This event is currently a standalone event. You can link any existing platform quiz or create a brand new challenge track.
                      </p>
                      <button
                        type="button"
                        onClick={() => setQuizModalTab('link_new')}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        <Plus size={14} />
                        <span>Link Existing Quiz</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {quizModalEvent.quizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-purple-50/40 hover:bg-purple-50/80 border border-purple-200/80 rounded-2xl transition-all shadow-2xs group"
                        >
                          <div className="space-y-1.5 truncate">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm truncate">
                                {quiz.title}
                              </span>
                              {quiz.mode && (
                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md shadow-2xs ${
                                  quiz.mode === 'LIVE'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-purple-600 text-white'
                                }`}>
                                  {quiz.mode}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium flex-wrap">
                              {quiz.code && (
                                <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-bold">
                                  Join Code: {quiz.code}
                                </span>
                              )}
                              {quiz.total_questions !== undefined && (
                                <span className="text-slate-600 font-bold">{quiz.total_questions} Questions</span>
                              )}
                              {quiz.duration_minutes !== undefined && quiz.duration_minutes > 0 && (
                                <span className="text-slate-600 font-bold">{quiz.duration_minutes} Mins</span>
                              )}
                            </div>
                          </div>

                          {/* Delink Action Inside Modal */}
                          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-100">
                            <button
                              type="button"
                              disabled={delinkingQuizId === quiz.id}
                              onClick={() => promptDelinkQuiz(quizModalEvent, quiz)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-all cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50"
                              title="Delink this quiz from this event"
                            >
                              <Unlink size={13} />
                              <span>Delink Quiz</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Link Existing Quiz */}
              {quizModalTab === 'link_new' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                        Available Platform Quizzes
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Search and attach an existing quiz from the platform to {quizModalEvent.name}.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const eventName = quizModalEvent.name;
                        setQuizModalEvent(null);
                        navigate(`/admin/scheduled-quizzes/create?event=${encodeURIComponent(eventName)}`);
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      <Plus size={13} />
                      <span>Create New Quiz</span>
                    </button>
                  </div>

                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search platform quizzes by title or code..."
                      value={quizSearch}
                      onChange={(e) => setQuizSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    />
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {loadingAllQuizzes ? (
                      <div className="text-center py-8 text-slate-400 flex items-center justify-center gap-2">
                        <RefreshCw size={14} className="animate-spin text-purple-600" />
                        <span>Loading platform quizzes...</span>
                      </div>
                    ) : (() => {
                      const attachedIds = new Set((quizModalEvent.quizzes || []).map(q => q.id));
                      const unlinkedQuizzes = allQuizzes.filter(q => {
                        if (attachedIds.has(q.id)) return false;
                        const qName = (q.event_name || '').toLowerCase().trim();
                        const evName = (quizModalEvent.name || '').toLowerCase().trim();
                        if (q.event_id === quizModalEvent.id || (qName && qName === evName)) return false;
                        if (!quizSearch.trim()) return true;
                        const s = quizSearch.toLowerCase();
                        return (q.title || '').toLowerCase().includes(s) ||
                               (q.join_code || '').toLowerCase().includes(s) ||
                               (q.custom_slug || '').toLowerCase().includes(s);
                      });

                      if (unlinkedQuizzes.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-400 font-medium text-[11px] bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            {quizSearch ? 'No matching available quizzes found.' : 'No other standalone quizzes available to link.'}
                          </div>
                        );
                      }

                      return unlinkedQuizzes.map(q => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-3 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-2xl hover:border-purple-300 transition-all shadow-2xs"
                        >
                          <div className="truncate mr-3 space-y-0.5">
                            <div className="font-bold text-slate-900 truncate">{q.title}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                              <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                                {q.join_code || q.custom_slug || 'NO CODE'}
                              </span>
                              <span>•</span>
                              <span className="uppercase font-bold">{q.mode || 'LIVE'}</span>
                              {q.event_name && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[140px] text-slate-500">Currently: {q.event_name}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={linkingQuizId === q.id}
                            onClick={() => handleLinkExistingQuiz(quizModalEvent, q.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            <Plus size={13} />
                            <span>{linkingQuizId === q.id ? 'Linking...' : 'Link to Event'}</span>
                          </button>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                {quizModalEvent.quizzes?.length || 0} quiz track(s) currently linked
              </span>
              <button
                type="button"
                onClick={() => setQuizModalEvent(null)}
                className="py-2 px-5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Premium Custom Confirmation Modal (Replaces native browser alert) */}
      {confirmDialog.isOpen && createPortal(
        <div className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto animate-scale-in">
            {/* Header Icon + Title */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                confirmDialog.confirmVariant === 'danger'
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : 'bg-purple-50 text-purple-600 border border-purple-100'
              }`}>
                {confirmDialog.confirmVariant === 'danger' ? (
                  confirmDialog.isDelink ? (
                    <Unlink size={22} className="text-rose-600" />
                  ) : (
                    <Trash2 size={22} className="text-rose-600" />
                  )
                ) : (
                  <AlertTriangle size={22} className="text-purple-600" />
                )}
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {confirmDialog.description}
                </p>
              </div>
            </div>

            {/* Quiz Context Card (if quiz is present) */}
            {confirmDialog.quiz && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-xs text-slate-800 truncate">
                    {confirmDialog.quiz.title}
                  </span>
                  {confirmDialog.quiz.mode && (
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-purple-600 text-white shadow-2xs shrink-0">
                      {confirmDialog.quiz.mode}
                    </span>
                  )}
                </div>
                {confirmDialog.event && (
                  <p className="text-[11px] text-slate-500 font-medium">
                    Currently linked to: <strong className="text-purple-700">{confirmDialog.event.name}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Safe Operation Guarantee Notice (if provided) */}
            {confirmDialog.safeNote && (
              <div className="flex items-start gap-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 text-[11px] text-emerald-800">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">
                  <strong>Data Safe Guarantee:</strong> {confirmDialog.safeNote}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                {confirmDialog.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                disabled={delinkingQuizId !== null}
                onClick={async () => {
                  if (confirmDialog.onConfirm) {
                    await confirmDialog.onConfirm();
                  }
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                  confirmDialog.confirmVariant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                }`}
              >
                {delinkingQuizId ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : confirmDialog.isDelink ? (
                  <Unlink size={14} />
                ) : (
                  <Trash2 size={14} />
                )}
                <span>{confirmDialog.confirmLabel || 'Confirm'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
