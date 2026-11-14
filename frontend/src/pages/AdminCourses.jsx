import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Search, Edit3, Trash2, CheckCircle2, Clock, 
  HelpCircle, Eye, EyeOff, Layers, Sparkles, X, ChevronLeft, Save, Award, RefreshCw,
  Shuffle, Maximize2, Shield, Settings, Sliders, CheckSquare, FileText, Upload, Image as ImageIcon,
  AlertTriangle, ArrowLeft, ArrowRight, Check, HelpCircle as QuestionIcon
} from 'lucide-react';

const DEFAULT_QUIZ_SETTINGS = {
  randomizeQuestions: true,
  randomizeOptions: true,
  requireFullScreen: true,
  timeLimitMinutes: 10,
  passingScore: 70,
  showExplanations: true,
  enableCertificate: true
};

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

const PRESET_ICONS = [
  { label: 'Azure Cloud', path: 'https://mscprpcem.blob.core.windows.net/quiz/azure.png' },
  { label: 'Azure AI', path: 'https://mscprpcem.blob.core.windows.net/quiz/azure-ai-foundry-logo.jpg' },
  { label: 'Database SQL', path: 'https://mscprpcem.blob.core.windows.net/quiz/database.svg' },
  { label: 'Git & GitHub', path: 'https://mscprpcem.blob.core.windows.net/quiz/github.svg' },
  { label: 'Copilot', path: 'https://mscprpcem.blob.core.windows.net/quiz/microsoft-copilot.png' },
  { label: 'MSC Logo', path: '/logo.png' }
];

const INITIAL_COURSES = [
  {
    id: 'c-azure',
    slug: 'cloud',
    title: 'Microsoft Azure',
    category: 'Cloud Infrastructure',
    desc: 'Master Microsoft Azure cloud services, virtual machines, resource management, and AZ-900 exam preparation.',
    imageSrc: 'https://mscprpcem.blob.core.windows.net/quiz/azure.png',
    status: 'coming_soon',
    badge: 'Coming Soon',
    quizSettings: { ...DEFAULT_QUIZ_SETTINGS, timeLimitMinutes: 10, passingScore: 70 }
  },
  {
    id: 'c-azure-ai',
    slug: 'cloud-ai',
    title: 'Azure AI',
    category: 'Artificial Intelligence',
    desc: 'Explore Azure OpenAI, Cognitive Services, Computer Vision, and natural language processing solutions.',
    imageSrc: 'https://mscprpcem.blob.core.windows.net/quiz/azure-ai-foundry-logo.jpg',
    status: 'coming_soon',
    badge: 'Coming Soon',
    quizSettings: { ...DEFAULT_QUIZ_SETTINGS, timeLimitMinutes: 15, passingScore: 75 }
  },
  {
    id: 'c-dsa',
    slug: 'dsa',
    title: 'Computer Fundamentals',
    category: 'Core Computer Science',
    desc: 'Build rock-solid foundations in operating systems, computer architecture, memory management, and networking.',
    imageSrc: 'https://mscprpcem.blob.core.windows.net/quiz/microsoft-copilot.png',
    status: 'coming_soon',
    badge: 'Coming Soon',
    quizSettings: { ...DEFAULT_QUIZ_SETTINGS, timeLimitMinutes: 10, passingScore: 60 }
  },
  {
    id: 'c-dbms',
    slug: 'dbms',
    title: 'Database (SQL)',
    category: 'Database Systems',
    desc: 'Learn relational database design, SQL querying, indexing, normalized schema design, and transaction management.',
    imageSrc: 'https://mscprpcem.blob.core.windows.net/quiz/database.svg',
    status: 'published',
    badge: 'Interactive Lab Active',
    hasInteractiveLab: true,
    quizSettings: { ...DEFAULT_QUIZ_SETTINGS, timeLimitMinutes: 12, passingScore: 70 }
  },
  {
    id: 'c-git',
    slug: 'git',
    title: 'Git & GitHub',
    category: 'Version Control & Open Source',
    desc: 'Master Git branching, pull requests, merge conflict resolution, CI/CD workflows, and open-source collaboration in our virtual terminal.',
    imageSrc: 'https://mscprpcem.blob.core.windows.net/quiz/github.svg',
    status: 'published',
    badge: 'Interactive Lab Active',
    hasInteractiveLab: true,
    quizSettings: { ...DEFAULT_QUIZ_SETTINGS, timeLimitMinutes: 8, passingScore: 70 }
  }
];

const INITIAL_QUESTIONS = [
  {
    id: 'q-db1',
    courseSlug: 'dbms',
    question: 'Which SQL command is used to retrieve data from a relational database table?',
    option_a: 'UPDATE',
    option_b: 'SELECT',
    option_c: 'INSERT',
    option_d: 'DELETE',
    correct_answer: 'B',
    marks: 100,
    explanation: 'The SELECT statement is used in SQL to query data from database tables.'
  },
  {
    id: 'q-db2',
    courseSlug: 'dbms',
    question: 'In database normalisation, which Normal Form eliminates partial functional dependencies?',
    option_a: '1NF (First Normal Form)',
    option_b: '2NF (Second Normal Form)',
    option_c: '3NF (Third Normal Form)',
    option_d: 'BCNF',
    correct_answer: 'B',
    marks: 100,
    explanation: '2NF requires 1NF and additionally demands that all non-key attributes depend fully on the primary key.'
  },
  {
    id: 'q-c1',
    courseSlug: 'cloud',
    question: 'Which Azure service is best suited for hosting Docker containers serverless?',
    option_a: 'Azure Virtual Machines',
    option_b: 'Azure Container Instances (ACI)',
    option_c: 'Azure Disk Storage',
    option_d: 'Azure App Service Basic',
    correct_answer: 'B',
    marks: 100,
    explanation: 'ACI lets you run containers serverless in seconds without VM infrastructure management.'
  }
];

export default function AdminCourses() {
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('msc_admin_courses');
    if (!saved) return INITIAL_COURSES;
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(c => ({
        ...c,
        imageSrc: resolveCourseImage(c.imageSrc)
      }));
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem('msc_admin_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [selectedCourseSlug, setSelectedCourseSlug] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Page View state: 'catalog' | 'workspace'
  const [activeView, setActiveView] = useState('catalog'); 
  const [catalogTab, setCatalogTab] = useState('courses'); // 'courses' | 'questions'
  const [workspaceStep, setWorkspaceStep] = useState(1); // 1: Profile | 2: Quiz Settings | 3: Practice Questions

  // Course Form & Validation
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseValidationError, setCourseValidationError] = useState('');
  const [courseForm, setCourseForm] = useState({
    title: '',
    category: '',
    desc: '',
    imageSrc: '/logo.png',
    status: 'coming_soon',
    quizSettings: { ...DEFAULT_QUIZ_SETTINGS }
  });

  // Question Form & Validation inside Workspace / Catalog
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionValidationError, setQuestionValidationError] = useState('');
  const [questionForm, setQuestionForm] = useState({
    courseSlug: 'dbms',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    marks: 100,
    explanation: ''
  });

  // Inline Delete Targets
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);

  useEffect(() => {
    localStorage.setItem('msc_admin_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('msc_admin_questions', JSON.stringify(questions));
  }, [questions]);

  // Image File Upload reader
  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseForm(prev => ({ ...prev, imageSrc: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Workspace View Inline at Step 1, 2, or 3
  const handleOpenWorkspace = (course = null, step = 1) => {
    setWorkspaceStep(step);
    setCourseValidationError('');
    setQuestionValidationError('');
    setShowQuestionEditor(false);

    if (course) {
      setEditingCourse(course);
      setCourseForm({
        title: course.title,
        category: course.category,
        desc: course.desc,
        imageSrc: course.imageSrc || '/logo.png',
        status: course.status,
        quizSettings: course.quizSettings || { ...DEFAULT_QUIZ_SETTINGS }
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        title: '',
        category: 'Software Engineering',
        desc: '',
        imageSrc: '/logo.png',
        status: 'coming_soon',
        quizSettings: { ...DEFAULT_QUIZ_SETTINGS }
      });
    }
    setActiveView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save Course Track (Validates all parameters before saving)
  const handleSaveCourse = (e) => {
    if (e) e.preventDefault();

    if (!courseForm.title.trim()) {
      setCourseValidationError('Please enter a valid Course Track Title.');
      setWorkspaceStep(1);
      return;
    }
    if (!courseForm.category.trim()) {
      setCourseValidationError('Please specify a Course Category.');
      setWorkspaceStep(1);
      return;
    }
    if (!courseForm.desc.trim()) {
      setCourseValidationError('Please enter a Course Description.');
      setWorkspaceStep(1);
      return;
    }

    setCourseValidationError('');

    if (editingCourse) {
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? {
        ...c,
        ...courseForm,
        badge: courseForm.status === 'published' ? 'Published' : 'Coming Soon'
      } : c));
    } else {
      const slug = courseForm.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newCourse = {
        id: `c-${Date.now()}`,
        slug,
        title: courseForm.title,
        category: courseForm.category,
        desc: courseForm.desc,
        imageSrc: courseForm.imageSrc || '/logo.png',
        status: courseForm.status,
        badge: courseForm.status === 'published' ? 'Published' : 'Coming Soon',
        quizSettings: courseForm.quizSettings
      };
      setCourses(prev => [...prev, newCourse]);
    }
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCourseStatus = (id) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'published' ? 'coming_soon' : 'published';
        return {
          ...c,
          status: nextStatus,
          badge: nextStatus === 'published' ? 'Published' : 'Coming Soon'
        };
      }
      return c;
    }));
  };

  const handleConfirmDeleteCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setDeleteCourseId(null);
  };

  // Open Question Form (Supports both Catalog View and Workspace Step 3 inline editing)
  const handleOpenQuestionEditor = (q = null, forcedCourseSlug = null, keepWorkspace = false) => {
    setQuestionValidationError('');
    const targetSlug = forcedCourseSlug || q?.courseSlug || editingCourse?.slug || (courses[0]?.slug || 'dbms');

    if (q) {
      setEditingQuestion(q);
      setQuestionForm({
        courseSlug: q.courseSlug || targetSlug,
        question: q.question || '',
        option_a: q.option_a || '',
        option_b: q.option_b || '',
        option_c: q.option_c || '',
        option_d: q.option_d || '',
        correct_answer: q.correct_answer || 'A',
        marks: q.marks || 100,
        explanation: q.explanation || ''
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        courseSlug: targetSlug,
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        marks: 100,
        explanation: ''
      });
    }

    if (!keepWorkspace) {
      setActiveView('catalog');
      setCatalogTab('questions');
    }
    setShowQuestionEditor(true);
  };

  // Save Question (Validates question text & all options A-D)
  const handleSaveQuestion = (e) => {
    if (e) e.preventDefault();

    if (!questionForm.question || !questionForm.question.trim()) {
      setQuestionValidationError('Please enter a Question Statement prompt.');
      return;
    }
    if (!questionForm.option_a.trim() || !questionForm.option_b.trim() || !questionForm.option_c.trim() || !questionForm.option_d.trim()) {
      setQuestionValidationError('All multiple choice options (A, B, C, D) must be provided.');
      return;
    }

    setQuestionValidationError('');

    if (editingQuestion) {
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? {
        ...q,
        ...questionForm
      } : q));
    } else {
      const newQ = {
        id: `q-${Date.now()}`,
        ...questionForm
      };
      setQuestions(prev => [...prev, newQ]);
    }
    setShowQuestionEditor(false);
  };

  const handleConfirmDeleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    setDeleteQuestionId(null);
  };

  // Filter questions for catalog view
  const filteredQuestionsCatalog = questions.filter(q => {
    const matchesCourse = selectedCourseSlug === 'all' || q.courseSlug === selectedCourseSlug;
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  // Filter questions strictly for active course in workspace
  const workspaceCourseQuestions = editingCourse ? questions.filter(q => q.courseSlug === editingCourse.slug) : [];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* VIEW 1: CATALOG & QUESTION BANK VIEW                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeView === 'catalog' && (
        <div className="space-y-6">
          {/* Top Banner Header */}
          <div className="bg-gradient-to-r from-white via-slate-50 to-purple-50/30 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-600 via-indigo-600 to-blue-600"></div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">
                  MSC Admin Portal
                </span>
                <span className="text-xs text-slate-400 font-semibold">• Course Management Suite</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Course Tracks & Practice Questions</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                Manage official curriculums, upload technology brand icons, set exam rules (full-screen lock, time limits), and curate practice question banks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenWorkspace(null, 1)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
              >
                <Plus size={16} />
                <span>Add New Course</span>
              </button>
              
              <button
                onClick={() => {
                  setCatalogTab('questions');
                  handleOpenQuestionEditor();
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
              >
                <Plus size={16} />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Catalog Tabs */}
          <div className="flex border-b border-slate-200 space-x-8">
            <button
              onClick={() => setCatalogTab('courses')}
              className={`pb-3.5 text-xs font-black transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
                catalogTab === 'courses'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers size={17} />
              <span>Course Tracks ({courses.length})</span>
            </button>

            <button
              onClick={() => setCatalogTab('questions')}
              className={`pb-3.5 text-xs font-black transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
                catalogTab === 'questions'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <HelpCircle size={17} />
              <span>Question Bank ({questions.length})</span>
            </button>
          </div>

          {/* TAB 1: COURSES GRID */}
          {catalogTab === 'courses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const courseQuestionsCount = questions.filter(q => q.courseSlug === course.slug).length;
                const isPublished = course.status === 'published';
                const qs = course.quizSettings || DEFAULT_QUIZ_SETTINGS;
                const isDeletingThis = deleteCourseId === course.id;

                return (
                  <div
                    key={course.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative group"
                  >
                    {isDeletingThis ? (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-4 text-center animate-fade-in my-auto">
                        <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
                          <Trash2 size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-red-950">Delete {course.title}?</h4>
                          <p className="text-[11px] text-red-700 font-medium leading-relaxed">This course and settings will be permanently removed.</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeleteCourseId(null)}
                            className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleConfirmDeleteCourse(course.id)}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-xs"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 transition-transform overflow-hidden">
                              <img
                                src={resolveCourseImage(course.imageSrc)}
                                alt={course.title}
                                className="w-full h-full object-contain rounded-xl"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/logo.png';
                                }}
                              />
                            </div>

                            <button
                              onClick={() => handleToggleCourseStatus(course.id)}
                              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border flex items-center space-x-1 cursor-pointer transition-all ${
                                isPublished
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              }`}
                              title="Click to toggle Public Visibility"
                            >
                              {isPublished ? <Eye size={12} /> : <Clock size={12} />}
                              <span>{isPublished ? 'Published' : 'Coming Soon'}</span>
                            </button>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest block">{course.category}</span>
                            <h3 className="text-base font-black text-slate-900 mt-0.5">{course.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1.5 font-medium line-clamp-2">
                              {course.desc}
                            </p>
                          </div>

                          {/* Config Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {qs.randomizeQuestions && (
                              <span className="text-[9px] font-extrabold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md flex items-center gap-1">
                                <Shuffle size={10} /> Shuffle Qs
                              </span>
                            )}
                            {qs.requireFullScreen && (
                              <span className="text-[9px] font-extrabold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-md flex items-center gap-1">
                                <Maximize2 size={10} /> Full Screen
                              </span>
                            )}
                            <span className="text-[9px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md flex items-center gap-1">
                              <Clock size={10} /> {qs.timeLimitMinutes}m Limit
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                            <span className="flex items-center space-x-1.5">
                              <HelpCircle size={14} className="text-slate-400" />
                              <span>{courseQuestionsCount} Questions</span>
                            </span>

                            <button
                              onClick={() => handleOpenWorkspace(course, 3)}
                              className="text-purple-600 hover:text-purple-800 text-[11px] font-bold hover:underline cursor-pointer"
                            >
                              Manage Questions →
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenWorkspace(course, 2)}
                              className="flex-1 py-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                            >
                              <Settings size={14} />
                              <span>Edit Track</span>
                            </button>

                            <button
                              onClick={() => handleOpenWorkspace(course, 3)}
                              className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                            >
                              <Plus size={14} />
                              <span>Step 3: Qs</span>
                            </button>

                            <button
                              onClick={() => setDeleteCourseId(course.id)}
                              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-slate-200 transition-all cursor-pointer"
                              title="Delete Course Track"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: QUESTIONS BANK */}
          {catalogTab === 'questions' && (
            <div className="space-y-6">
              
              {/* Question Editor Inline Box */}
              {showQuestionEditor && (
                <div className="bg-white border-2 border-purple-300 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md animate-scale-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
                        {editingQuestion ? 'EDIT' : 'NEW'}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {editingQuestion ? 'Edit Practice Question' : 'Create New Practice Question'}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">Form fields are validated upon saving.</p>
                      </div>
                    </div>
                    <button onClick={() => setShowQuestionEditor(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                      <X size={20} />
                    </button>
                  </div>

                  {questionValidationError && (
                    <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-800 text-xs font-bold flex items-center space-x-2">
                      <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                      <span>{questionValidationError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveQuestion} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Target Course Track</label>
                      <select
                        value={questionForm.courseSlug}
                        onChange={(e) => setQuestionForm({ ...questionForm, courseSlug: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold focus:outline-none focus:border-purple-600 bg-slate-50 cursor-pointer"
                      >
                        {courses.map(c => (
                          <option key={c.slug} value={c.slug}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Question Statement Prompt *</label>
                      <textarea
                        rows={3}
                        required
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                        placeholder="Enter the question statement prompt..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-purple-600 bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map((letter) => {
                        const key = `option_${letter.toLowerCase()}`;
                        return (
                          <div key={letter} className="space-y-1.5">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Option {letter} *</label>
                            <input
                              type="text"
                              required
                              value={questionForm[key]}
                              onChange={(e) => setQuestionForm({ ...questionForm, [key]: e.target.value })}
                              placeholder={`Option ${letter} text...`}
                              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-purple-600 bg-slate-50"
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Correct Choice Option</label>
                        <select
                          value={questionForm.correct_answer}
                          onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold focus:outline-none focus:border-purple-600 bg-slate-50 cursor-pointer"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Points / Marks</label>
                        <input
                          type="number"
                          value={questionForm.marks}
                          onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-purple-600 bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Explanation Note</label>
                      <textarea
                        rows={2}
                        value={questionForm.explanation}
                        onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                        placeholder="Provide educational explanation note..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-purple-600 bg-slate-50"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowQuestionEditor(false)}
                        className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer active:scale-98"
                      >
                        Save Question
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Toolbar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="flex flex-1 items-center space-x-3 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 bg-slate-50"
                    />
                  </div>

                  <select
                    value={selectedCourseSlug}
                    onChange={(e) => setSelectedCourseSlug(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="all">All Course Tracks</option>
                    {courses.map(c => (
                      <option key={c.slug} value={c.slug}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleOpenQuestionEditor(null, selectedCourseSlug !== 'all' ? selectedCourseSlug : courses[0]?.slug)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Create Question</span>
                </button>
              </div>

              {/* Questions List */}
              {filteredQuestionsCatalog.map((q, idx) => {
                const targetCourse = courses.find(c => c.slug === q.courseSlug);
                const isDeletingThis = deleteQuestionId === q.id;

                return (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 text-left hover:border-purple-200 transition-colors">
                    {isDeletingThis ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center space-x-2.5 text-xs text-red-950 font-bold">
                          <Trash2 size={16} className="text-red-600 flex-shrink-0" />
                          <span>Delete this question permanently?</span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setDeleteQuestionId(null)}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleConfirmDeleteQuestion(q.id)}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-extrabold shadow-xs"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                              {targetCourse ? targetCourse.title : q.courseSlug}
                            </span>
                            <span className="text-xs font-bold text-slate-400">Question #{idx + 1}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenQuestionEditor(q)}
                              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-all"
                              title="Edit Question"
                            >
                              <Edit3 size={13} />
                              <span>Edit Question</span>
                            </button>
                            <button
                              onClick={() => setDeleteQuestionId(q.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                          {q.question}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-medium">
                          {[
                            { k: 'A', text: q.option_a },
                            { k: 'B', text: q.option_b },
                            { k: 'C', text: q.option_c },
                            { k: 'D', text: q.option_d }
                          ].map(opt => {
                            const isCorrect = q.correct_answer === opt.k;
                            return (
                              <div
                                key={opt.k}
                                className={`p-3.5 rounded-xl border flex items-center space-x-3 transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-extrabold shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                  isCorrect ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {opt.k}
                                </span>
                                <span>{opt.text}</span>
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="bg-purple-50/40 border border-purple-100 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
                            <span className="font-extrabold text-purple-900 block">Educational Explanation:</span>
                            <p className="leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* VIEW 2: DEDICATED INLINE WORKSPACE                             */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeView === 'workspace' && (
        <div className="space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <button
              onClick={() => setActiveView('catalog')}
              className="inline-flex items-center space-x-2 text-xs font-extrabold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>← Back to Course Catalog</span>
            </button>

            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase text-purple-600 tracking-wider block">Dedicated Course Workspace</span>
              <h2 className="text-base font-black text-slate-900">
                {editingCourse ? editingCourse.title : 'New Course Track'}
              </h2>
            </div>
          </div>

          {/* Validation Alert Banner */}
          {courseValidationError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-800 text-xs font-bold flex items-center space-x-2 shadow-2xs">
              <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
              <span>{courseValidationError}</span>
            </div>
          )}

          {/* Main Inline Workspace Card with Step Indicators */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
            
            {/* Step Indicators Header */}
            <div className="grid grid-cols-3 gap-3 border-b border-slate-200 pb-5">
              <button
                type="button"
                onClick={() => setWorkspaceStep(1)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  workspaceStep === 1
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    workspaceStep === 1 ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>1</span>
                  <span className="text-xs font-black">Course Profile</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Title, Icon & Category</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceStep(2)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  workspaceStep === 2
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    workspaceStep === 2 ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>2</span>
                  <span className="text-xs font-black">Quiz Parameters</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Timer, Pass Score & Lock</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceStep(3)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  workspaceStep === 3
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    workspaceStep === 3 ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>3</span>
                  <span className="text-xs font-black">Practice Questions ({workspaceCourseQuestions.length})</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Strict Track Question Bank</span>
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-8">
              
              {/* STEP 1: COURSE PROFILE */}
              {workspaceStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Technology Logo / Image Upload Section */}
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Technology Icon & Brand Logo</h4>
                      <p className="text-[11px] text-slate-500">Upload a custom technology icon or choose from official preset logos.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                      <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-2xs flex-shrink-0 overflow-hidden">
                        <img
                          src={resolveCourseImage(courseForm.imageSrc)}
                          alt="Technology Icon"
                          className="w-full h-full object-contain rounded-xl"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/logo.png';
                          }}
                        />
                      </div>

                      <div className="space-y-3 flex-1 w-full">
                        <div className="flex items-center gap-3">
                          <label className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all inline-flex items-center gap-2 shadow-xs active:scale-95">
                            <Upload size={16} />
                            <span>Upload Custom Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-xs text-slate-400 font-semibold">Supports PNG, SVG, JPG</span>
                        </div>

                        <input
                          type="text"
                          value={courseForm.imageSrc}
                          onChange={(e) => setCourseForm({ ...courseForm, imageSrc: e.target.value })}
                          placeholder="Or enter Image URL (e.g. https://mscprpcem.blob.core.windows.net/quiz/azure.png)"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-purple-600 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-200/70">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Quick Technology Presets</span>
                      <div className="flex flex-wrap gap-2.5">
                        {PRESET_ICONS.map((preset) => (
                          <button
                            key={preset.path}
                            type="button"
                            onClick={() => setCourseForm({ ...courseForm, imageSrc: preset.path })}
                            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-2 cursor-pointer ${
                              courseForm.imageSrc === preset.path
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <img
                              src={resolveCourseImage(preset.path)}
                              alt={preset.label}
                              className="w-4 h-4 object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/logo.png';
                              }}
                            />
                            <span>{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Course Track Title *</label>
                      <input
                        type="text"
                        required
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        placeholder="e.g. Microsoft Azure Fundamentals"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-purple-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Category *</label>
                      <input
                        type="text"
                        required
                        value={courseForm.category}
                        onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                        placeholder="e.g. Cloud Infrastructure"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Public Visibility Status</label>
                    <select
                      value={courseForm.status}
                      onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-purple-600 cursor-pointer bg-white"
                    >
                      <option value="coming_soon">Coming Soon (Public Display Badge)</option>
                      <option value="published">Published & Active for Students</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Course Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={courseForm.desc}
                      onChange={(e) => setCourseForm({ ...courseForm, desc: e.target.value })}
                      placeholder="Comprehensive overview of the technical course curriculum..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setWorkspaceStep(2)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 cursor-pointer shadow-md"
                    >
                      <span>Next: Quiz Parameters</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: QUIZ SETTINGS */}
              {workspaceStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-5 text-xs space-y-1.5">
                    <span className="font-extrabold text-purple-900 flex items-center gap-2 text-sm">
                      <Sliders size={16} /> Exam & Quiz Control Parameters
                    </span>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      Configure exam execution rules including question sequence randomization, option order shuffling, mandatory browser full-screen enforcement, timer limits, and passing grade thresholds.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all">
                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-slate-900 block">Randomize Question Sequence</span>
                        <span className="text-[11px] text-slate-500 block">Shuffle question order dynamically for every student attempt</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={courseForm.quizSettings?.randomizeQuestions ?? true}
                        onChange={(e) => setCourseForm({
                          ...courseForm,
                          quizSettings: { ...courseForm.quizSettings, randomizeQuestions: e.target.checked }
                        })}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all">
                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-slate-900 block">Randomize Option Order (A-D)</span>
                        <span className="text-[11px] text-slate-500 block">Shuffle multiple choice options for each question</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={courseForm.quizSettings?.randomizeOptions ?? true}
                        onChange={(e) => setCourseForm({
                          ...courseForm,
                          quizSettings: { ...courseForm.quizSettings, randomizeOptions: e.target.checked }
                        })}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all">
                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-slate-900 block">Require Full-Screen Lock</span>
                        <span className="text-[11px] text-slate-500 block">Force browser full-screen mode during test taking to prevent cheating</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={courseForm.quizSettings?.requireFullScreen ?? true}
                        onChange={(e) => setCourseForm({
                          ...courseForm,
                          quizSettings: { ...courseForm.quizSettings, requireFullScreen: e.target.checked }
                        })}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Quiz Duration (Minutes)</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={courseForm.quizSettings?.timeLimitMinutes || 10}
                        onChange={(e) => setCourseForm({
                          ...courseForm,
                          quizSettings: { ...courseForm.quizSettings, timeLimitMinutes: Number(e.target.value) }
                        })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-extrabold focus:outline-none focus:border-purple-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Passing Score Requirement (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={courseForm.quizSettings?.passingScore || 70}
                        onChange={(e) => setCourseForm({
                          ...courseForm,
                          quizSettings: { ...courseForm.quizSettings, passingScore: Number(e.target.value) }
                        })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-extrabold focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setWorkspaceStep(1)}
                      className="px-5 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center space-x-2 cursor-pointer hover:bg-slate-50"
                    >
                      <ArrowLeft size={16} />
                      <span>← Back to Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWorkspaceStep(3)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 cursor-pointer shadow-md"
                    >
                      <span>Step 3: Practice Questions</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PRACTICE QUESTIONS (FILTERED STRICTLY FOR THIS COURSE TRACK) */}
              {workspaceStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest block">Strict Track Questions</span>
                      <h4 className="text-sm font-black text-slate-900">
                        {editingCourse ? editingCourse.title : courseForm.title || 'This Track'} ({workspaceCourseQuestions.length} Questions)
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">Questions added here are strictly attached to this course track.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenQuestionEditor(null, editingCourse?.slug || 'cloud', true)}
                      className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-xs hover:bg-purple-700 cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>+ Add Practice Question</span>
                    </button>
                  </div>

                  {/* Inline Question Editor inside Step 3 */}
                  {showQuestionEditor && (
                    <div className="bg-purple-50/50 border border-purple-300 rounded-2xl p-6 space-y-5 shadow-sm animate-scale-in">
                      <div className="flex items-center justify-between border-b border-purple-200 pb-3">
                        <h4 className="text-sm font-black text-purple-950">
                          {editingQuestion ? 'Edit Question' : `Add Question to ${editingCourse?.title || 'Track'}`}
                        </h4>
                        <button type="button" onClick={() => setShowQuestionEditor(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={18} />
                        </button>
                      </div>

                      {questionValidationError && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-800 text-xs font-bold flex items-center space-x-2">
                          <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                          <span>{questionValidationError}</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">Question Statement *</label>
                          <textarea
                            rows={3}
                            required
                            value={questionForm.question}
                            onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                            placeholder="Enter question statement prompt..."
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-purple-600 bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {['A', 'B', 'C', 'D'].map((letter) => {
                            const key = `option_${letter.toLowerCase()}`;
                            return (
                              <div key={letter} className="space-y-1">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Option {letter} *</label>
                                <input
                                  type="text"
                                  required
                                  value={questionForm[key]}
                                  onChange={(e) => setQuestionForm({ ...questionForm, [key]: e.target.value })}
                                  placeholder={`Option ${letter} value...`}
                                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-purple-600 bg-white"
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Correct Option</label>
                            <select
                              value={questionForm.correct_answer}
                              onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-purple-600 bg-white cursor-pointer"
                            >
                              <option value="A">Option A</option>
                              <option value="B">Option B</option>
                              <option value="C">Option C</option>
                              <option value="D">Option D</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Marks</label>
                            <input
                              type="number"
                              value={questionForm.marks}
                              onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })}
                              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-purple-600 bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Explanation Note</label>
                          <textarea
                            rows={2}
                            value={questionForm.explanation}
                            onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                            placeholder="Educational explanation..."
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-purple-600 bg-white"
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowQuestionEditor(false)}
                            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveQuestion}
                            className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-extrabold shadow-xs hover:bg-purple-700"
                          >
                            Save Question to Track
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* List of questions for this course */}
                  {workspaceCourseQuestions.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-10 font-bold">No practice questions added to this track yet. Click "+ Add Practice Question" above.</p>
                  ) : (
                    <div className="space-y-3">
                      {workspaceCourseQuestions.map((q, i) => (
                        <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs shadow-2xs hover:border-purple-200 transition-colors">
                          <div className="truncate pr-3 font-medium">
                            <span className="font-bold text-purple-700 mr-2">Q{i + 1}.</span>
                            <span>{q.question}</span>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenQuestionEditor(q, editingCourse?.slug || 'cloud', true)}
                              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <Edit3 size={13} />
                              <span>Edit Question</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteQuestion(q.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Final Save Button at Step 3 */}
                  <div className="flex justify-between pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setWorkspaceStep(2)}
                      className="px-5 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center space-x-2 cursor-pointer hover:bg-slate-50"
                    >
                      <ArrowLeft size={16} />
                      <span>← Back to Quiz Parameters</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveCourse}
                      className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer active:scale-98 transition-all flex items-center space-x-2"
                    >
                      <Check size={16} />
                      <span>Save Course Track & All Settings</span>
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
