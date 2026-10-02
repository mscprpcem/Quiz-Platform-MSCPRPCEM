import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import EventSelector from '../components/EventSelector';
import { useToast } from '../context/ToastContext';
import { formatToISTDateString } from '../utils/dateUtils';
import { downloadBrandedQRCard, fetchBrandingConfig, getLogoUrl } from '../utils/qrCardGenerator';
import { toggleOptionInSelection, normalizeSelection } from '../utils/fullscreen';
import {
  Calendar, ArrowLeft, ArrowRight, Plus, Trash2, Upload, FileSpreadsheet, FileText,
  CheckCircle, AlertTriangle, Clock, ShieldCheck, HelpCircle, Layers, CheckSquare, Sparkles, RefreshCw, QrCode, Mail, Award, ExternalLink, Download, Search, ChevronDown, Check, ToggleLeft
} from 'lucide-react';

export default function CreateScheduledQuiz() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams(); // If present, mode is EDIT
  const [searchParams] = useSearchParams();
  const preselectedEvent = searchParams.get('event') || '';

  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(isEditMode);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeFormat12, setTimeFormat12] = useState(true);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [branding, setBranding] = useState(null);

  // Category Search & Create State
  const DEFAULT_CATEGORIES = [
    'Cloud & Azure',
    'Database Management (DBMS)',
    'Data Structures & Algorithms (DSA)',
    'DevOps & CI/CD',
    'Web Development',
    'Artificial Intelligence & ML',
    'Cybersecurity',
    'Programming Languages',
    'General CS'
  ];
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  // Occurrence Sections State
  const [customSections, setCustomSections] = useState({});
  const [activeSectionFilter, setActiveSectionFilter] = useState(0); // 0 = All Sections

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchExistingCategories = async () => {
      try {
        const res = await api.get('/api/quizzes');
        const existing = (res.data || [])
          .map(q => q.subject)
          .filter(Boolean);
        if (existing.length > 0) {
          setCategoriesList(prev => Array.from(new Set([...prev, ...existing])));
        }
      } catch (e) {
        // fallback
      }
    };
    const loadBranding = async () => {
      try {
        const brand = await fetchBrandingConfig();
        setBranding(brand);
      } catch (e) {
        console.error('Failed to load branding in CreateScheduledQuiz:', e);
      }
    };
    fetchExistingCategories();
    loadBranding();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const now = new Date();
  const currentHour = now.getHours();
  const currentAmpm = currentHour >= 12 ? 'PM' : 'AM';
  const startHh = String((currentHour % 12) || 12).padStart(2, '0');
  const endHour = (currentHour + 2) % 24;
  const endAmpm = endHour >= 12 ? 'PM' : 'AM';
  const endHh = String((endHour % 12) || 12).padStart(2, '0');

  const [formData, setFormData] = useState({
    title: '',
    event_id: '',
    event_name: preselectedEvent || '',
    custom_slug: '',
    description: '',
    category: 'Cloud & Azure',
    difficulty: 'Intermediate',
    instructions: 'Complete all questions within the allocated time window.',
    schedule_type: 'ONE_TIME',
    start_date: today,
    end_date: today,
    
    // Time with seconds & AM/PM
    start_time_hh: startHh,
    start_time_mm: '00',
    start_time_ss: '00',
    start_time_ampm: currentAmpm,

    end_time_hh: endHh,
    end_time_mm: '00',
    end_time_ss: '00',
    end_time_ampm: endAmpm,

    timezone: 'Asia/Kolkata',

    // Granular Recurrence Settings
    days_of_week: ['MON'],
    weeks_pattern: '1_3',
    day_of_month: 1,
    custom_interval_days: 3,

    // Quiz Rules & Proctoring
    time_limit: 30,
    max_attempts: 1,
    score_policy: 'BEST',
    shuffle_questions: true,
    shuffle_answers: true,
    require_fullscreen: false,
    anti_cheat_enabled: true,
    max_violations: 3,
    positive_marks: 1,
    negative_marks: 0,
    show_leaderboard: true,

    // Digital Badge & Certification
    issue_badge: true,
    badge_sys_id: '',
    badge_title: 'Microsoft Azure & Cloud Fundamentals Master',

    // Questions List
    questions: []
  });

  const [isSlugCustomized, setIsSlugCustomized] = useState(!!id);

  // Helper to format Date object into local YYYY-MM-DD string
  const formatLocalDate = (d) => {
    if (!d) return '';
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch Available Badges from Verification Portal
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoadingBadges(true);
        const res = await api.get('/api/student/available-badges');
        if (res.data?.badges && Array.isArray(res.data.badges)) {
          setAvailableBadges(res.data.badges);
        }
      } catch (err) {
        console.warn('Failed to load badges list:', err);
      } finally {
        setLoadingBadges(false);
      }
    };
    fetchBadges();
  }, []);

  // Pre-fill quiz data if editing
  useEffect(() => {
    if (!id) return;
    const fetchQuizDetails = async () => {
      try {
        setLoadingQuiz(true);
        const res = await api.get(`/api/scheduled-quizzes/${id}`);
        const q = res.data?.quiz;
        if (q) {
          let sConf = {};
          try { sConf = typeof q.schedule_config === 'string' ? JSON.parse(q.schedule_config) : (q.schedule_config || {}); } catch(e){}

          const startDateStr = sConf.start_date || (q.scheduled_start ? formatLocalDate(q.scheduled_start) : today);
          const endDateStr = sConf.end_date || (q.scheduled_end ? formatLocalDate(q.scheduled_end) : startDateStr);

          // Helper to parse 24-hr time string (HH:MM:SS or HH:MM) into 12-hr AM/PM
          const parseTimeStrTo12Hr = (timeStr, defHh, defMm, defAmpm) => {
            if (!timeStr || !String(timeStr).includes(':')) {
              return { hh: defHh, mm: defMm, ss: '00', ampm: defAmpm };
            }
            const parts = String(timeStr).split(':');
            let h = parseInt(parts[0], 10);
            if (isNaN(h)) return { hh: defHh, mm: defMm, ss: '00', ampm: defAmpm };
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hh = String((h % 12) || 12).padStart(2, '0');
            const mm = String(parseInt(parts[1] || '0', 10)).padStart(2, '0');
            const ss = String(parseInt(parts[2] || '0', 10)).padStart(2, '0');
            return { hh, mm, ss, ampm };
          };

          let sHh = sConf.start_time_hh || '';
          let sMm = sConf.start_time_mm || '';
          let sSs = sConf.start_time_ss || '00';
          let sAmpm = sConf.start_time_ampm || '';

          if (!sHh || !sAmpm) {
            const parsedStart = parseTimeStrTo12Hr(sConf.start_time || q.start_time, '10', '00', 'AM');
            if (sConf.start_time || q.start_time) {
              sHh = parsedStart.hh;
              sMm = parsedStart.mm;
              sSs = parsedStart.ss;
              sAmpm = parsedStart.ampm;
            } else if (q.scheduled_start) {
              const sD = new Date(q.scheduled_start);
              if (!isNaN(sD.getTime())) {
                const h = sD.getHours();
                const m = sD.getMinutes();
                const s = sD.getSeconds();
                // Check if this is the UTC midnight artifact (5:30:00 AM)
                if (h === 5 && m === 30 && s === 0) {
                  sHh = '10'; sMm = '00'; sSs = '00'; sAmpm = 'AM';
                } else {
                  sAmpm = h >= 12 ? 'PM' : 'AM';
                  sHh = String((h % 12) || 12).padStart(2, '0');
                  sMm = String(m).padStart(2, '0');
                  sSs = String(s).padStart(2, '0');
                }
              }
            } else {
              sHh = '10'; sMm = '00'; sSs = '00'; sAmpm = 'AM';
            }
          }

          let eHh = sConf.end_time_hh || '';
          let eMm = sConf.end_time_mm || '';
          let eSs = sConf.end_time_ss || '00';
          let eAmpm = sConf.end_time_ampm || '';

          if (!eHh || !eAmpm) {
            const parsedEnd = parseTimeStrTo12Hr(sConf.end_time || q.end_time, '11', '00', 'AM');
            if (sConf.end_time || q.end_time) {
              eHh = parsedEnd.hh;
              eMm = parsedEnd.mm;
              eSs = parsedEnd.ss;
              eAmpm = parsedEnd.ampm;
            } else if (q.scheduled_end) {
              const eD = new Date(q.scheduled_end);
              if (!isNaN(eD.getTime())) {
                const h = eD.getHours();
                const m = eD.getMinutes();
                const s = eD.getSeconds();
                if (h === 5 && m === 30 && s === 0) {
                  eHh = '11'; eMm = '00'; eSs = '00'; eAmpm = 'AM';
                } else {
                  eAmpm = h >= 12 ? 'PM' : 'AM';
                  eHh = String((h % 12) || 12).padStart(2, '0');
                  eMm = String(m).padStart(2, '0');
                  eSs = String(s).padStart(2, '0');
                }
              }
            } else {
              eHh = '11'; eMm = '00'; eSs = '00'; eAmpm = 'AM';
            }
          }

          setFormData({
            title: q.title || '',
            event_id: q.event_id || '',
            event_name: q.event_name || (q.event?.name || ''),
            custom_slug: q.custom_slug || '',
            description: q.description || '',
            category: q.subject || 'Cloud',
            difficulty: q.difficulty || 'Intermediate',
            instructions: q.instructions || '',
            schedule_type: q.schedule_type || 'ONE_TIME',
            start_date: startDateStr,
            end_date: endDateStr,
            start_time_hh: sHh || '10',
            start_time_mm: sMm || '00',
            start_time_ss: sSs || '00',
            start_time_ampm: sAmpm || 'AM',
            end_time_hh: eHh || '11',
            end_time_mm: eMm || '00',
            end_time_ss: eSs || '00',
            end_time_ampm: eAmpm || 'AM',
            timezone: q.timezone || 'Asia/Kolkata',
            days_of_week: sConf.daysOfWeek || ['MON'],
            weeks_pattern: sConf.weeksPattern || '1_3',
            day_of_month: sConf.dayOfMonth || 1,
            custom_interval_days: sConf.customIntervalDays || 3,
            time_limit: q.time_limit || 30,
            max_attempts: q.max_attempts !== undefined ? q.max_attempts : 1,
            score_policy: q.score_policy || 'BEST',
            shuffle_questions: q.shuffle_questions !== undefined ? q.shuffle_questions : true,
            shuffle_answers: q.shuffle_answers !== undefined ? q.shuffle_answers : true,
            require_fullscreen: q.require_fullscreen !== undefined ? q.require_fullscreen : false,
            anti_cheat_enabled: q.anti_cheat_enabled !== undefined ? q.anti_cheat_enabled : true,
            max_violations: q.max_violations || 3,
            positive_marks: q.positive_marks || 1,
            negative_marks: q.negative_marks || 0,
            show_leaderboard: q.show_leaderboard !== undefined ? q.show_leaderboard : true,
            issue_badge: Boolean(q.badge_title || q.badge_sys_id),
            badge_sys_id: q.badge_sys_id || '',
            badge_title: q.badge_title || 'Microsoft Azure & Cloud Fundamentals Master',
            questions: sortQuestionsBySection(q.questions || [])
          });

          // Populate custom sections from loaded questions if present
          if (q.questions && Array.isArray(q.questions)) {
            const loadedSections = {};
            q.questions.forEach(ques => {
              const occNum = ques.occurrence_number || 1;
              if (ques.section_name) {
                loadedSections[occNum] = {
                  name: ques.section_name,
                  description: ques.section_description || ''
                };
              }
            });
            setCustomSections(loadedSections);
          }
        }
      } catch (err) {
        console.error('Fetch quiz for edit error:', err);
        setErrorMessage('Failed to load quiz details for editing.');
      } finally {
        setLoadingQuiz(false);
      }
    };

    fetchQuizDetails();
  }, [id]);

  // Helper to ensure questions are always organized sequentially by section/occurrence
  const sortQuestionsBySection = (questions) => {
    if (!Array.isArray(questions)) return [];
    return [...questions].sort((a, b) => {
      const secA = parseInt(a.occurrence_number || 1, 10);
      const secB = parseInt(b.occurrence_number || 1, 10);
      if (secA !== secB) return secA - secB;
      return 0;
    });
  };

  // Helper to format start/end time into 24-hour HH:mm:ss string for API payload
  const buildTimeString = (hh, mm, ss, ampm) => {
    let h = parseInt(hh || '0', 10);
    if (timeFormat12) {
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
    }
    const hStr = h.toString().padStart(2, '0');
    const mStr = (mm || '00').padStart(2, '0');
    const sStr = (ss || '00').padStart(2, '0');
    return `${hStr}:${mStr}:${sStr}`;
  };

  const handleDownloadPreviewQR = async () => {
    const code = formData.join_code || formData.custom_slug || 'PREVIEW';
    await downloadBrandedQRCard({
      svgElementId: 'create-scheduled-quiz-qr-svg',
      quizData: {
        title: formData.title || 'Scheduled Assessment',
        subtitle: formData.category || (formData.schedule_type ? `${formData.schedule_type} ASSESSMENT` : 'SCHEDULED ASSESSMENT'),
        custom_slug: formData.custom_slug,
        join_code: formData.join_code,
        join_url: `${typeof window !== 'undefined' ? window.location.origin : 'https://quiz.mscprpcem.tech'}/join/${code}`
      },
      brandData: branding,
      fileName: `quiz-${code}.png`
    });
  };

  // Step Validation Enforcer
  const validateTab = (tabIndex) => {
    setErrorMessage('');
    if (tabIndex === 1) {
      if (!formData.title.trim()) {
        setErrorMessage('Quiz Title is required.');
        return false;
      }
      if (!formData.start_date || !formData.end_date) {
        setErrorMessage('Start Date and End Date are required.');
        return false;
      }
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        setErrorMessage('Start Date cannot be after End Date.');
        return false;
      }
    }
    return true;
  };

  const handleNextTab = () => {
    if (validateTab(activeTab)) {
      setActiveTab(prev => Math.min(4, prev + 1));
    }
  };

  // CSV / Excel File Upload & Parser with dynamic Section Name mapping
  // CSV / Excel File Upload & Parser with dynamic Section Name mapping
  const handleFileUpload = (e, overrideSectionNumber = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (!rawData || rawData.length === 0) {
          toast.warning('No question rows found in uploaded file.', 'Empty File');
          return;
        }

        const sections = calculateScheduleOccurrences();
        const extractedSections = { ...customSections };

        // Determine default section target (e.g. Week 2 if user is on Week 2 tab or clicked section import)
        const defaultSectionNum = (overrideSectionNumber && overrideSectionNumber > 0)
          ? overrideSectionNumber
          : ((activeSectionFilter && activeSectionFilter > 0) ? activeSectionFilter : 1);

        const parsedQuestions = rawData.map((row, idx) => {
          // Normalize column names flexibly
          const qText = row.Question || row.question || row.QuestionText || row.Prompt || row.prompt || row.Title || '';
          if (!qText || String(qText).trim() === '') return null;

          const rawOptA = row['Option A'] || row['option a'] || row.option_a || row.OptionA || row.A || row.a || '';
          const rawOptB = row['Option B'] || row['option b'] || row.option_b || row.OptionB || row.B || row.b || '';
          const rawOptC = row['Option C'] || row['option c'] || row.option_c || row.OptionC || row.C || row.c || '';
          const rawOptD = row['Option D'] || row['option d'] || row.option_d || row.OptionD || row.D || row.d || '';
          const rawAnswer = (row['Correct Answer'] || row['correct answer'] || row.correct_answer || row.Correct || row.Answer || row.answer || 'A').toString().trim();
          const rawType = (row['Question Type'] || row['question_type'] || row.Type || row.type || '').toString().trim().toLowerCase();
          const explanation = row.Explanation || row.explanation || row.Rationale || row.solution || '';

          // Normalize answer
          let validAnswer = normalizeSelection(rawAnswer);
          const upperRaw = rawAnswer.toUpperCase();
          if (upperRaw === 'TRUE' || upperRaw === 'T') validAnswer = 'A';
          if (upperRaw === 'FALSE' || upperRaw === 'F') validAnswer = 'B';
          if (!validAnswer) validAnswer = 'A';

          // Detect Question Type
          let qType = 'single';
          if (rawType.includes('tf') || rawType.includes('true') || rawType.includes('bool')) {
            qType = 'true_false';
          } else if (rawType.includes('multi')) {
            qType = 'multiple';
          } else {
            const isTFOpts = (String(rawOptA).toLowerCase() === 'true' || String(rawOptA).toLowerCase() === 't') && (!rawOptC && !rawOptD);
            const isTFAns = ['true', 'false', 't', 'f'].includes(rawAnswer.toLowerCase());
            if (isTFOpts || isTFAns) {
              qType = 'true_false';
            } else if (validAnswer.includes(',')) {
              qType = 'multiple';
            }
          }

          let optA = String(rawOptA).trim();
          let optB = String(rawOptB).trim();
          let optC = String(rawOptC).trim();
          let optD = String(rawOptD).trim();

          if (qType === 'true_false') {
            optA = optA || 'True';
            optB = optB || 'False';
            optC = '';
            optD = '';
          } else {
            optA = optA || 'Option A';
            optB = optB || 'Option B';
            optC = optC || 'Option C';
            optD = optD || 'Option D';
          }

          // Section mapping:
          // 1. If user clicked upload for a specific round or is filtering on a specific round tab, map imported questions to that round
          // 2. Otherwise, read explicit Section/Occurrence column from the spreadsheet
          let secNum = (overrideSectionNumber && overrideSectionNumber > 0)
            ? overrideSectionNumber
            : ((activeSectionFilter && activeSectionFilter > 0) ? activeSectionFilter : defaultSectionNum);

          if (!overrideSectionNumber && (!activeSectionFilter || activeSectionFilter <= 0)) {
            const rawSec = row.Section || row.section || row.Occurrence || row.occurrence || row.Round || row.round || row.Week || row.week || row.Day || row.day || row.Session || row.session;
            if (rawSec !== undefined && String(rawSec).trim() !== '') {
              const parsedNum = parseInt(String(rawSec).replace(/[^0-9]/g, ''), 10);
              if (!isNaN(parsedNum) && parsedNum > 0) {
                secNum = parsedNum;
              }
            }
          }

          const secNameInFile = row['Section Name'] || row.section_name || row['Section Title'] || row.section_title || row['Round Name'] || row.round_name;
          if (secNameInFile && typeof secNameInFile === 'string' && secNameInFile.trim()) {
            extractedSections[secNum] = {
              ...(extractedSections[secNum] || {}),
              name: secNameInFile.trim()
            };
          }

          const secInfo = sections.find(s => s.number === secNum) || sections[0];
          const secName = extractedSections[secNum]?.name || customSections[secNum]?.name || secInfo?.name || `Section ${secNum}`;
          const secDesc = extractedSections[secNum]?.description || customSections[secNum]?.description || secInfo?.description || '';

          return {
            id: `imported-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            question: String(qText).trim(),
            option_a: optA,
            option_b: optB,
            option_c: optC,
            option_d: optD,
            correct_answer: validAnswer,
            question_type: qType,
            explanation: String(explanation).trim(),
            timer: parseInt(row.Timer || row.timer || row['Time Limit'] || '30', 10) || 30,
            marks: parseInt(row.Marks || row.marks || row.Points || row.points || '1', 10) || 1,
            occurrence_number: secNum,
            section_name: secName,
            section_description: secDesc
          };
        }).filter(Boolean);

        if (parsedQuestions.length === 0) {
          toast.error('No valid questions found in uploaded file.', 'Import Failed');
          return;
        }

        if (Object.keys(extractedSections).length > 0) {
          setCustomSections(extractedSections);
        }

        setFormData(prev => {
          // Remove empty placeholder questions in the target imported sections so they do not bloat the count
          const targetSectionNumbers = new Set(parsedQuestions.map(q => q.occurrence_number));
          const cleanedPrev = prev.questions.filter(q => {
            const isEmpty = !q.question || !q.question.trim();
            const isTargetSec = targetSectionNumbers.has(q.occurrence_number || 1);
            return !(isEmpty && isTargetSec);
          });
          return {
            ...prev,
            questions: sortQuestionsBySection([...cleanedPrev, ...parsedQuestions])
          };
        });

        const secCounts = {};
        parsedQuestions.forEach(q => {
          secCounts[q.occurrence_number] = (secCounts[q.occurrence_number] || 0) + 1;
        });
        const summary = Object.entries(secCounts).map(([s, count]) => {
          const sName = customSections[s]?.name || sections.find(x => x.number === Number(s))?.name || `Section ${s}`;
          return `${count} → ${sName}`;
        }).join(', ');

        toast.success(`Imported ${parsedQuestions.length} questions (${summary})!`, 'Import Complete');
      } catch (err) {
        console.error('CSV/Excel parse error:', err);
        toast.error('Failed to parse spreadsheet. Please ensure standard column headers: Section, Section Name, Question, Option A, Option B, Option C, Option D, Correct Answer.', 'Import Error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Calculate schedule occurrences dynamically from date range and frequency pattern
  const calculateScheduleOccurrences = () => {
    if (!formData.start_date) return [{ number: 1, name: 'Round 1', dateLabel: '', description: '' }];
    try {
      const [sY, sM, sD] = formData.start_date.split('-').map(Number);
      const start = new Date(sY, sM - 1, sD);
      const [eY, eM, eD] = (formData.end_date || formData.start_date).split('-').map(Number);
      const end = new Date(eY, eM - 1, eD);

      const dayMap = { 'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6 };
      const list = [];
      let count = 1;
      let curr = new Date(start);

      if (formData.schedule_type === 'ONE_TIME') {
        const title = customSections[1]?.name || `${formData.title || 'Session 1'} (One-Time)`;
        const desc = customSections[1]?.description || 'Complete all questions in this session.';
        list.push({
          number: 1,
          name: title,
          dateLabel: formatToISTDateString(start, { month: 'short', day: 'numeric', year: 'numeric' }),
          description: desc
        });
      } else if (formData.schedule_type === 'DAILY') {
        while (curr <= end && count <= 60) {
          const title = customSections[count]?.name || `Day ${count}`;
          const desc = customSections[count]?.description || `Daily assessment round for Day ${count}`;
          list.push({
            number: count,
            name: title,
            dateLabel: formatToISTDateString(curr, { month: 'short', day: 'numeric', year: 'numeric' }),
            description: desc
          });
          curr.setDate(curr.getDate() + 1);
          count++;
        }
      } else if (formData.schedule_type === 'WEEKLY') {
        const targetDays = (formData.days_of_week && formData.days_of_week.length > 0)
          ? formData.days_of_week.map(d => dayMap[d]).filter(d => d !== undefined)
          : null;

        while (curr <= end && count <= 52) {
          const dayOfWeek = curr.getDay();
          if (!targetDays || targetDays.includes(dayOfWeek)) {
            const title = customSections[count]?.name || `Week ${count}`;
            const desc = customSections[count]?.description || `Weekly assessment round for Week ${count}`;
            list.push({
              number: count,
              name: title,
              dateLabel: formatToISTDateString(curr, { month: 'short', day: 'numeric', year: 'numeric' }),
              description: desc
            });
            count++;
          }
          curr.setDate(curr.getDate() + 1);
        }
      } else if (formData.schedule_type === 'BIWEEKLY') {
        while (curr <= end && count <= 30) {
          const title = customSections[count]?.name || `Biweekly #${count}`;
          const desc = customSections[count]?.description || `Biweekly round #${count}`;
          list.push({
            number: count,
            name: title,
            dateLabel: formatToISTDateString(curr, { month: 'short', day: 'numeric', year: 'numeric' }),
            description: desc
          });
          curr.setDate(curr.getDate() + 14);
          count++;
        }
      } else if (formData.schedule_type === 'MONTHLY') {
        while (curr <= end && count <= 24) {
          const title = customSections[count]?.name || `Month ${count}`;
          const desc = customSections[count]?.description || `Monthly assessment round #${count}`;
          list.push({
            number: count,
            name: title,
            dateLabel: formatToISTDateString(curr, { month: 'short', day: 'numeric', year: 'numeric' }),
            description: desc
          });
          curr.setMonth(curr.getMonth() + 1);
          count++;
        }
      } else {
        // CUSTOM
        const step = parseInt(formData.custom_interval_days || 3, 10);
        while (curr <= end && count <= 30) {
          const title = customSections[count]?.name || `Round ${count}`;
          const desc = customSections[count]?.description || `Custom interval round #${count}`;
          list.push({
            number: count,
            name: title,
            dateLabel: formatToISTDateString(curr, { month: 'short', day: 'numeric', year: 'numeric' }),
            description: desc
          });
          curr.setDate(curr.getDate() + step);
          count++;
        }
      }

      return list.length > 0 ? list : [{ number: 1, name: 'Round 1', dateLabel: formatToISTDateString(start), description: '' }];
    } catch (e) {
      return [{ number: 1, name: 'Round 1', dateLabel: '', description: '' }];
    }
  };

  const handleAddQuestion = (targetOccurrenceNumber, count = 1) => {
    const occNumber = (targetOccurrenceNumber !== undefined && targetOccurrenceNumber > 0)
      ? targetOccurrenceNumber 
      : (activeSectionFilter > 0 ? activeSectionFilter : 1);
    const sections = calculateScheduleOccurrences();
    const sectionInfo = sections.find(s => s.number === occNumber);
    const secName = customSections[occNumber]?.name || sectionInfo?.name || `Section ${occNumber}`;
    const secDesc = customSections[occNumber]?.description || sectionInfo?.description || '';

    const newQuestions = Array.from({ length: count }, () => ({
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      question_type: 'single',
      explanation: '',
      occurrence_number: occNumber,
      section_name: secName,
      section_description: secDesc
    }));

    setFormData(prev => ({
      ...prev,
      questions: sortQuestionsBySection([...prev.questions, ...newQuestions])
    }));
  };

  const handleDistributeEvenly = () => {
    const sections = calculateScheduleOccurrences();
    if (sections.length === 0 || formData.questions.length === 0) {
      alert('Please add questions first to distribute across sections.');
      return;
    }
    
    const updated = formData.questions.map((q, idx) => {
      const sectionIdx = idx % sections.length;
      const targetSec = sections[sectionIdx];
      return {
        ...q,
        occurrence_number: targetSec.number,
        section_name: customSections[targetSec.number]?.name || targetSec.name,
        section_description: customSections[targetSec.number]?.description || targetSec.description
      };
    });

    setFormData(prev => ({ ...prev, questions: sortQuestionsBySection(updated) }));
    alert(`Successfully distributed ${formData.questions.length} questions across ${sections.length} sections (${Math.ceil(formData.questions.length / sections.length)} questions per section)!`);
  };

  const handleSortAndRenumber = () => {
    const sorted = sortQuestionsBySection(formData.questions);
    setFormData(prev => ({
      ...prev,
      questions: sorted
    }));
    toast.success(`Organized all ${sorted.length} questions in sequential order across rounds!`, 'Sequential Order');
  };

  const handleUpdateSectionMeta = (secNumber, field, value) => {
    setCustomSections(prev => ({
      ...prev,
      [secNumber]: {
        ...(prev[secNumber] || {}),
        [field]: value
      }
    }));
    // Also update questions in this section
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if ((q.occurrence_number || 1) === secNumber) {
          return {
            ...q,
            section_name: field === 'name' ? value : q.section_name,
            section_description: field === 'description' ? value : q.section_description
          };
        }
        return q;
      })
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, idx) => {
        if (idx === index) {
          return { ...q, [field]: value };
        }
        return q;
      })
    }));
  };

  const handleRemoveQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== index)
    }));
  };

  const handleRemoveEmptyQuestions = () => {
    const filtered = formData.questions.filter(q => q.question && q.question.trim().length > 0);
    const removedCount = formData.questions.length - filtered.length;
    if (removedCount === 0) {
      toast.info('No empty questions found.');
      return;
    }
    setFormData(prev => ({ ...prev, questions: filtered }));
    toast.success(`Removed ${removedCount} empty placeholder question(s).`, 'Cleaned');
  };

  const handleRemoveDuplicateQuestions = () => {
    const seen = new Set();
    const deduped = [];
    formData.questions.forEach(q => {
      const qClean = (q.question || '').trim().toLowerCase();
      const key = `${q.occurrence_number || 1}::${qClean}`;
      if (!qClean || !seen.has(key)) {
        if (qClean) seen.add(key);
        deduped.push(q);
      }
    });
    const removedCount = formData.questions.length - deduped.length;
    if (removedCount === 0) {
      toast.info('No duplicate questions found.');
      return;
    }
    setFormData(prev => ({ ...prev, questions: deduped }));
    toast.success(`Removed ${removedCount} duplicate question(s).`, 'Deduplicated');
  };

  const handleFixOutOfBoundsQuestions = () => {
    const sections = calculateScheduleOccurrences();
    const maxSec = sections.length;
    if (maxSec === 0) return;
    const updated = formData.questions.map(q => {
      const occ = q.occurrence_number || 1;
      if (occ > maxSec || occ < 1) {
        const clamped = Math.min(maxSec, Math.max(1, occ));
        const secInfo = sections.find(s => s.number === clamped) || sections[0];
        return {
          ...q,
          occurrence_number: clamped,
          section_name: customSections[clamped]?.name || secInfo.name,
          section_description: customSections[clamped]?.description || secInfo.description
        };
      }
      return q;
    });
    setFormData(prev => ({ ...prev, questions: updated }));
    toast.success(`Reassigned out-of-range questions into your ${maxSec} active round(s).`, 'Reassigned');
  };

  const handleDeleteOutOfBoundsQuestions = () => {
    const sections = calculateScheduleOccurrences();
    const validSectionNumbers = new Set(sections.map(s => s.number));
    const filtered = formData.questions.filter(q => validSectionNumbers.has(q.occurrence_number || 1));
    const removedCount = formData.questions.length - filtered.length;
    setFormData(prev => ({ ...prev, questions: filtered }));
    toast.success(`Removed ${removedCount} out-of-range question(s).`, 'Deleted');
  };

  const handleClearSectionQuestions = (secNumber) => {
    const sections = calculateScheduleOccurrences();
    const secName = customSections[secNumber]?.name || sections.find(s => s.number === secNumber)?.name || `Round ${secNumber}`;
    if (window.confirm(`Are you sure you want to remove all questions in ${secName}?`)) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter(q => (q.occurrence_number || 1) !== secNumber)
      }));
      toast.info(`Cleared all questions in ${secName}.`);
    }
  };

  const handleToggleDayOfWeek = (dayCode) => {
    setFormData(prev => {
      const exists = prev.days_of_week.includes(dayCode);
      const updated = exists 
        ? prev.days_of_week.filter(d => d !== dayCode)
        : [...prev.days_of_week, dayCode];
      return { ...prev, days_of_week: updated.length ? updated : [dayCode] };
    });
  };

  // Download Dynamic CSV or Excel Template tailored to schedule type (Weekly, Biweekly, Monthly, Daily, One-Time, Custom)
  const handleDownloadTemplate = (format = 'xlsx', targetSectionNum = null) => {
    const scheduleType = formData.schedule_type || 'ONE_TIME';
    const sections = calculateScheduleOccurrences();
    const sampleData = [];

    if (targetSectionNum && targetSectionNum > 0) {
      const secInfo = sections.find(s => s.number === targetSectionNum) || { number: targetSectionNum, name: `Section ${targetSectionNum}` };
      const secName = customSections[targetSectionNum]?.name || secInfo.name || `Section ${targetSectionNum}`;
      
      // Sample questions tailored specifically for this section
      sampleData.push({
        'Section': targetSectionNum,
        'Section Name': secName,
        'Question': `[${secName} - Single Choice Example] What is a primary benefit of cloud scalability?`,
        'Option A': 'Elastic scaling and on-demand resource allocation',
        'Option B': 'Fixed hardware lifecycle constraints',
        'Option C': 'Manual physical cabling requirement',
        'Option D': 'Static infrastructure limits',
        'Correct Answer': 'A',
        'Question Type': 'Single Choice',
        'Timer': 30,
        'Marks': 1,
        'Explanation': 'Cloud scalability delivers elastic, automatic resource allocation on-demand.'
      });

      sampleData.push({
        'Section': targetSectionNum,
        'Section Name': secName,
        'Question': `[${secName} - True/False Example] HTTPS encrypts web communications with TLS/SSL.`,
        'Option A': 'True',
        'Option B': 'False',
        'Option C': '',
        'Option D': '',
        'Correct Answer': 'A',
        'Question Type': 'True/False',
        'Timer': 20,
        'Marks': 1,
        'Explanation': 'True. HTTPS uses Transport Layer Security (TLS) to encrypt HTTP traffic.'
      });

      sampleData.push({
        'Section': targetSectionNum,
        'Section Name': secName,
        'Question': `[${secName} - Multi-Choice Example] Which of the following are cloud service models? (Select all that apply)`,
        'Option A': 'IaaS (Infrastructure as a Service)',
        'Option B': 'PaaS (Platform as a Service)',
        'Option C': 'SaaS (Software as a Service)',
        'Option D': 'HaaS (Hardware as a Script)',
        'Correct Answer': 'A, B, C',
        'Question Type': 'Multiple Choice',
        'Timer': 45,
        'Marks': 1,
        'Explanation': 'IaaS, PaaS, and SaaS are the three standardized cloud service models.'
      });
    } else if (sections.length > 1) {
      // Multi-Section Template: Demonstrate clearly how Week 1 and Week 2 map via the 'Section' column
      const sec1 = sections[0] || { number: 1, name: 'Week 1' };
      const sec1Name = customSections[1]?.name || sec1.name || 'Week 1';
      const sec2 = sections[1] || { number: 2, name: 'Week 2' };
      const sec2Name = customSections[2]?.name || sec2.name || 'Week 2';

      // Week 1 questions (Section: 1)
      sampleData.push({
        'Section': 1,
        'Section Name': sec1Name,
        'Question': `[${sec1Name} Sample 1] What does CPU stand for in computer systems?`,
        'Option A': 'Central Processing Unit',
        'Option B': 'Central Program Utility',
        'Option C': 'Computer Personal Unit',
        'Option D': 'Central Processor Unifier',
        'Correct Answer': 'A',
        'Question Type': 'Single Choice',
        'Timer': 30,
        'Marks': 1,
        'Explanation': 'CPU is the Central Processing Unit that executes instructions.'
      });

      sampleData.push({
        'Section': 1,
        'Section Name': sec1Name,
        'Question': `[${sec1Name} Sample 2] HTTP transmits data in cleartext without encryption by default.`,
        'Option A': 'True',
        'Option B': 'False',
        'Option C': '',
        'Option D': '',
        'Correct Answer': 'A',
        'Question Type': 'True/False',
        'Timer': 20,
        'Marks': 1,
        'Explanation': 'True. HTTP is unencrypted; HTTPS provides TLS encryption.'
      });

      // Week 2 questions (Section: 2) -> Shows how setting Section to 2 puts questions into Week 2
      sampleData.push({
        'Section': 2,
        'Section Name': sec2Name,
        'Question': `[${sec2Name} Sample 1] Which of the following are cloud compute services? (Select all that apply)`,
        'Option A': 'Amazon EC2',
        'Option B': 'AWS Lambda',
        'Option C': 'Amazon S3',
        'Option D': 'Amazon ECS',
        'Correct Answer': 'A, B, D',
        'Question Type': 'Multiple Choice',
        'Timer': 45,
        'Marks': 1,
        'Explanation': 'EC2, Lambda, and ECS provide compute capacity. S3 is object storage.'
      });

      sampleData.push({
        'Section': 2,
        'Section Name': sec2Name,
        'Question': `[${sec2Name} Sample 2] Relational databases only support unstructured JSON documents.`,
        'Option A': 'True',
        'Option B': 'False',
        'Option C': '',
        'Option D': '',
        'Correct Answer': 'B',
        'Question Type': 'True/False',
        'Timer': 20,
        'Marks': 1,
        'Explanation': 'False. Relational databases use structured tables with schemas.'
      });
    } else {
      // Single Section / One-Time Template
      sampleData.push({
        'Section': 1,
        'Section Name': customSections[1]?.name || 'Round 1',
        'Question': 'What does CPU stand for in computer systems?',
        'Option A': 'Central Processing Unit',
        'Option B': 'Central Program Utility',
        'Option C': 'Computer Personal Unit',
        'Option D': 'Central Processor Unifier',
        'Correct Answer': 'A',
        'Question Type': 'Single Choice',
        'Timer': 30,
        'Marks': 1,
        'Explanation': 'CPU is the Central Processing Unit that executes instructions.'
      });

      sampleData.push({
        'Section': 1,
        'Section Name': customSections[1]?.name || 'Round 1',
        'Question': 'HTTP transmits data in cleartext without encryption by default.',
        'Option A': 'True',
        'Option B': 'False',
        'Option C': '',
        'Option D': '',
        'Correct Answer': 'A',
        'Question Type': 'True/False',
        'Timer': 20,
        'Marks': 1,
        'Explanation': 'True. HTTP is unencrypted; HTTPS provides TLS encryption.'
      });

      sampleData.push({
        'Section': 1,
        'Section Name': customSections[1]?.name || 'Round 1',
        'Question': 'Which of the following are primitive data types in JavaScript? (Select all that apply)',
        'Option A': 'String',
        'Option B': 'Number',
        'Option C': 'Object',
        'Option D': 'Boolean',
        'Correct Answer': 'A, B, D',
        'Question Type': 'Multiple Choice',
        'Timer': 30,
        'Marks': 1,
        'Explanation': 'String, Number, and Boolean are primitives; Object is a reference type.'
      });
    }

    const sectionSuffix = (targetSectionNum && targetSectionNum > 0) ? `_section_${targetSectionNum}` : '';
    const baseFileName = `${(formData.title || 'scheduled_quiz').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${scheduleType.toLowerCase()}${sectionSuffix}_template`;
    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 10 }, // Section
      { wch: 22 }, // Section Name
      { wch: 55 }, // Question
      { wch: 32 }, // Option A
      { wch: 32 }, // Option B
      { wch: 32 }, // Option C
      { wch: 32 }, // Option D
      { wch: 18 }, // Correct Answer
      { wch: 18 }, // Question Type
      { wch: 10 }, // Timer
      { wch: 10 }, // Marks
      { wch: 45 }  // Explanation
    ];

    if (format === 'csv') {
      const csvOutput = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${baseFileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Questions');
      XLSX.writeFile(wb, `${baseFileName}.xlsx`);
    }
  };

  const handlePublishSubmit = async () => {
    if (!validateTab(1)) return;

    const startTimeStr = buildTimeString(formData.start_time_hh, formData.start_time_mm, formData.start_time_ss, formData.start_time_ampm);
    const endTimeStr = buildTimeString(formData.end_time_hh, formData.end_time_mm, formData.end_time_ss, formData.end_time_ampm);

    // Compute exact IST ISO strings (+05:30)
    let startIso = null;
    let endIso = null;
    try {
      const sDateObj = new Date(`${formData.start_date}T${startTimeStr}+05:30`);
      startIso = !isNaN(sDateObj.getTime()) ? sDateObj.toISOString() : null;

      const eDateObj = new Date(`${formData.end_date || formData.start_date}T${endTimeStr}+05:30`);
      endIso = !isNaN(eDateObj.getTime()) ? eDateObj.toISOString() : null;
    } catch(e) {
      console.warn('ISO date calculation warning:', e);
    }

    const payload = {
      title: formData.title,
      event_id: formData.event_id || null,
      event_name: formData.event_name || formData.title,
      custom_slug: formData.custom_slug,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      instructions: formData.instructions,
      schedule_type: formData.schedule_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      start_time: startTimeStr,
      end_time: endTimeStr,
      start_iso: startIso,
      end_iso: endIso,
      timezone: formData.timezone,
      time_limit: formData.time_limit,
      max_attempts: formData.max_attempts,
      score_policy: formData.score_policy,
      shuffle_questions: formData.shuffle_questions,
      shuffle_answers: formData.shuffle_answers,
      require_fullscreen: formData.require_fullscreen,
      anti_cheat_enabled: formData.anti_cheat_enabled,
      max_violations: formData.max_violations,
      positive_marks: formData.positive_marks,
      negative_marks: formData.negative_marks,
      show_leaderboard: formData.show_leaderboard,
      badge_sys_id: formData.issue_badge ? (formData.badge_sys_id || null) : null,
      badge_title: formData.issue_badge ? (formData.badge_title || 'Certified Master') : null,
      questions: formData.questions,
      schedule_config: {
        daysOfWeek: formData.days_of_week,
        weeksPattern: formData.weeks_pattern,
        dayOfMonth: formData.day_of_month,
        customIntervalDays: formData.custom_interval_days,
        start_date: formData.start_date,
        end_date: formData.end_date,
        start_time: startTimeStr,
        end_time: endTimeStr,
        start_time_hh: formData.start_time_hh,
        start_time_mm: formData.start_time_mm,
        start_time_ss: formData.start_time_ss,
        start_time_ampm: formData.start_time_ampm,
        end_time_hh: formData.end_time_hh,
        end_time_mm: formData.end_time_mm,
        end_time_ss: formData.end_time_ss,
        end_time_ampm: formData.end_time_ampm,
        start_iso: startIso,
        end_iso: endIso
      }
    };

    try {
      setSaving(true);
      if (isEditMode) {
        await api.put(`/api/scheduled-quizzes/${id}`, payload);
        toast.success('Scheduled Quiz updated successfully!', 'Saved');
      } else {
        await api.post('/api/scheduled-quizzes', payload);
        toast.success('Scheduled Quiz published successfully!', 'Published');
      }
      navigate('/admin/scheduled-quizzes');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save scheduled quiz.', 'Save Failed');
    } finally {
      setSaving(false);
    }
  };

  const DAYS = [
    { code: 'MON', label: 'Mon' },
    { code: 'TUE', label: 'Tue' },
    { code: 'WED', label: 'Wed' },
    { code: 'THU', label: 'Thu' },
    { code: 'FRI', label: 'Fri' },
    { code: 'SAT', label: 'Sat' },
    { code: 'SUN', label: 'Sun' }
  ];

  if (loadingQuiz) {
    return (
      <div className="py-20 text-center text-slate-400 font-extrabold animate-pulse">
        Loading quiz details for editing...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-segoe pb-16">
      
      {/* ════════ HEADER BAR ════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl shadow-2xs">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => navigate('/admin/scheduled-quizzes')}
            className="w-9 h-9 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
            title="Back to Scheduled Quizzes"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md inline-block mb-0.5">
              {isEditMode ? 'Scheduled Quiz Editor' : 'Scheduled Quiz Creator'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {isEditMode ? 'Edit Scheduled Quiz' : 'Create Scheduled Quiz'}
            </h1>
          </div>
        </div>

        <button
          onClick={handlePublishSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
        >
          {saving ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle size={14} />
              <span>{isEditMode ? 'Save Changes' : 'Publish Scheduled Quiz'}</span>
            </>
          )}
        </button>
      </div>

      {/* ════════ STEP TABS ════════ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 shadow-2xs flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
        {[
          { id: 1, step: '1', title: 'Basic & Recurrence' },
          { id: 2, step: '2', title: `Questions & Import`, count: formData.questions.length },
          { id: 3, step: '3', title: 'Rules & Proctoring' },
          { id: 4, step: '4', title: 'Review & Publish' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const isPassed = activeTab > tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (validateTab(activeTab)) setActiveTab(tab.id);
              }}
              className={`flex-1 min-w-[150px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 border ${
                isActive
                  ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-2xs'
                  : isPassed
                  ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-800 hover:bg-emerald-50'
                  : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : isPassed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {isPassed ? <Check size={11} strokeWidth={3} /> : tab.step}
              </span>
              <span>{tab.title}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-blue-200/70 text-blue-900' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-extrabold flex items-center space-x-2">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ════════ TAB 1: BASIC INFORMATION & RECURRENCE ════════ */}
      {activeTab === 1 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xs">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText size={15} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Basic Quiz Details</h3>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Quiz Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Azure Fundamentals Weekly Assessment"
                value={formData.title}
                onChange={e => {
                  const newTitle = e.target.value;
                  const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  setFormData(prev => ({
                    ...prev,
                    title: newTitle,
                    custom_slug: isSlugCustomized ? prev.custom_slug : autoSlug
                  }));
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Event Assignment Combobox */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Associated Event / Chapter <span className="text-slate-400 font-normal">(Optional — links quiz to official event tracks)</span>
              </label>
              <EventSelector
                value={formData.event_name}
                onChange={({ eventId, eventName }) => {
                  setFormData(prev => ({
                    ...prev,
                    event_id: eventId,
                    event_name: eventName
                  }));
                }}
              />
              <p className="text-[10px] text-slate-400 font-medium">
                Select an existing event or create a new one. Quizzes under the same event automatically show on the main website event page!
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <QrCode size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Custom Join URL & QR Code
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  Vanity Link
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Direct Join URL</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl whitespace-nowrap select-none font-mono">
                      {typeof window !== 'undefined' ? `${window.location.host}/q/` : 'quiz.mscprpcem.tech/q/'}
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. both-on"
                      value={formData.custom_slug}
                      onChange={e => {
                        setIsSlugCustomized(true);
                        setFormData(prev => ({
                          ...prev,
                          custom_slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                        }));
                      }}
                      className="w-full border border-blue-300 rounded-xl px-3.5 py-2 text-xs font-mono font-black text-blue-700 bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                    Students visiting <strong className="text-blue-600 font-mono">{typeof window !== 'undefined' ? window.location.host : 'quiz.mscprpcem.tech'}/q/{formData.custom_slug || 'preview'}</strong> or scanning the QR code will open this quiz session directly.
                  </p>
                </div>

                {/* Live QR Code Preview */}
                <div className="bg-white p-3 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-2xs">
                  <QRCodeSVG
                    id="create-scheduled-quiz-qr-svg"
                    value={`${typeof window !== 'undefined' ? window.location.origin : 'https://quiz.mscprpcem.tech'}/q/${formData.custom_slug || 'preview'}`}
                    size={90}
                    bgColor="#FFFFFF"
                    fgColor="#0F172A"
                    level="H"
                    imageSettings={{
                      src: getLogoUrl(branding?.logo_path),
                      x: undefined,
                      y: undefined,
                      height: 22,
                      width: 22,
                      excavate: true,
                    }}
                  />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Scan to Join Direct</span>
                  <button
                    type="button"
                    onClick={handleDownloadPreviewQR}
                    className="w-full py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold rounded-lg text-[10px] flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                    title="Download Direct Join Card Image"
                  >
                    <Download size={11} />
                    <span>Download Card</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">Description</label>
              <textarea
                rows={3}
                placeholder="Overview of topics tested, guidelines, and passing criteria..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-xl px-4 py-2.5 text-xs font-semibold bg-slate-50 focus:bg-white focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Searchable & Creatable Combobox */}
              <div className="space-y-1 relative" ref={categoryDropdownRef}>
                <label className="block text-xs font-bold text-slate-600">Category</label>
                <div className="relative">
                  <div 
                    onClick={() => setIsCategoryOpen(prev => !prev)}
                    className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold bg-white text-slate-800 flex items-center justify-between cursor-pointer focus:ring-2 focus:ring-blue-500 hover:border-slate-300 shadow-2xs"
                  >
                    <span className="truncate">{formData.category || 'Select Category...'}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isCategoryOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search or create category..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
                        {categoriesList
                          .filter(cat => cat.toLowerCase().includes(categorySearch.trim().toLowerCase()))
                          .map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, category: cat });
                                setIsCategoryOpen(false);
                                setCategorySearch('');
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                formData.category === cat ? 'bg-blue-50 text-blue-700 font-black' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{cat}</span>
                              {formData.category === cat && <Check size={13} className="text-blue-600" />}
                            </button>
                          ))}

                        {/* If typed search query doesn't match any category, give option to create */}
                        {categorySearch.trim() && !categoriesList.some(c => c.toLowerCase() === categorySearch.trim().toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              const newCat = categorySearch.trim();
                              setCategoriesList(prev => [...prev, newCat]);
                              setFormData({ ...formData, category: newCat });
                              setIsCategoryOpen(false);
                              setCategorySearch('');
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 flex items-center space-x-1.5 transition-all cursor-pointer"
                          >
                            <Plus size={14} className="text-blue-600 flex-shrink-0" />
                            <span className="truncate">+ Create "<strong>{categorySearch.trim()}</strong>"</span>
                          </button>
                        )}

                        {categoriesList.filter(cat => cat.toLowerCase().includes(categorySearch.trim().toLowerCase())).length === 0 && !categorySearch.trim() && (
                          <div className="text-center py-3 text-[11px] text-slate-400 font-semibold">
                            No categories available
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Granular Recurrence Section */}
          <div className="space-y-6 pt-4 border-t">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Recurrence & Time Window</h3>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600">Schedule Pattern</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-bold">
                {['ONE_TIME', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      const isOneTime = st === 'ONE_TIME';
                      setFormData(prev => ({
                        ...prev,
                        schedule_type: st,
                        end_date: isOneTime ? prev.start_date : (prev.end_date || nextMonth)
                      }));
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      formData.schedule_type === st 
                        ? 'bg-blue-600 text-white font-black border-blue-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Weekly / Biweekly Days Selection */}
            {(formData.schedule_type === 'WEEKLY' || formData.schedule_type === 'BIWEEKLY') && (
              <div className="p-5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-4">
                <span className="text-xs font-extrabold text-blue-900 block">Select Active Day(s) of the Week</span>
                
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => {
                    const isSelected = formData.days_of_week.includes(day.code);
                    return (
                      <button
                        key={day.code}
                        type="button"
                        onClick={() => handleToggleDayOfWeek(day.code)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>

                {formData.schedule_type === 'BIWEEKLY' && (
                  <div className="space-y-1 pt-2 border-t border-blue-200/60">
                    <label className="block text-xs font-bold text-slate-700">Biweekly Week Pattern</label>
                    <select
                      value={formData.weeks_pattern}
                      onChange={e => setFormData({ ...formData, weeks_pattern: e.target.value })}
                      className="border rounded-xl px-3 py-2 text-xs font-bold bg-white"
                    >
                      <option value="1_3">1st & 3rd Weeks of the Month</option>
                      <option value="2_4">2nd & 4th Weeks of the Month</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Monthly Day Selection */}
            {formData.schedule_type === 'MONTHLY' && (
              <div className="p-5 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-3">
                <span className="text-xs font-extrabold text-purple-900 block">Monthly Schedule Option</span>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-bold text-slate-600">Run on Day of Month:</span>
                  <select
                    value={formData.day_of_month}
                    onChange={e => setFormData({ ...formData, day_of_month: parseInt(e.target.value, 10) })}
                    className="border rounded-xl px-3 py-2 text-xs font-bold bg-white"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>Day {num}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Custom Interval Configuration */}
            {formData.schedule_type === 'CUSTOM' && (
              <div className="p-5 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-4">
                <span className="text-xs font-extrabold text-amber-900 block">Custom Repeat Interval</span>
                
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-bold text-slate-600">Repeat Every</span>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.custom_interval_days}
                    onChange={e => setFormData({ ...formData, custom_interval_days: parseInt(e.target.value, 10) || 3 })}
                    className="w-16 border rounded-xl p-2 text-center text-xs font-bold bg-white"
                  />
                  <span className="font-bold text-slate-600">Day(s)</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-amber-200/60">
                  <span className="text-xs font-bold text-slate-700 block">Active Day(s) of the Week (Optional)</span>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => {
                      const isSelected = formData.days_of_week.includes(day.code);
                      return (
                        <button
                          key={day.code}
                          type="button"
                          onClick={() => handleToggleDayOfWeek(day.code)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            isSelected ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {formData.schedule_type === 'ONE_TIME' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600">
                      Quiz Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          start_date: val,
                          end_date: (prev.end_date < val || prev.end_date === prev.start_date) ? val : prev.end_date
                        }));
                      }}
                      className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600">
                      Quiz End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={formData.start_date}
                      value={formData.end_date || formData.start_date}
                      onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold bg-white"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  For single-day assessments, keep Start Date and End Date the same. For multi-day window access, select your concluding End Date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">
                    Start Date (Series Starts) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">
                    End Date (Series Ends) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={formData.start_date}
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold bg-white"
                  />
                </div>
              </div>
            )}

            {/* Time Window with Seconds & 12h / 24h Toggle */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {formData.schedule_type === 'ONE_TIME' ? 'Quiz Slot Time Window' : 'Daily Time Window (HH:MM:SS)'}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-[10px] font-black">
                    IST (UTC+5:30)
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <span className="text-slate-400">Time Format:</span>
                  <button
                    type="button"
                    onClick={() => setTimeFormat12(!timeFormat12)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-blue-600 font-extrabold cursor-pointer"
                  >
                    {timeFormat12 ? '12-Hour AM/PM' : '24-Hour'}
                  </button>
                </div>
              </div>

              {/* Start Time & End Time Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Start Time */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">
                    {formData.schedule_type === 'ONE_TIME' ? 'Quiz Start Time' : 'Daily Start Time'}
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min="1"
                      max={timeFormat12 ? 12 : 23}
                      placeholder="HH"
                      value={formData.start_time_hh}
                      onChange={e => setFormData({ ...formData, start_time_hh: e.target.value })}
                      className="w-14 border rounded-xl p-2 text-center text-xs font-bold bg-white"
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="MM"
                      value={formData.start_time_mm}
                      onChange={e => setFormData({ ...formData, start_time_mm: e.target.value })}
                      className="w-14 border rounded-xl p-2 text-center text-xs font-bold bg-white"
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="SS"
                      value={formData.start_time_ss}
                      onChange={e => setFormData({ ...formData, start_time_ss: e.target.value })}
                      className="w-14 border rounded-xl p-2 text-center text-xs font-bold bg-white"
                    />

                    {timeFormat12 && (
                      <select
                        value={formData.start_time_ampm}
                        onChange={e => setFormData({ ...formData, start_time_ampm: e.target.value })}
                        className="border rounded-xl p-2 text-xs font-bold bg-white"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* End Time */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">
                    {formData.schedule_type === 'ONE_TIME' ? 'Quiz End Time' : 'Daily End Time'}
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min="1"
                      max={timeFormat12 ? 12 : 23}
                      placeholder="HH"
                      value={formData.end_time_hh}
                      onChange={e => setFormData({ ...formData, end_time_hh: e.target.value })}
                      className="w-14 border rounded-xl p-2 text-center text-xs font-bold bg-white"
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="MM"
                      value={formData.end_time_mm}
                      onChange={e => setFormData({ ...formData, end_time_mm: e.target.value })}
                      className="w-14 border rounded-xl p-2 text-center text-xs font-bold bg-white"
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="SS"
                      value={formData.end_time_ss}
                      onChange={e => setFormData({ ...formData, end_time_ss: e.target.value })}
                      className="w-14 border rounded-xl p-2 text-center text-xs font-bold bg-white"
                    />

                    {timeFormat12 && (
                      <select
                        value={formData.end_time_ampm}
                        onChange={e => setFormData({ ...formData, end_time_ampm: e.target.value })}
                        className="border rounded-xl p-2 text-xs font-bold bg-white"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Dynamic Calculated Occurrences & Section Breakdown */}
            {(() => {
              const calculatedOccs = calculateScheduleOccurrences();
              return (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs flex-shrink-0">
                      <Layers size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>⚡ {calculatedOccs.length} {formData.schedule_type === 'DAILY' ? 'Daily' : formData.schedule_type === 'WEEKLY' ? 'Weekly' : 'Scheduled'} Rounds Calculated</span>
                        <span className="px-2 py-0.5 bg-blue-200/80 text-blue-900 rounded-full text-[9px] font-black uppercase">
                          Non-Repeating Pool
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                        {calculatedOccs.length} dedicated question sections ({calculatedOccs[0]?.name || 'Round 1'} to {calculatedOccs[calculatedOccs.length - 1]?.name || `Round ${calculatedOccs.length}`}) will be created. Questions assigned to each round will not repeat.
                      </p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 bg-blue-600 text-white font-black rounded-xl text-xs shadow-xs whitespace-nowrap">
                    {calculatedOccs.length} Sections
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleNextTab}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <span>Next: Manage Questions by Section</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>
      )}

      {/* ════════ TAB 2: QUESTIONS & SECTIONS MANAGEMENT ════════ */}
      {activeTab === 2 && (() => {
        const sections = calculateScheduleOccurrences();
        const isMultiSection = sections.length > 1;
        const currentSection = activeSectionFilter > 0 ? sections.find(s => s.number === activeSectionFilter) : null;
        
        // Helper to render a question card with sequential continuous question numbering
        const renderQuestionCard = (q, origIdx, displayIndex = null, localIdx = null) => {
          const currentOccNum = q.occurrence_number || 1;
          const secInfo = sections.find(s => s.number === currentOccNum) || sections[0];
          const secDisplayName = customSections[currentOccNum]?.name || secInfo?.name || `Section ${currentOccNum}`;
          const currentQType = q.question_type || (q.correct_answer && q.correct_answer.includes(',') ? 'multiple' : 'single');
          const isTF = currentQType === 'true_false';
          const isMulti = currentQType === 'multiple';
          const selectedKeys = normalizeSelection(q.correct_answer).split(',').filter(Boolean);
          const qNum = displayIndex !== null ? displayIndex : (origIdx + 1);

          const handleTypeChange = (newType) => {
            handleQuestionChange(origIdx, 'question_type', newType);
            if (newType === 'true_false') {
              handleQuestionChange(origIdx, 'option_a', 'True');
              handleQuestionChange(origIdx, 'option_b', 'False');
              handleQuestionChange(origIdx, 'option_c', '');
              handleQuestionChange(origIdx, 'option_d', '');
              if (!['A', 'B'].includes(q.correct_answer)) {
                handleQuestionChange(origIdx, 'correct_answer', 'A');
              }
            } else if (newType === 'single') {
              // Ensure only one answer selected
              const first = selectedKeys[0] || 'A';
              handleQuestionChange(origIdx, 'correct_answer', first);
            }
          };

          const handleOptionToggle = (optKey) => {
            if (isTF) {
              handleQuestionChange(origIdx, 'correct_answer', optKey);
            } else if (isMulti) {
              const updated = toggleOptionInSelection(q.correct_answer, optKey);
              handleQuestionChange(origIdx, 'correct_answer', updated || optKey);
            } else {
              handleQuestionChange(origIdx, 'correct_answer', optKey);
            }
          };

          return (
            <div key={origIdx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-left shadow-2xs hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-blue-700 bg-blue-100/90 px-3 py-1 rounded-lg border border-blue-300 shadow-2xs">
                    Question #{qNum}
                  </span>

                  {isMultiSection && (
                    <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {secDisplayName}{localIdx !== null ? ` • Q ${localIdx + 1}` : ''}
                    </span>
                  )}

                  {/* Question Type Selector */}
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('single')}
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                        currentQType === 'single' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Single Choice
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('multiple')}
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                        currentQType === 'multiple' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ☑ Multi-Choice
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('true_false')}
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md transition-all cursor-pointer ${
                        currentQType === 'true_false' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      True / False
                    </button>
                  </div>
                  
                  {/* Section Assignment Dropdown */}
                  {isMultiSection && (
                    <div className="flex items-center space-x-1.5 ml-1">
                      <span className="text-[11px] font-bold text-slate-500">Round:</span>
                      <select
                        value={currentOccNum}
                        onChange={(e) => {
                          const newSecNum = parseInt(e.target.value, 10);
                          const newSec = sections.find(s => s.number === newSecNum);
                          handleQuestionChange(origIdx, 'occurrence_number', newSecNum);
                          handleQuestionChange(origIdx, 'section_name', customSections[newSecNum]?.name || newSec?.name || `Section ${newSecNum}`);
                          handleQuestionChange(origIdx, 'section_description', customSections[newSecNum]?.description || newSec?.description || '');
                        }}
                        className="bg-white border border-blue-300 text-blue-800 text-xs font-black rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        {sections.map(s => (
                          <option key={s.number} value={s.number}>
                            {customSections[s.number]?.name || s.name} ({s.dateLabel})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <button 
                  type="button" 
                  onClick={() => handleRemoveQuestion(origIdx)} 
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  title="Delete Question"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Question Statement</label>
                <input
                  type="text"
                  placeholder={isTF ? "e.g. Relational databases support ACID transactions." : "Enter question text..."}
                  value={q.question}
                  onChange={e => handleQuestionChange(origIdx, 'question', e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* True/False Options Layout */}
              {isTF ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    q.correct_answer === 'A' ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400/20' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">A</span>
                      <span className="font-extrabold text-xs">True</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuestionChange(origIdx, 'correct_answer', 'A')}
                      className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                        q.correct_answer === 'A' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {q.correct_answer === 'A' ? '✓ Correct Answer' : 'Mark Correct'}
                    </button>
                  </div>

                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    q.correct_answer === 'B' ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-400/20' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-rose-600 text-white font-black text-[10px] flex items-center justify-center">B</span>
                      <span className="font-extrabold text-xs">False</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuestionChange(origIdx, 'correct_answer', 'B')}
                      className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                        q.correct_answer === 'B' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {q.correct_answer === 'B' ? '✓ Correct Answer' : 'Mark Correct'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Multiple / Single Choice 4-Option Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['a', 'b', 'c', 'd'].map((letter) => {
                    const optKey = letter.toUpperCase();
                    const field = `option_${letter}`;
                    const isSelected = selectedKeys.includes(optKey);

                    return (
                      <div key={letter} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="block text-[11px] font-bold text-slate-500">Option {optKey}</label>
                          <button
                            type="button"
                            onClick={() => handleOptionToggle(optKey)}
                            className={`text-[10px] font-black px-2 py-0.5 rounded cursor-pointer transition-all ${
                              isSelected ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-700 bg-slate-100'
                            }`}
                          >
                            {isSelected ? '✓ Correct' : '+ Mark Correct'}
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={`Option ${optKey}`}
                            value={q[field]}
                            onChange={e => handleQuestionChange(origIdx, field, e.target.value)}
                            className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 ${
                              isSelected ? 'border-emerald-400 bg-emerald-50/30 ring-1 ring-emerald-300' : ''
                            }`}
                          />
                          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded text-[10px] font-black flex items-center justify-center ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {optKey}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-bold text-slate-600">
                    {isTF ? 'Correct Choice:' : isMulti ? 'Correct Options (Select all that apply):' : 'Correct Option:'}
                  </span>
                  {(isTF ? ['A', 'B'] : ['A', 'B', 'C', 'D']).map((opt) => {
                    const isSelected = isTF ? q.correct_answer === opt : selectedKeys.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleOptionToggle(opt)}
                        className={`w-8 h-8 rounded-xl font-black text-xs cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-600 text-white shadow-xs scale-105' : 'bg-white border text-slate-700 hover:bg-slate-100'
                        }`}
                        title={isMulti ? `Click to toggle Option ${opt}` : `Select Option ${opt}`}
                      >
                        {opt}
                      </button>
                    );
                  })}

                  {isMulti && (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full ml-1">
                      {selectedKeys.length > 1 ? `${selectedKeys.length} Options Correct (${selectedKeys.join(', ')})` : 'Select ≥1 Option'}
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-semibold text-slate-400">
                  Assigned to: <span className="font-bold text-slate-700">{secDisplayName}</span>
                </div>
              </div>
            </div>
          );
        };

        const validSectionNumbers = new Set(sections.map(s => s.number));
        const outOfRangeQuestions = formData.questions.filter(q => !validSectionNumbers.has(q.occurrence_number || 1));
        const emptyQuestions = formData.questions.filter(q => !q.question || !q.question.trim());

        return (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xs">
            
            {/* Header & Global Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black text-slate-900">
                    Questions & Sections ({formData.questions.length})
                  </h3>
                  {isMultiSection && (
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">
                      {sections.length} Rounds
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isMultiSection 
                    ? 'Configure distinct question sets for each day/week. Questions will never repeat across rounds.'
                    : 'Upload a CSV/Excel file or add questions manually.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Clean Empty Questions */}
                {emptyQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRemoveEmptyQuestions}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
                    title="Remove empty placeholder questions"
                  >
                    <Trash2 size={13} className="text-red-600" />
                    <span>Clean {emptyQuestions.length} Empty</span>
                  </button>
                )}

                {/* Fix Out of Range Questions */}
                {outOfRangeQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleFixOutOfBoundsQuestions}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs animate-pulse"
                    title="Reassign questions assigned to non-existent rounds"
                  >
                    <AlertTriangle size={13} className="text-amber-600" />
                    <span>Fix {outOfRangeQuestions.length} Out-of-Range</span>
                  </button>
                )}

                {/* Deduplicate Questions */}
                {formData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRemoveDuplicateQuestions}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
                    title="Remove duplicate questions across rounds"
                  >
                    <Sparkles size={13} className="text-slate-500" />
                    <span>Deduplicate</span>
                  </button>
                )}

                {/* Sequential Order & Re-number Button */}
                {isMultiSection && formData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSortAndRenumber}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
                    title="Organize all questions into a continuous sequence (Week 1 -> Week 2 -> Week 3...)"
                  >
                    <Sparkles size={13} className="text-indigo-600" />
                    <span>Sequential Order</span>
                  </button>
                )}

                {/* Distribute Evenly Button */}
                {isMultiSection && formData.questions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDistributeEvenly}
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all"
                    title="Evenly distribute all questions across all rounds"
                  >
                    <Sparkles size={13} className="text-amber-600" />
                    <span>Distribute Evenly</span>
                  </button>
                )}

                {/* Add Question Button */}
                <button
                  type="button"
                  onClick={() => handleAddQuestion(activeSectionFilter > 0 ? activeSectionFilter : 1, 1)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Plus size={14} />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {/* Out of Bounds Questions Warning Card */}
            {outOfRangeQuestions.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-xs">
                    <AlertTriangle size={17} className="text-amber-600 flex-shrink-0" />
                    <span>
                      ⚠️ Notice: {outOfRangeQuestions.length} questions are assigned to rounds outside your active {sections.length}-round schedule (e.g. Round #{[...new Set(outOfRangeQuestions.map(q => q.occurrence_number))].join(', #')})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleFixOutOfBoundsQuestions}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer active:scale-95"
                    >
                      Reassign into {sections.length} Active Rounds
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteOutOfBoundsQuestions}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer active:scale-95"
                    >
                      Delete Extra
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed pl-6">
                  This happens when schedule dates or frequency are changed after importing questions. Click <strong>"Reassign"</strong> to fit them into your active {sections.length} weeks, or <strong>"Delete Extra"</strong> to clean up.
                </p>
              </div>
            )}

            {/* ════════ 2-STEP SPREADSHEET TEMPLATE & BULK IMPORT HUB ════════ */}
            <div className="p-5 bg-gradient-to-r from-slate-50 via-blue-50/40 to-indigo-50/40 border border-slate-200 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    <FileSpreadsheet size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Excel & CSV Bulk Question Import
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Download the tailored template with illustrative section examples, enter your questions, then upload below.
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  {formData.schedule_type} Pattern • {sections.length} Round{sections.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Informational Guidance on Excel Section Routing */}
              {isMultiSection && (
                <div className="p-3 bg-blue-50/80 border border-blue-200/90 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
                  <span className="text-sm select-none">💡</span>
                  <div>
                    <strong className="font-extrabold text-blue-950">How Week/Section Mapping Works in Excel:</strong>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      • In your spreadsheet, specify the round number in the <strong><code>Section</code></strong> column (e.g. <code>1</code> for Week 1, <code>2</code> for Week 2, <code>3</code> for Week 3). All questions with <code>2</code> will automatically route to Week 2.
                      <br />
                      • If you upload a file while viewing a specific Week tab below, any rows without a section number will automatically be assigned to that Week!
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* STEP 1: Download Template */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
                      <span className="text-xs font-black text-slate-800">Download Template</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed pl-7">
                      Pre-formatted with Section numbers and sample questions tailored for your <strong>{formData.schedule_type}</strong> schedule.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pl-7 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate('xlsx')}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-98 shadow-2xs"
                      title="Download Microsoft Excel (.xlsx) template with sample questions"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-600" />
                      <span>Excel Template (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadTemplate('csv')}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-extrabold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all active:scale-98 shadow-2xs"
                      title="Download Standard CSV (.csv) template"
                    >
                      <FileText size={14} className="text-blue-600" />
                      <span>CSV Template (.csv)</span>
                    </button>
                  </div>
                </div>

                {/* STEP 2: Upload File */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
                      <span className="text-xs font-black text-slate-800">Upload Questions File</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed pl-7">
                      Upload your populated <code>.xlsx</code> or <code>.csv</code> file. Questions will automatically map to their designated sections.
                    </p>
                  </div>

                  <div className="pl-7 pt-1">
                    <label className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-md active:scale-98">
                      <Upload size={14} />
                      <span>Choose / Drag File to Import (.xlsx, .csv)</span>
                      <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Switcher Tabs (For Recurring Quizzes) */}
            {isMultiSection && (
              <div className="flex border border-slate-200 bg-slate-50 rounded-2xl p-1.5 space-x-1.5 overflow-x-auto shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveSectionFilter(0)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                    activeSectionFilter === 0
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  All Sections Overview ({formData.questions.length})
                </button>

                {sections.map(sec => {
                  const qCount = formData.questions.filter(q => (q.occurrence_number || 1) === sec.number).length;
                  const customName = customSections[sec.number]?.name || sec.name;
                  return (
                    <button
                      key={sec.number}
                      type="button"
                      onClick={() => setActiveSectionFilter(sec.number)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                        activeSectionFilter === sec.number
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span>{customName}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        activeSectionFilter === sec.number ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {qCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* VIEW 1: SINGLE SECTION VIEW */}
            {activeSectionFilter > 0 && currentSection && (() => {
              const currentSectionQuestions = formData.questions
                .map((q, origIdx) => ({ ...q, origIdx }))
                .filter(q => (q.occurrence_number || 1) === activeSectionFilter);
              const secDisplayName = customSections[activeSectionFilter]?.name || currentSection.name;

              return (
                <div className="space-y-6">
                  {/* Active Section Custom Name & Description Editor */}
                  <div className="p-5 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 bg-blue-600 text-white font-black rounded-lg text-[10px] uppercase">
                          Round #{currentSection.number}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          Scheduled Date: <strong>{currentSection.dateLabel}</strong>
                        </span>
                      </div>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddQuestion(activeSectionFilter, 1)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs inline-flex items-center space-x-1"
                        >
                          <Plus size={12} />
                          <span>+1 Q</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddQuestion(activeSectionFilter, 5)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs inline-flex items-center space-x-1"
                        >
                          <Plus size={12} />
                          <span>+5 Qs</span>
                        </button>

                        {/* Direct Section Import */}
                        <label className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs inline-flex items-center space-x-1">
                          <Upload size={12} />
                          <span>Import to {secDisplayName}</span>
                          <input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            onChange={(e) => handleFileUpload(e, activeSectionFilter)}
                            className="hidden"
                          />
                        </label>

                        {/* Direct Section Template */}
                        <button
                          type="button"
                          onClick={() => handleDownloadTemplate('xlsx', activeSectionFilter)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg cursor-pointer shadow-2xs inline-flex items-center space-x-1"
                          title={`Download Template tailored for ${secDisplayName}`}
                        >
                          <FileSpreadsheet size={12} className="text-emerald-600" />
                          <span>Template</span>
                        </button>

                        {/* Clear Section Questions */}
                        {currentSectionQuestions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleClearSectionQuestions(activeSectionFilter)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-lg cursor-pointer shadow-2xs inline-flex items-center space-x-1"
                            title={`Clear all questions in ${secDisplayName}`}
                          >
                            <Trash2 size={12} className="text-red-600" />
                            <span>Clear ({currentSectionQuestions.length})</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Section / Round Name</label>
                        <input
                          type="text"
                          placeholder={`e.g. ${currentSection.name}: Core Concepts`}
                          value={customSections[activeSectionFilter]?.name || currentSection.name}
                          onChange={(e) => handleUpdateSectionMeta(activeSectionFilter, 'name', e.target.value)}
                          className="w-full border border-blue-200 rounded-xl px-3.5 py-2 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Section Description / Syllabus</label>
                        <input
                          type="text"
                          placeholder="e.g. Topics covered in this assessment round..."
                          value={customSections[activeSectionFilter]?.description !== undefined ? customSections[activeSectionFilter].description : currentSection.description}
                          onChange={(e) => handleUpdateSectionMeta(activeSectionFilter, 'description', e.target.value)}
                          className="w-full border border-blue-200 rounded-xl px-3.5 py-2 text-xs font-medium bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Questions List for this Section */}
                  {currentSectionQuestions.length === 0 ? (
                    <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-3">
                      <FileSpreadsheet size={40} className="mx-auto text-slate-300" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-800">
                          No Questions Added for {secDisplayName} Yet
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Add questions manually or upload your spreadsheet for this week.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleAddQuestion(activeSectionFilter, 1)}
                          className="px-4 py-2 bg-blue-600 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-sm inline-flex items-center space-x-1.5"
                        >
                          <Plus size={14} />
                          <span>Add 1 Question</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddQuestion(activeSectionFilter, 5)}
                          className="px-4 py-2 bg-indigo-600 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-sm inline-flex items-center space-x-1.5"
                        >
                          <Plus size={14} />
                          <span>Add 5 Questions</span>
                        </button>
                        <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-sm inline-flex items-center space-x-1.5">
                          <Upload size={14} />
                          <span>Import File to {secDisplayName}</span>
                          <input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            onChange={(e) => handleFileUpload(e, activeSectionFilter)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDownloadTemplate('xlsx', activeSectionFilter)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs cursor-pointer shadow-2xs inline-flex items-center space-x-1.5 border border-slate-300"
                        >
                          <Download size={14} className="text-emerald-600" />
                          <span>Download {secDisplayName} Template</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                        {(() => {
                          const priorCount = formData.questions.filter(q => (q.occurrence_number || 1) < activeSectionFilter).length;
                          return currentSectionQuestions.map((q, lIdx) => 
                            renderQuestionCard(q, q.origIdx, priorCount + lIdx + 1, lIdx)
                          );
                        })()}
                      </div>

                      {/* Prominent Add Question Buttons at Bottom of Section */}
                      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => handleAddQuestion(activeSectionFilter, 1)}
                          className="flex-1 w-full py-3 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-700 font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                        >
                          <Plus size={15} />
                          <span>+ Add Another Question to {secDisplayName}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddQuestion(activeSectionFilter, 5)}
                          className="w-full sm:w-auto px-5 py-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                        >
                          <Plus size={15} />
                          <span>+ Add 5 Questions</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* VIEW 2: ALL SECTIONS OVERVIEW (Grouped by Day/Round) */}
            {activeSectionFilter === 0 && (
              <div className="space-y-6">
                {sections.map(sec => {
                  const secQuestions = formData.questions
                    .map((q, origIdx) => ({ ...q, origIdx }))
                    .filter(q => (q.occurrence_number || 1) === sec.number);
                  const secTitle = customSections[sec.number]?.name || sec.name;
                  const secDesc = customSections[sec.number]?.description || sec.description;

                  return (
                    <div key={sec.number} className="border border-slate-200 bg-white rounded-3xl p-5 space-y-4 shadow-2xs">
                      {/* Section Card Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                            #{sec.number}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-black text-slate-900">{secTitle}</h4>
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold">
                                {secQuestions.length} {secQuestions.length === 1 ? 'Question' : 'Questions'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                              Scheduled Date: {sec.dateLabel} {secDesc ? `• ${secDesc}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setActiveSectionFilter(sec.number)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-all"
                          >
                            Focus {sec.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddQuestion(sec.number, 1)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-xs cursor-pointer inline-flex items-center space-x-1 transition-all"
                          >
                            <Plus size={13} />
                            <span>Add Question</span>
                          </button>
                        </div>
                      </div>

                      {/* Section Questions */}
                      {secQuestions.length === 0 ? (
                        <div className="py-6 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                          <p className="text-xs text-slate-400 font-bold">No questions added for {secTitle} yet.</p>
                          <button
                            type="button"
                            onClick={() => handleAddQuestion(sec.number, 1)}
                            className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-black cursor-pointer inline-flex items-center space-x-1"
                          >
                            <Plus size={13} />
                            <span>Add First Question to {secTitle}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(() => {
                            const priorCount = formData.questions.filter(q => (q.occurrence_number || 1) < sec.number).length;
                            return secQuestions.map((q, lIdx) => 
                              renderQuestionCard(q, q.origIdx, priorCount + lIdx + 1, lIdx)
                            );
                          })()}

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleAddQuestion(sec.number, 1)}
                              className="flex-1 py-2.5 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 text-blue-600 font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                            >
                              <Plus size={14} />
                              <span>+ Add Another Question to {secTitle}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddQuestion(sec.number, 5)}
                              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold rounded-2xl text-xs cursor-pointer transition-all"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Step Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab(1)}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow-2xs"
              >
                <ArrowLeft size={15} />
                <span>Previous Step</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(3)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-xs hover:shadow-md cursor-pointer transition-all"
              >
                <span>Next: Rules & Proctoring</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>
        );
      })()}

      {/* ════════ TAB 3: RULES & PROCTORING ════════ */}
      {activeTab === 3 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xs">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={15} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Quiz Rules & Anti-Cheat Settings</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">Time Limit (Minutes)</label>
              <input
                type="number"
                value={formData.time_limit}
                onChange={e => setFormData({ ...formData, time_limit: parseInt(e.target.value, 10) })}
                className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">Max Attempts Per User</label>
              <select
                value={formData.max_attempts}
                onChange={e => setFormData({ ...formData, max_attempts: parseInt(e.target.value, 10) })}
                className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold bg-white"
              >
                <option value={1}>1 Attempt (Default)</option>
                <option value={2}>2 Attempts</option>
                <option value={3}>3 Attempts</option>
                <option value={0}>Unlimited</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center space-x-3 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffle_questions}
                onChange={e => setFormData({ ...formData, shuffle_questions: e.target.checked })}
                className="rounded text-blue-600 w-4 h-4"
              />
              <span>Shuffle Questions Order</span>
            </label>

            <label className="flex items-center space-x-3 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffle_answers}
                onChange={e => setFormData({ ...formData, shuffle_answers: e.target.checked })}
                className="rounded text-blue-600 w-4 h-4"
              />
              <span>Shuffle Answer Options</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_fullscreen}
                onChange={e => setFormData({ ...formData, require_fullscreen: e.target.checked })}
                className="rounded text-blue-600 w-4 h-4"
              />
              <span>Require Fullscreen Mode</span>
            </label>

            <label className="flex items-center space-x-3 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.anti_cheat_enabled}
                onChange={e => setFormData({ ...formData, anti_cheat_enabled: e.target.checked })}
                className="rounded text-blue-600 w-4 h-4"
              />
              <span>Enable Anti-Cheat Detection</span>
            </label>
          </div>

          {/* ════════ VERIFIED DIGITAL BADGE & CREDENTIALING ════════ */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2 pb-1">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award size={15} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Verified Digital Badge (Verification Platform)</h4>
                <p className="text-[11px] text-slate-500 font-medium">Issue cryptographic digital credentials via verify.mscprpcem.tech upon admin approval</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Issue Verified Digital Badge</span>
                  <span className="text-[10px] text-slate-500 font-medium">Synchronize credential record with Verification Platform</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.issue_badge}
                    onChange={e => setFormData({ ...formData, issue_badge: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {formData.issue_badge && (
                <div className="pt-3 border-t border-slate-200/80 space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        Badge Sys ID <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">verify.mscprpcem.tech</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. SYS-BADGE-101, EVENT-CERT-2026"
                      value={formData.badge_sys_id || ''}
                      onChange={e => setFormData({ ...formData, badge_sys_id: e.target.value })}
                      className="w-full border rounded-xl px-3.5 py-2 text-xs font-mono font-bold bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10.5px] text-slate-500 font-medium">
                      Enter the unique badge / credential ID registered in the Verification Platform database.
                    </p>
                  </div>

                  {availableBadges.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                        Quick Select from Available Verification Badges:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {availableBadges.slice(0, 5).map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setFormData(p => ({
                              ...p,
                              badge_sys_id: b.id,
                              badge_title: b.title || p.badge_title
                            }))}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                              formData.badge_sys_id === b.id
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
                    <label className="block text-xs font-bold text-slate-700">Badge Certificate Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Microsoft Azure Cloud Fundamentals Master"
                      value={formData.badge_title}
                      onChange={e => setFormData({ ...formData, badge_title: e.target.value })}
                      className="w-full border rounded-xl px-3.5 py-2 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
                    <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold text-blue-950">Admin Permission Workflow:</strong>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Badges will not be dispatched automatically without admin consent. After the assessment period finishes, admins can choose to <strong>"Issue Badges Now"</strong> or <strong>"Save for Later"</strong> from the Scheduled Quiz Management dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab(2)}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow-2xs"
            >
              <ArrowLeft size={15} />
              <span>Previous Step</span>
            </button>

            <button
              onClick={() => setActiveTab(4)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-xs hover:shadow-md cursor-pointer transition-all"
            >
              <span>Next: Review & Publish</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ════════ TAB 4: REVIEW & PUBLISH ════════ */}
      {activeTab === 4 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xs text-left">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CheckCircle size={15} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Review Scheduled Quiz Configuration</h3>
          </div>

          <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3 text-xs font-semibold text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><strong className="text-slate-900">Title:</strong> {formData.title}</div>
              <div><strong className="text-slate-900">Schedule Pattern:</strong> {formData.schedule_type}</div>
              <div><strong className="text-slate-900">Date Window:</strong> {formData.start_date} to {formData.end_date}</div>
              <div><strong className="text-slate-900">Daily Time Window:</strong> {buildTimeString(formData.start_time_hh, formData.start_time_mm, formData.start_time_ss, formData.start_time_ampm)} to {buildTimeString(formData.end_time_hh, formData.end_time_mm, formData.end_time_ss, formData.end_time_ampm)} IST</div>
              <div><strong className="text-slate-900">Total Questions:</strong> {formData.questions.length} Questions</div>
              <div><strong className="text-slate-900">Time Limit:</strong> {formData.time_limit} Mins</div>
              <div><strong className="text-slate-900">Proctoring:</strong> {formData.anti_cheat_enabled ? 'Anti-Cheat Enabled' : 'Standard'}</div>
              <div><strong className="text-slate-900">Digital Badge:</strong> {formData.issue_badge ? `${formData.badge_title || 'Enabled'} (Sys ID: ${formData.badge_sys_id || 'Not assigned'})` : 'Disabled'}</div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab(3)}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow-2xs"
            >
              <ArrowLeft size={15} />
              <span>Previous Step</span>
            </button>

            <button
              onClick={handlePublishSubmit}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  <span>Publish Scheduled Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
