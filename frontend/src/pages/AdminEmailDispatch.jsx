import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Mail, Send, Users, CheckCircle2, AlertTriangle, Loader2, Sparkles,
  Filter, Search, RefreshCw, Eye, Edit3, ArrowRight, X, ExternalLink,
  BookOpen, Calendar, Radio, Check, Info, Layers, Tag, Award, UserCheck, Folder,
  Monitor, Smartphone
} from 'lucide-react';

export default function AdminEmailDispatch() {
  const [searchParams] = useSearchParams();
  const [loadingAudiences, setLoadingAudiences] = useState(true);
  const [audienceData, setAudienceData] = useState({
    all_students_count: 0,
    students: [],
    quizzes: [],
    events: []
  });

  // Audience selection: 'all_students' | 'event_registrants' | 'quiz_participants' | 'custom'
  const [audienceType, setAudienceType] = useState('all_students');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEventInfo, setSelectedEventInfo] = useState(null);
  
  // Participant Sub-filter: 'all' | 'completed' | 'not_completed' | 'in_progress'
  const [participantFilter, setParticipantFilter] = useState('all');
  const [eventCounts, setEventCounts] = useState({ total: 0, completed: 0, not_completed: 0, in_progress: 0 });
  const [quizCounts, setQuizCounts] = useState({ total: 0, completed: 0, not_completed: 0, in_progress: 0 });

  const [loadingQuizParticipants, setLoadingQuizParticipants] = useState(false);
  const [quizParticipants, setQuizParticipants] = useState([]);
  const [selectedQuizInfo, setSelectedQuizInfo] = useState(null);

  const [loadingEventParticipants, setLoadingEventParticipants] = useState(false);
  const [eventParticipants, setEventParticipants] = useState([]);

  const [customEmailsText, setCustomEmailsText] = useState('');

  // Selected / Excluded recipients
  const [excludedEmails, setExcludedEmails] = useState(new Set());
  const [recipientSearch, setRecipientSearch] = useState('');

  // Email Content
  const [subject, setSubject] = useState('');
  const [heading, setHeading] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');

  // Active input ref for inserting tags
  const messageBodyRef = useRef(null);

  // UI state
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'preview'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Available dynamic tags from registration & quiz context
  const dynamicTags = [
    { label: 'Full Name', tag: '{name}', desc: 'Student Name' },
    { label: 'Email', tag: '{email}', desc: 'Email address' },
    { label: 'College', tag: '{college}', desc: 'College name' },
    { label: 'Event Name', tag: '{event_name}', desc: 'Associated event' },
    { label: 'Quiz Title', tag: '{quiz_title}', desc: 'Title of quiz' },
    { label: 'Score', tag: '{score}', desc: 'Achieved score' },
    { label: 'Status', tag: '{status}', desc: 'Completion status' }
  ];

  // Fetch audiences on mount
  useEffect(() => {
    fetchAudiences();
  }, []);

  // Prevent background page scrolling while confirm modal is open
  useEffect(() => {
    if (showConfirmModal) {
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
  }, [showConfirmModal]);

  const fetchAudiences = async () => {
    try {
      setLoadingAudiences(true);
      setErrorMessage('');
      const res = await api.get('/api/admin/email-dispatch/audiences');
      if (res.data.success) {
        const rawEvents = res.data.events || [];
        const eventsList = [...rawEvents].sort((a, b) => {
          const timeA = Number(a.timestamp) || (a.createdAt ? new Date(a.createdAt).getTime() : (a.start_date ? new Date(a.start_date).getTime() : 0));
          const timeB = Number(b.timestamp) || (b.createdAt ? new Date(b.createdAt).getTime() : (b.start_date ? new Date(b.start_date).getTime() : 0));
          return timeB - timeA;
        });
        const quizzesList = res.data.quizzes || [];

        setAudienceData({
          all_students_count: res.data.all_students_count || 0,
          students: res.data.students || [],
          quizzes: quizzesList,
          events: eventsList
        });

        // Check if URL has ?eventId= or ?event=
        const urlEventId = searchParams.get('eventId') || searchParams.get('event');
        const urlEventName = searchParams.get('event') || searchParams.get('eventName');
        const urlQuizId = searchParams.get('quizId') || searchParams.get('quiz');

        if (urlQuizId && quizzesList.length > 0) {
          const matchQ = quizzesList.find(q =>
            String(q.id).toLowerCase() === String(urlQuizId).toLowerCase() ||
            String(q.join_code || '').toLowerCase() === String(urlQuizId).toLowerCase()
          ) || quizzesList[0];
          setAudienceType('quiz_participants');
          setSelectedQuizId(matchQ.id);
          setSelectedQuizInfo(matchQ);
          fetchQuizParticipants(matchQ.id, participantFilter);
          return;
        }

        if (urlEventId && eventsList.length > 0) {
          const urlLower = String(urlEventId).toLowerCase().trim();
          const matchEv = eventsList.find(e =>
            String(e.id).toLowerCase() === urlLower ||
            String(e.slug || '').toLowerCase() === urlLower ||
            e.name.toLowerCase() === urlLower ||
            e.name.toLowerCase().includes(urlLower) ||
            urlLower.includes(e.name.toLowerCase()) ||
            e.id.replace(/[^a-z0-9]/g, '') === urlLower.replace(/[^a-z0-9]/g, '')
          );

          const targetEvent = matchEv || { id: urlEventId, name: urlEventName || urlEventId };
          setAudienceType('event_registrants');
          setSelectedEventId(targetEvent.id);
          setSelectedEventInfo(targetEvent);
          fetchEventParticipants(targetEvent.id, targetEvent.name, participantFilter);

          // Auto-populate default template for this event
          setSubject(`📢 Announcement: Upcoming Technical Tracks for ${targetEvent.name}`);
          setHeading(`Welcome to ${targetEvent.name}`);
          setMessageBody(
            `Hello {name},\n\nWe are thrilled to welcome you to "${targetEvent.name}"! All assessment tracks, workshop links, and challenges are now active for participants from {college}.\n\nPlease review the guidelines and schedule below.\n\nRegards,\nMicrosoft Student Club PRPCEM`
          );
          setCtaText('Access Participant Portal');
          setCtaUrl(window.location.origin + '/courses');
          return;
        }

        if (quizzesList.length > 0 && (!selectedQuizId || !quizzesList.some(q => String(q.id) === String(selectedQuizId)))) {
          setSelectedQuizId(quizzesList[0].id);
          setSelectedQuizInfo(quizzesList[0]);
        }
        if (eventsList.length > 0 && (!selectedEventId || !eventsList.some(e => String(e.id) === String(selectedEventId)))) {
          setSelectedEventId(eventsList[0].id);
          setSelectedEventInfo(eventsList[0]);
        }
      }
    } catch (err) {
      console.error('Error loading audiences:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to load recipient audiences.');
    } finally {
      setLoadingAudiences(false);
    }
  };

  // Fetch participants when quiz selection or filter changes
  useEffect(() => {
    if (audienceType === 'quiz_participants' && selectedQuizId) {
      const found = audienceData.quizzes.find(q => String(q.id) === String(selectedQuizId));
      if (found) setSelectedQuizInfo(found);
      fetchQuizParticipants(selectedQuizId, participantFilter);
    }
  }, [audienceType, selectedQuizId, participantFilter, audienceData.quizzes]);

  // Fetch participants when event selection or filter changes
  useEffect(() => {
    if (audienceType === 'event_registrants' && selectedEventId) {
      const found = audienceData.events.find(e => String(e.id) === String(selectedEventId));
      if (found) setSelectedEventInfo(found);
      fetchEventParticipants(selectedEventId, found?.name, participantFilter);
    }
  }, [audienceType, selectedEventId, participantFilter, audienceData.events]);

  const fetchQuizParticipants = async (quizId, filter = participantFilter) => {
    try {
      setLoadingQuizParticipants(true);
      const res = await api.get(`/api/admin/email-dispatch/quiz-participants?quizId=${encodeURIComponent(quizId)}&participantFilter=${encodeURIComponent(filter)}`);
      if (res.data.success) {
        setQuizParticipants(res.data.participants || []);
        setQuizCounts({
          total: res.data.totalCount !== undefined ? res.data.totalCount : (res.data.participants || []).length,
          completed: res.data.completedCount || 0,
          not_completed: res.data.notCompletedCount || 0,
          in_progress: res.data.inProgressCount || 0
        });
        if (res.data.quiz) {
          setSelectedQuizInfo(res.data.quiz);
        }
        setExcludedEmails(new Set());
      }
    } catch (err) {
      console.error('Error loading quiz participants:', err);
    } finally {
      setLoadingQuizParticipants(false);
    }
  };

  const fetchEventParticipants = async (eventId, eventName, filter = participantFilter) => {
    try {
      setLoadingEventParticipants(true);
      const evNameQuery = eventName ? `&eventName=${encodeURIComponent(eventName)}` : '';
      const res = await api.get(`/api/admin/email-dispatch/event-participants?eventId=${encodeURIComponent(eventId)}${evNameQuery}&participantFilter=${encodeURIComponent(filter)}`);
      if (res.data.success) {
        setEventParticipants(res.data.participants || []);
        setEventCounts({
          total: res.data.totalCount !== undefined ? res.data.totalCount : (res.data.participants || []).length,
          completed: res.data.completedCount || 0,
          not_completed: res.data.notCompletedCount || 0,
          in_progress: res.data.inProgressCount || 0
        });
        setExcludedEmails(new Set());
      }
    } catch (err) {
      console.error('Error loading event participants:', err);
    } finally {
      setLoadingEventParticipants(false);
    }
  };

  // Insert dynamic tag into message body
  const insertTag = (tag) => {
    if (messageBodyRef.current) {
      const textarea = messageBodyRef.current;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const text = textarea.value;
      const replacement = text.substring(0, start) + tag + text.substring(end);
      setMessageBody(replacement);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      setMessageBody(prev => prev + ' ' + tag);
    }
  };

  // Compute active list of recipients based on selected audience
  const getCurrentRecipients = () => {
    let list = [];

    if (audienceType === 'all_students') {
      list = audienceData.students.map(s => ({
        email: (s.email || '').toLowerCase().trim(),
        name: s.name,
        college: s.college || '',
        meta: s.username ? `@${s.username}` : 'Student',
        quiz_status: 'registered',
        status: 'Registered Student'
      }));
    } else if (audienceType === 'event_registrants') {
      list = eventParticipants.map(p => ({
        email: (p.email || '').toLowerCase().trim(),
        name: p.name,
        college: p.college || '',
        meta: p.branch ? `${p.branch} (${p.year || ''})` : (p.source || 'Event Registered'),
        quiz_status: p.quiz_status || (p.status === 'Completed' ? 'completed' : 'not_completed'),
        status: p.status || 'Not Completed',
        score: p.score,
        phone: p.phone
      }));
    } else if (audienceType === 'quiz_participants') {
      list = quizParticipants.map(p => ({
        email: (p.email || '').toLowerCase().trim(),
        name: p.name,
        college: p.college || '',
        meta: p.source || 'Participant',
        quiz_status: p.quiz_status || (p.status === 'Completed' ? 'completed' : 'not_completed'),
        status: p.status || 'Registered',
        score: p.score
      }));
    } else if (audienceType === 'custom') {
      const emails = customEmailsText
        .split(/[\n,;]+/)
        .map(e => e.trim().toLowerCase())
        .filter(e => e.includes('@'));
      list = Array.from(new Set(emails)).map(e => ({
        email: e,
        name: e.split('@')[0],
        meta: 'Custom Email',
        quiz_status: 'custom',
        status: 'Custom'
      }));
    }

    if (recipientSearch.trim()) {
      const q = recipientSearch.toLowerCase().trim();
      list = list.filter(r => r.email.includes(q) || r.name.toLowerCase().includes(q) || (r.college && r.college.toLowerCase().includes(q)));
    }

    return list;
  };

  const currentRecipients = getCurrentRecipients();
  const activeCount = currentRecipients.filter(r => !excludedEmails.has(r.email)).length;

  const toggleExcludeEmail = (email) => {
    setExcludedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
      } else {
        next.add(email);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (excludedEmails.size === 0) {
      setExcludedEmails(new Set(currentRecipients.map(r => r.email)));
    } else {
      setExcludedEmails(new Set());
    }
  };

  // Quick preset templates with dynamic tags
  const applyPreset = (type) => {
    const qTitle = selectedQuizInfo?.title || '{quiz_title}';
    const evName = selectedEventInfo?.name || selectedQuizInfo?.event_name || '{event_name}';

    if (type === 'not_attended' || type === 'didnt_attend' || type === 'pending_quiz' || type === 'reminder') {
      setSubject(`📢 Action Required: You Registered for ${evName} but Missed the Quiz Assessment`);
      setHeading(`Registered But Didn't Attend — Missed Assessment`);
      setMessageBody(
        `Hello {name},\n\nOur records show that you successfully registered for "${evName}" from {college}, but have not yet attended or submitted your "${qTitle}" quiz assessment.\n\nDon't miss out on your performance ranking, score evaluation, and official MSC digital certificate! The assessment portal is still active for registered participants.\n\nPlease click the button below to start and submit your quiz attempt now.\n\nBest regards,\nMicrosoft Student Club PRPCEM`
      );
      setCtaText('Take Missed Assessment Now');
      setCtaUrl(window.location.origin + '/courses');
    } else if (type === 'results') {
      setSubject(`🏆 Results & Leaderboard Announced: ${evName}`);
      setHeading(`${evName} Results Published`);
      setMessageBody(
        `Hello {name},\n\nThe official scores and performance rankings for "${evName}" have been verified and published!\n\nYour recorded score: {score} pts.\n\nLog in to review your detailed scorecard, view your standing among participants from {college}, and access your digital certificate.\n\nThank you for participating!\n— Microsoft Student Club PRPCEM`
      );
      setCtaText('View Scorecard & Certificate');
      setCtaUrl(window.location.origin + '/student/profile');
    } else if (type === 'congratulations') {
      setSubject(`🎉 Congratulations on Completing ${evName}!`);
      setHeading(`Outstanding Achievement!`);
      setMessageBody(
        `Hello {name},\n\nCongratulations on successfully completing the "${evName}" assessment organized by the Microsoft Student Club PRPCEM!\n\nYour verified digital credential and badge are now ready to claim and showcase on your LinkedIn profile.\n\nKeep learning and building!\n— Microsoft Student Club PRPCEM`
      );
      setCtaText('Claim Digital Badge & Certificate');
      setCtaUrl(window.location.origin + '/student/profile');
    } else if (type === 'event_announcement') {
      setSubject(`📢 Announcement: Upcoming Technical Tracks for ${evName}`);
      setHeading(`Welcome to ${evName}`);
      setMessageBody(
        `Hello {name},\n\nWe are thrilled to welcome you to "${evName}"! All assessment tracks, workshop links, and challenges are now active for participants from {college}.\n\nPlease review the guidelines and schedule below.\n\nRegards,\nMicrosoft Student Club PRPCEM`
      );
      setCtaText('Access Participant Portal');
      setCtaUrl(window.location.origin + '/courses');
    }
  };

  // Submit email dispatch
  const handleSendDispatch = async () => {
    if (!subject.trim()) {
      setErrorMessage('Please enter an email subject line.');
      return;
    }
    if (!messageBody.trim()) {
      setErrorMessage('Please write a message body.');
      return;
    }
    if (activeCount === 0) {
      setErrorMessage('No active recipient emails selected to dispatch.');
      return;
    }

    try {
      setDispatching(true);
      setErrorMessage('');

      const res = await api.post('/api/admin/email-dispatch/send', {
        audienceType,
        eventId: audienceType === 'event_registrants' ? selectedEventId : undefined,
        eventName: audienceType === 'event_registrants' ? (selectedEventInfo?.name || searchParams.get('event')) : undefined,
        quizId: audienceType === 'quiz_participants' ? selectedQuizId : undefined,
        participantFilter: (audienceType === 'quiz_participants' || audienceType === 'event_registrants') ? participantFilter : undefined,
        customEmails: audienceType === 'custom' ? customEmailsText : undefined,
        excludedEmails: Array.from(excludedEmails),
        subject,
        heading: heading || subject,
        messageBody,
        ctaText: ctaText || undefined,
        ctaUrl: ctaUrl || undefined
      });

      if (res.data.success) {
        setDispatchResult(res.data);
        setShowConfirmModal(false);
      } else {
        setErrorMessage(res.data.error || 'Failed to dispatch emails.');
        setShowConfirmModal(false);
      }
    } catch (err) {
      console.error('Dispatch error:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to dispatch email broadcast.');
      setShowConfirmModal(false);
    } finally {
      setDispatching(false);
    }
  };

  // Helper for live preview rendering with sample student substitution
  const sampleRecipient = currentRecipients[0] || {
    name: 'Amit Yadav',
    email: 'amit.yadav@example.com',
    college: 'PRPCEM Amravati',
    score: 85
  };

  const currentEventTitle = selectedEventInfo?.name || searchParams.get('event') || selectedQuizInfo?.event_name || 'MSC Tech Masterclass';

  const renderPreviewText = (text) => {
    if (!text) return '';
    return text
      .replace(/\{name\}/gi, sampleRecipient.name || 'Amit Yadav')
      .replace(/\{student_name\}/gi, sampleRecipient.name || 'Amit Yadav')
      .replace(/\{email\}/gi, sampleRecipient.email || 'student@example.com')
      .replace(/\{college\}/gi, sampleRecipient.college || 'PRPCEM Amravati')
      .replace(/\{branch\}/gi, sampleRecipient.branch || 'CSE')
      .replace(/\{phone\}/gi, sampleRecipient.phone || '+91 9876543210')
      .replace(/\{quiz_title\}/gi, selectedQuizInfo?.title || currentEventTitle)
      .replace(/\{event_name\}/gi, currentEventTitle)
      .replace(/\{score\}/gi, sampleRecipient.score != null ? String(sampleRecipient.score) : '85')
      .replace(/\{status\}/gi, sampleRecipient.status || 'Registered');
  };

  const cleanPreviewBody = (messageBody || '').trim();
  const hasLeadingGreeting = /^(hello|dear|hi|hey|greetings|welcome)\b/i.test(cleanPreviewBody);

  return (
    <div className="space-y-6 animate-fade-in text-left pb-12 font-segoe max-w-7xl mx-auto">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 p-6 rounded-3xl shadow-sm gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600"></div>
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-[11px] font-black uppercase tracking-wider text-purple-700 mb-2">
            <Mail size={13} className="text-purple-600" />
            <span>Communications Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Email Broadcast & Dispatch Center
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Dispatch personalized announcements, quiz reminders, results, and certificates with dynamic placeholder tagging.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAudiences}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors cursor-pointer"
            title="Refresh audiences"
          >
            <RefreshCw size={16} className={loadingAudiences ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {dispatchResult && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between animate-fade-in">
          <div className="flex items-start space-x-3">
            <CheckCircle2 size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-black text-emerald-900">Email Broadcast Successful!</h3>
              <p className="text-xs text-emerald-800 font-medium">
                {dispatchResult.message} Dispatched to <strong>{dispatchResult.successCount}</strong> active recipient(s).
              </p>
            </div>
          </div>
          <button
            onClick={() => setDispatchResult(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs font-bold text-red-700 space-x-3 animate-shake">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-red-600 hover:text-red-800 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Grid: Left Audience & Recipients, Right Composer & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ════════ LEFT COLUMN: RECIPIENT AUDIENCE SELECTION (5 cols) ════════ */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users size={18} className="text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Select Audience</h2>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black">
                {activeCount} Active
              </span>
            </div>

            {/* Audience Type Radio Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => { setAudienceType('all_students'); setExcludedEmails(new Set()); }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  audienceType === 'all_students'
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-black'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Users ({audienceData.all_students_count})
              </button>

              <button
                type="button"
                onClick={() => { setAudienceType('event_registrants'); setExcludedEmails(new Set()); }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  audienceType === 'event_registrants'
                    ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-2xs font-black'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                By Event ({audienceData.events?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => {
                  setAudienceType('quiz_participants');
                  setExcludedEmails(new Set());
                  if (audienceData.quizzes.length > 0 && (!selectedQuizId || !audienceData.quizzes.some(q => String(q.id) === String(selectedQuizId)))) {
                    setSelectedQuizId(audienceData.quizzes[0].id);
                    setSelectedQuizInfo(audienceData.quizzes[0]);
                  }
                }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  audienceType === 'quiz_participants'
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-black'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                By Quiz ({audienceData.quizzes.length})
              </button>

              <button
                type="button"
                onClick={() => { setAudienceType('custom'); setExcludedEmails(new Set()); }}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  audienceType === 'custom'
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-black'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Custom
              </button>
            </div>

            {/* When By Event is selected: Event Dropdown + Completion Filters */}
            {audienceType === 'event_registrants' && (
              <div className="space-y-3.5 animate-fade-in bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                <div className="space-y-1">
                  <label className="block text-xs font-black text-purple-900">Select Official Event</label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value);
                      const ev = audienceData.events.find(item => String(item.id) === String(e.target.value));
                      if (ev) setSelectedEventInfo(ev);
                    }}
                    className="w-full border border-purple-200 rounded-xl px-3.5 py-2.5 text-xs font-bold bg-white text-slate-800 focus:border-purple-600 outline-none"
                  >
                    {audienceData.events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} — ({ev.registration_count || 0} Registered Students)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Quiz Completion Filter Group */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-extrabold text-purple-900 uppercase tracking-wider">
                    Quiz Completion Filter
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-white p-1 rounded-xl border border-purple-200">
                    <button
                      type="button"
                      onClick={() => { setParticipantFilter('all'); setExcludedEmails(new Set()); }}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                        participantFilter === 'all' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({eventCounts.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setParticipantFilter('completed'); setExcludedEmails(new Set()); }}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                        participantFilter === 'completed' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      Completed ({eventCounts.completed})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setParticipantFilter('not_attended'); setExcludedEmails(new Set()); }}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                        (participantFilter === 'not_attended' || participantFilter === 'not_completed') ? 'bg-amber-600 text-white shadow-2xs font-black' : 'text-amber-700 hover:text-amber-900 bg-amber-50/50'
                      }`}
                      title="Registered students who have not attended or submitted the quiz"
                    >
                      Didn't Attend ({eventCounts.not_completed})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setParticipantFilter('in_progress'); setExcludedEmails(new Set()); }}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                        participantFilter === 'in_progress' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-blue-700'
                      }`}
                    >
                      In Progress ({eventCounts.in_progress})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* When By Quiz is selected: Quiz Dropdown + Participant Subset Filters */}
            {audienceType === 'quiz_participants' && (
              <div className="space-y-3.5 animate-fade-in bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-blue-900">Select Quiz Assessment</label>
                    {loadingQuizParticipants && (
                      <span className="flex items-center space-x-1 text-[11px] font-bold text-blue-600 animate-pulse">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Loading participants...</span>
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedQuizId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setSelectedQuizId(newId);
                      const q = audienceData.quizzes.find(item => String(item.id) === String(newId));
                      if (q) setSelectedQuizInfo(q);
                    }}
                    className="w-full border border-blue-200 rounded-xl px-3.5 py-2.5 text-xs font-bold bg-white text-slate-800 focus:border-blue-600 outline-none"
                  >
                    {audienceData.quizzes.length === 0 ? (
                      <option value="" disabled>No quizzes found in database</option>
                    ) : (
                      audienceData.quizzes.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.title} — [{q.event_name || 'MSC Event'}] ({q.mode || 'LIVE'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Selected Quiz Context Banner & Quick Templates */}
                {selectedQuizInfo && (
                  <div className="bg-white border border-blue-200/80 rounded-xl p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider ${
                          selectedQuizInfo.mode === 'SCHEDULED'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {selectedQuizInfo.mode || 'LIVE'}
                        </span>
                        <span className="font-bold text-slate-700 truncate max-w-[180px]">
                          {selectedQuizInfo.title}
                        </span>
                      </div>
                      {selectedQuizInfo.join_code && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] rounded-md font-bold">
                          Code: {selectedQuizInfo.join_code}
                        </span>
                      )}
                    </div>

                    {/* Quick Template Fill Buttons */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[10px]">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Quick Fill:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSubject(`📢 Reminder: Take your "${selectedQuizInfo.title}" Assessment`);
                          setHeading(`Assessment Reminder: ${selectedQuizInfo.title}`);
                          setMessageBody(
                            `Hello {name},\n\nThis is a reminder regarding the assessment for "${selectedQuizInfo.title}".\n\n` +
                            `Please ensure you have completed your quiz before the deadline. If you have already started or submitted, please check your performance.\n\n` +
                            `Assessment: ${selectedQuizInfo.title}\n` +
                            `Candidate: {name}\n` +
                            `College: {college}\n\n` +
                            `Best regards,\nMicrosoft Student Club PRPCEM`
                          );
                          setCtaText('Take Assessment Now');
                          setCtaUrl(window.location.origin + `/quiz/join/${selectedQuizInfo.join_code || selectedQuizInfo.id}`);
                        }}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-bold transition-all cursor-pointer"
                      >
                        Reminder Template
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSubject(`🏆 Performance & Results: ${selectedQuizInfo.title}`);
                          setHeading(`Assessment Results: ${selectedQuizInfo.title}`);
                          setMessageBody(
                            `Dear {name},\n\nThank you for participating in "${selectedQuizInfo.title}"!\n\n` +
                            `Your recorded score is {score}.\n\n` +
                            `You can view the leaderboard and download your credential certificate from your participant portal.\n\n` +
                            `Congratulations on your effort!\n\n` +
                            `Warm regards,\nMicrosoft Student Club PRPCEM`
                          );
                          setCtaText('View Leaderboard & Certificate');
                          setCtaUrl(window.location.origin + `/courses`);
                        }}
                        className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md font-bold transition-all cursor-pointer"
                      >
                        Results Template
                      </button>
                    </div>
                  </div>
                )}

                {/* Participant Filter Pills: All, Completed, Didn't Attend, In Progress */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">
                    Quiz Completion Filter
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-white p-1 rounded-xl border border-blue-200">
                    <button
                      type="button"
                      onClick={() => { setParticipantFilter('all'); setExcludedEmails(new Set()); }}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                        participantFilter === 'all' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({quizCounts.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setParticipantFilter('completed'); setExcludedEmails(new Set()); }}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                        participantFilter === 'completed' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      Completed ({quizCounts.completed})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setParticipantFilter('not_attended'); setExcludedEmails(new Set()); }}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                        (participantFilter === 'not_attended' || participantFilter === 'not_completed') ? 'bg-amber-600 text-white shadow-2xs font-black' : 'text-amber-700 hover:text-amber-900 bg-amber-50/50'
                      }`}
                      title="Registered students who have not attended or submitted the quiz"
                    >
                      Didn't Attend ({quizCounts.not_completed})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setParticipantFilter('in_progress'); setExcludedEmails(new Set()); }}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                        participantFilter === 'in_progress' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-indigo-700'
                      }`}
                    >
                      In Progress ({quizCounts.in_progress})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* When Custom List is selected */}
            {audienceType === 'custom' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="block text-xs font-bold text-slate-700">Paste Comma or Line-Separated Emails</label>
                <textarea
                  rows={4}
                  value={customEmailsText}
                  onChange={(e) => setCustomEmailsText(e.target.value)}
                  placeholder="student1@prpcem.ac.in, student2@gmail.com..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 text-slate-800 focus:bg-white focus:border-blue-600 outline-none font-mono"
                />
              </div>
            )}

            {/* Recipient Search & Exclusion Table */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in recipient list..."
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 cursor-pointer whitespace-nowrap px-2"
                >
                  {excludedEmails.size === 0 ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Scrollable Recipient Checkboxes List */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                {currentRecipients.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 font-bold">
                    No recipients matching current filter.
                  </div>
                ) : (
                  currentRecipients.map((r) => {
                    const isChecked = !excludedEmails.has(r.email);
                    const isCompleted = r.quiz_status === 'completed' || r.status === 'Completed';
                    const isInProgress = r.quiz_status === 'in_progress' || r.status === 'In Progress';
                    return (
                      <div
                        key={r.email}
                        onClick={() => toggleExcludeEmail(r.email)}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                          isChecked
                            ? 'bg-white border-slate-200/80 text-slate-800 shadow-2xs'
                            : 'bg-slate-100/60 border-transparent text-slate-400 line-through opacity-60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <div className="truncate">
                            <div className="font-bold text-slate-800 text-[11px] truncate">
                              {r.name || r.email.split('@')[0]}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{r.email}</div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                          {isCompleted ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Completed {r.score != null ? `• ${r.score} pts` : ''}
                            </span>
                          ) : isInProgress ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                              In Progress
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 font-extrabold">
                              Registered • Didn't Attend
                            </span>
                          )}
                          {r.college && (
                            <span className="text-[9px] font-bold text-slate-400 block truncate max-w-[120px]">
                              {r.college}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ════════ RIGHT COLUMN: COMPOSER & PREVIEW TABS (7 cols) ════════ */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Quick Preset Buttons */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-purple-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Quick Template Presets</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('event_announcement')}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl text-[11px] font-black text-purple-700 transition-all cursor-pointer text-center"
              >
                📢 Announcement
              </button>
              <button
                type="button"
                onClick={() => applyPreset('not_attended')}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-[11px] font-black text-amber-800 transition-all cursor-pointer text-center"
                title="Send email reminder to students who registered but haven't attended the quiz"
              >
                📩 Didn't Attend Reminder
              </button>
              <button
                type="button"
                onClick={() => applyPreset('results')}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-[11px] font-black text-emerald-700 transition-all cursor-pointer text-center"
              >
                🏆 Results & Rank
              </button>
              <button
                type="button"
                onClick={() => applyPreset('congratulations')}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl text-[11px] font-black text-blue-700 transition-all cursor-pointer text-center"
              >
                🎉 Claim Certificate
              </button>
            </div>
          </div>

          {/* Tab Switcher: Compose vs Live Preview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'compose'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Edit3 size={14} />
                  <span>Compose Broadcast</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Eye size={14} />
                  <span>Student Live Preview</span>
                </button>
              </div>

              <div className="text-[11px] font-black text-slate-500">
                To: <span className="text-blue-600">{activeCount} Recipient(s)</span>
              </div>
            </div>

            {/* COMPOSE TAB */}
            {activeTab === 'compose' && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Dynamic Tag Selector Pills */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Tag size={12} className="text-purple-600" />
                    <span>Click to Insert Dynamic Placeholder Tag:</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {dynamicTags.map((dt) => (
                      <button
                        key={dt.tag}
                        type="button"
                        onClick={() => insertTag(dt.tag)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded-lg text-[11px] font-black border border-slate-200 transition-all cursor-pointer flex items-center space-x-1"
                        title={dt.desc}
                      >
                        <code>{dt.tag}</code>
                        <span className="text-[9px] text-slate-400 font-normal">({dt.label})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Line */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Email Subject Line *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 📢 Important Update: VisionX Season 2 Assessment Details"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                {/* Email Heading */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Email Banner Heading</label>
                  <input
                    type="text"
                    placeholder="e.g. VisionX Season 2 — Track 1 Assessment"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                {/* Message Body */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Personalized Message Body *</label>
                  <textarea
                    ref={messageBodyRef}
                    rows={8}
                    required
                    placeholder="Hello {name},\n\nWe are pleased to invite you to the upcoming session for {event_name}...\n\nRegards,\nMicrosoft Student Club PRPCEM"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-blue-600 font-sans leading-relaxed"
                  />
                </div>

                {/* Action CTA Button Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Call-to-Action Button Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Launch Assessment"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">Call-to-Action URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                {/* Dispatch Trigger Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={activeCount === 0 || !subject.trim() || !messageBody.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center space-x-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span>Review & Dispatch ({activeCount} Emails)</span>
                  </button>
                </div>
              </div>
            )}

            {/* LIVE PREVIEW TAB */}
            {activeTab === 'preview' && (
              <div className="space-y-4 animate-fade-in">
                {/* Header Controls: Sample student info + Device View toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black flex-shrink-0">
                      {(sampleRecipient.name || 'S').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                        <span>Previewing as:</span>
                        <span className="text-blue-700 font-black">{sampleRecipient.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">({sampleRecipient.email})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Target Institution: <strong className="text-slate-700">{sampleRecipient.college || 'PRPCEM Amravati'}</strong>
                        {sampleRecipient.score != null && (
                          <span className="ml-2 text-emerald-700 font-bold">• Score: {sampleRecipient.score}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Device Toggle (Desktop / Mobile) */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewDevice === 'desktop'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                      title="Desktop view (580px container)"
                    >
                      <Monitor size={13} />
                      <span className="text-[11px]">Desktop View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewDevice === 'mobile'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                      title="Mobile view (375px phone container)"
                    >
                      <Smartphone size={13} />
                      <span className="text-[11px]">Mobile View</span>
                    </button>
                  </div>
                </div>

                {/* Email Client Simulated Window */}
                <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-md bg-slate-100/90">
                  {/* Client Envelope Header */}
                  <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 space-y-1.5 text-xs font-sans">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200/60 pb-1.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">From:</span>
                        <span className="font-bold text-slate-800">Microsoft Student Club • PRPCEM</span>
                        <span className="text-slate-400 font-mono text-[10px]">&lt;mlsc@prpotepatilengg.ac.in&gt;</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                        Institutional SMTP Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">To:</span>
                      <span className="font-bold text-slate-700">{sampleRecipient.name}</span>
                      <span className="text-blue-600 font-mono text-[10px]">&lt;{sampleRecipient.email}&gt;</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs pt-0.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Subject:</span>
                      <span className="font-extrabold text-slate-900 truncate">
                        {renderPreviewText(subject || '(No Subject)')}
                      </span>
                    </div>
                  </div>

                  {/* Canvas Wrap (100% matches #f1f5f9 institutional email canvas) */}
                  <div className="p-4 sm:p-8 bg-[#f1f5f9] flex justify-center items-start min-h-[380px]">
                    {/* Actual Institutional Email Card (Identical to backend renderHtmlWrapper) */}
                    <div
                      className={`w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md transition-all duration-300 text-left ${
                        previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-[580px]'
                      }`}
                      style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                      }}
                    >
                      {/* Institutional Header Banner (#0f172a navy + 3px blue border) */}
                      <div
                        className="text-center p-6 text-white"
                        style={{
                          backgroundColor: '#0f172a',
                          borderBottom: '3px solid #2563eb'
                        }}
                      >
                        <div className="inline-block px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-blue-300 border border-blue-500/40 bg-blue-600/20">
                          Microsoft Student Club • PRPCEM
                        </div>
                        <h1
                          className="mt-3 text-white font-bold leading-tight tracking-tight break-words"
                          style={{
                            fontSize: previewDevice === 'mobile' ? '18px' : '22px'
                          }}
                        >
                          {renderPreviewText(heading || subject || 'MSC PRPCEM Announcement')}
                        </h1>
                      </div>

                      {/* Institutional Body Content */}
                      <div
                        className="p-6 sm:p-8 text-slate-700 space-y-4"
                        style={{
                          fontSize: '15px',
                          lineHeight: '1.65'
                        }}
                      >
                        {/* Auto-Greeting (matches backend logic: only if not already started with greeting) */}
                        {!hasLeadingGreeting && (
                          <p className="text-slate-900 font-medium m-0">
                            Hello <strong className="text-slate-900 font-bold">{sampleRecipient.name}</strong>,
                          </p>
                        )}

                        <div className="whitespace-pre-line text-slate-700 leading-relaxed break-words">
                          {renderPreviewText(
                            messageBody ||
                              'Your email message body will be rendered here with personalized tags.'
                          )}
                        </div>

                        {/* Action CTA Button */}
                        {ctaText && (
                          <div className="pt-4 pb-2 text-center">
                            <a
                              href={ctaUrl ? renderPreviewText(ctaUrl) : '#'}
                              onClick={(e) => e.preventDefault()}
                              className="inline-block px-7 py-3 text-white font-bold rounded-lg shadow-md cursor-pointer text-center text-sm"
                              style={{
                                backgroundColor: '#2563eb',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                              }}
                            >
                              {renderPreviewText(ctaText)} &rarr;
                            </a>
                            {ctaUrl && (
                              <p className="text-xs text-slate-400 text-center mt-2.5 break-all">
                                Link: <span className="text-blue-600 underline">{renderPreviewText(ctaUrl)}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Institutional Footer */}
                      <div
                        className="p-5 text-center text-xs space-y-1"
                        style={{
                          backgroundColor: '#f8fafc',
                          borderTop: '1px solid #e2e8f0',
                          color: '#64748b'
                        }}
                      >
                        <p className="font-bold text-slate-900 m-0 text-[13px]">
                          Microsoft Student Club (MSC)
                        </p>
                        <p className="text-slate-500 m-0 text-xs">
                          P.R. Pote (Patil) College of Engineering &amp; Management, Amravati
                        </p>
                        <p className="text-[11px] text-slate-400 m-0 pt-1">
                          Support:{' '}
                          <span className="text-blue-600 font-semibold">
                            mlsc@prpotepatilengg.ac.in
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && createPortal(
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[10000] animate-fade-in"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 text-left my-auto max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Send size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Confirm Email Broadcast</h3>
                <p className="text-xs text-slate-500">Personalized emails will be dispatched via SMTP.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 font-bold text-slate-700">
              <div className="flex justify-between">
                <span>Audience Mode:</span>
                <span className="text-blue-600 uppercase">{audienceType}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Recipients:</span>
                <span className="text-emerald-700 font-black">{activeCount} Student(s)</span>
              </div>
              <div className="flex justify-between">
                <span>Subject:</span>
                <span className="truncate max-w-[200px] text-slate-900">{subject}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendDispatch}
                disabled={dispatching}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {dispatching && <Loader2 size={14} className="animate-spin" />}
                <span>{dispatching ? 'Sending Broadcast...' : 'Yes, Dispatch Now'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
