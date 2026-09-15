import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, RotateCcw, Clock, Trophy, Award, CheckCircle, 
  HelpCircle, ArrowRight, ArrowLeft, ShieldCheck, ChevronRight, 
  ChevronLeft, Sparkles, BookOpen, Code, Database, Globe, 
  Cpu, Layers, Target, CheckSquare, Flag, Share2, Download, AlertCircle, XCircle,
  ExternalLink, AlertTriangle
} from 'lucide-react';
import { normalizeSelection, toggleOptionInSelection, requestAppFullscreen } from '../utils/fullscreen';
import { useAuth } from '../context/AuthContext';

// Built-in Questions database
const PRACTICE_QUESTIONS = {
  frontend: [
    {
      id: 'f1',
      question: 'Which of the following is true about React Reconciliation?',
      option_a: 'It recreates the entire DOM on every state update.',
      option_b: 'It uses a diffing algorithm to update only changed components in the DOM.',
      option_c: 'It forces synchronous rendering for all event listeners.',
      option_d: 'It replaces Virtual DOM with shadow DOM directly.',
      correct_answer: 'B',
      marks: 100,
      explanation: 'Reconciliation is React\'s algorithm to diff the Virtual DOM tree with the actual DOM and update only the modified nodes, making UI updates fast and efficient.'
    },
    {
      id: 'f2',
      question: 'What is the purpose of the useEffect clean-up function?',
      option_a: 'To force re-render components on unmount.',
      option_b: 'To reset state values to their initial parameters.',
      option_c: 'To clear subscriptions, cancel timers, and avoid memory leaks before unmounting or re-running effects.',
      option_d: 'To validate props types before execution.',
      correct_answer: 'C',
      explanation: 'Returning a function from useEffect schedules a clean-up. This function runs before the effect re-runs or when the component unmounts, preventing memory leaks (e.g. clearing setIntervals).'
    }
  ],
  dsa: [
    {
      id: 'd1',
      question: 'What is the worst-case time complexity of QuickSort?',
      option_a: 'O(N log N)',
      option_b: 'O(N^2)',
      option_c: 'O(N)',
      option_d: 'O(1)',
      correct_answer: 'B',
      marks: 100,
      explanation: 'QuickSort worst-case time complexity is O(N^2) when the pivot chosen is consistently the smallest or largest element (e.g., sorted array without random pivot selection).'
    }
  ],
  dbms: [
    {
      id: 'db1',
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
      id: 'db2',
      question: 'In database normalisation, which Normal Form eliminates partial functional dependencies?',
      option_a: '1NF (First Normal Form)',
      option_b: '2NF (Second Normal Form)',
      option_c: '3NF (Third Normal Form)',
      option_d: 'BCNF',
      correct_answer: 'B',
      marks: 100,
      explanation: '2NF requires 1NF and additionally demands that all non-key attributes depend fully on the primary key.'
    }
  ],
  cloud: [
    {
      id: 'c1',
      question: 'Which Azure service is best suited for hosting Docker containers serverless?',
      option_a: 'Azure Virtual Machines',
      option_b: 'Azure Container Instances (ACI)',
      option_c: 'Azure Disk Storage',
      option_d: 'Azure App Service Basic',
      correct_answer: 'B',
      marks: 100,
      explanation: 'ACI lets you run containers serverless in seconds without VM infrastructure management.'
    }
  ],
  sql_filtering: [
    {
      id: 'filt1',
      question: "In SQL, what does the '%' wildcard match when using the LIKE operator?",
      option_a: "Strictly one single character.",
      option_b: "Zero, one, or multiple characters of any type.",
      option_c: "Only numeric digits from 0 through 9.",
      option_d: "Only uppercase alphabetic letters.",
      correct_answer: 'B',
      marks: 100,
      explanation: "The '%' (percent) wildcard in SQL represents 0 or more arbitrary characters, whereas '_' represents strictly one single character."
    },
    {
      id: 'filt2',
      question: "Which wildcard pattern matches all employee names that terminate with the letter 'a'?",
      option_a: "'a%'",
      option_b: "'%a'",
      option_c: "'_a'",
      option_d: "'%a%'",
      correct_answer: 'B',
      marks: 100,
      explanation: "'%a' matches any sequence of leading characters ending strictly in 'a' (e.g., 'Priya', 'Neha', 'Ananya')."
    },
    {
      id: 'filt3',
      question: "Is the SQL BETWEEN operator inclusive or exclusive of its boundary values?",
      option_a: "Exclusive of both minimum and maximum values.",
      option_b: "Inclusive of the minimum value, but exclusive of the maximum value.",
      option_c: "Inclusive of both minimum and maximum boundary values.",
      option_d: "Depends on whether the database engine is PostgreSQL or MySQL.",
      correct_answer: 'C',
      marks: 100,
      explanation: "In ANSI SQL, BETWEEN is strictly inclusive: 'WHERE salary BETWEEN 40000 AND 60000' is mathematically identical to 'salary >= 40000 AND salary <= 60000'."
    },
    {
      id: 'filt4',
      question: "Why does the query 'SELECT * FROM employees WHERE city = NULL;' fail to return rows with missing cities?",
      option_a: "Because NULL in SQL represents an unknown state, and comparing with '=' evaluates to UNKNOWN (not TRUE).",
      option_b: "Because MySQL only allows NULL comparison on integer columns.",
      option_c: "Because NULL is equal to an empty string '' in SQL.",
      option_d: "Because the '=' operator automatically casts NULL to zero.",
      correct_answer: 'A',
      marks: 100,
      explanation: "SQL utilizes Three-Valued Logic (TRUE, FALSE, UNKNOWN). Comparing any value with NULL using '=' produces UNKNOWN, which WHERE filters out. You must use 'IS NULL'."
    },
    {
      id: 'filt5',
      question: "Which query correctly finds employees whose name has the letter 'a' as its exact second character?",
      option_a: "SELECT * FROM employees WHERE name LIKE '%a%';",
      option_b: "SELECT * FROM employees WHERE name LIKE '_a%';",
      option_c: "SELECT * FROM employees WHERE name LIKE '__a%';",
      option_d: "SELECT * FROM employees WHERE name LIKE 'a_%';",
      correct_answer: 'B',
      marks: 100,
      explanation: "The underscore '_' matches exactly one arbitrary character, followed by 'a', followed by any remainder '%' (e.g. 'Rahul', 'Karan', 'Farhan')."
    },
    {
      id: 'filt6',
      question: "What is the boolean evaluation rule when executing 'val NOT IN (10, 20, NULL)' when val is 30?",
      option_a: "It evaluates to TRUE because 30 is neither 10 nor 20.",
      option_b: "It evaluates to UNKNOWN and returns no rows because 30 != NULL is UNKNOWN.",
      option_c: "It automatically ignores NULL and returns TRUE.",
      option_d: "It throws a fatal syntax error.",
      correct_answer: 'B',
      marks: 100,
      explanation: "'val NOT IN (10, 20, NULL)' expands to 'val != 10 AND val != 20 AND val != NULL'. Since 'val != NULL' is UNKNOWN, the entire AND expression becomes UNKNOWN, dropping the row."
    },
    {
      id: 'filt7',
      question: "How can you search for a literal underscore character '_' in a product code using LIKE?",
      option_a: "WHERE code LIKE '%_%'",
      option_b: "WHERE code LIKE '%!_%' ESCAPE '!'",
      option_c: "WHERE code LIKE '%[_]%' (without ESCAPE)",
      option_d: "Underscores cannot be searched using LIKE.",
      correct_answer: 'B',
      marks: 100,
      explanation: "Using the ESCAPE clause instructs the SQL engine to treat the character immediately following the escape token as a literal rather than a wildcard."
    },
    {
      id: 'filt8',
      question: "Why is 'WHERE (salary BETWEEN 40000 AND 70000) OR (salary IS NULL)' faster on large tables than 'WHERE COALESCE(salary, 50000) BETWEEN 40000 AND 70000'?",
      option_a: "Because COALESCE is only supported in SQLite.",
      option_b: "Because wrapping 'salary' in a function breaks index sargability, blinding the B+ Tree index and forcing a full table scan.",
      option_c: "Because BETWEEN cannot accept function outputs.",
      option_d: "Because IS NULL bypasses the query planner.",
      correct_answer: 'B',
      marks: 100,
      explanation: "Applying runtime scalar functions like COALESCE() to an indexed column prevents index range scanning (non-sargable query). Writing raw column predicates preserves B+ Tree index utilization."
    }
  ]
};

const CATEGORY_META = {
  sql_filtering: {
    title: 'SQL Advanced Filtering (LIKE, IN, BETWEEN, NULL)',
    desc: 'Master pattern matching wildcards (%, _), discrete sets, inclusive boundary ranges, three-valued NULL logic, and sargable index optimization.',
    themeColor: 'from-blue-600 to-cyan-600',
    hoverBorder: 'hover:border-blue-400',
    pillBg: 'bg-blue-50 text-blue-700',
    iconColor: 'text-blue-600 bg-blue-50'
  },
  dbms: {
    title: 'Database Management Systems (DBMS)',
    desc: 'Master SQL queries, Normalization (1NF to BCNF), ACID transaction properties, Indexing B-Trees, Relational Algebra, and Concurrency 2PL protocols.',
    themeColor: 'from-amber-500 to-orange-500',
    hoverBorder: 'hover:border-amber-400',
    pillBg: 'bg-amber-50 text-amber-700',
    iconColor: 'text-amber-600 bg-amber-50'
  },
  frontend: {
    title: 'Frontend Mastery',
    desc: 'Test your understanding of JavaScript closures, React reconciliation algorithms, hooks lifecycle, and responsive CSS architectures.',
    themeColor: 'from-blue-500 to-cyan-500',
    hoverBorder: 'hover:border-blue-400',
    pillBg: 'bg-blue-50 text-blue-700',
    iconColor: 'text-blue-600 bg-blue-50'
  },
  dsa: {
    title: 'Algorithms & Data Structures',
    desc: 'Solve complexities regarding balanced BST, stacks/queues LIFO principles, Dijkstra shortest paths, heaps, and binary tree traversals.',
    themeColor: 'from-emerald-500 to-teal-500',
    hoverBorder: 'hover:border-emerald-400',
    pillBg: 'bg-emerald-50 text-emerald-700',
    iconColor: 'text-emerald-600 bg-emerald-50'
  },
  cloud: {
    title: 'Cloud & DevOps Essentials',
    desc: 'Verify cloud serverless containerization (ACI), Infrastructure as Code (IaC), SaaS/PaaS models, Virtual Networks, and elasticity behaviors.',
    themeColor: 'from-purple-500 to-indigo-500',
    hoverBorder: 'hover:border-purple-400',
    pillBg: 'bg-purple-50 text-purple-700',
    iconColor: 'text-purple-600 bg-purple-50'
  }
};

export default function PracticeQuiz() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { studentAccount, issueStudentCertificate } = useAuth();

  // Active state control
  const [inQuiz, setInQuiz] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [timer, setTimer] = useState(120);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [issuedCert, setIssuedCert] = useState(null);

  const timerIntervalRef = useRef(null);

  // Dynamic Course and Questions Resolution from localStorage or Fallbacks
  const allSavedCourses = (() => {
    try {
      const saved = localStorage.getItem('msc_admin_courses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  })();

  const allSavedQuestions = (() => {
    try {
      const saved = localStorage.getItem('msc_admin_questions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  })();

  const matchedCourse = allSavedCourses.find(c => c.slug === category);
  
  // Resolve Questions array safely
  const customQuestionsForCategory = category ? allSavedQuestions.filter(q => q.courseSlug === category) : [];
  const questions = customQuestionsForCategory.length > 0 
    ? customQuestionsForCategory 
    : (PRACTICE_QUESTIONS[category] || PRACTICE_QUESTIONS['dbms']);

  // Resolve Meta safely (Guarantees meta is NEVER undefined!)
  const meta = CATEGORY_META[category] || (matchedCourse ? {
    title: matchedCourse.title,
    desc: matchedCourse.desc,
    themeColor: 'from-purple-500 to-indigo-500',
    hoverBorder: 'hover:border-purple-400',
    pillBg: 'bg-purple-50 text-purple-700',
    iconColor: 'text-purple-600 bg-purple-50'
  } : {
    title: category ? (category.charAt(0).toUpperCase() + category.slice(1)) : 'Practice Course Track',
    desc: 'Self-paced technical quiz and practice examination module.',
    themeColor: 'from-blue-500 to-indigo-500',
    hoverBorder: 'hover:border-blue-400',
    pillBg: 'bg-blue-50 text-blue-700',
    iconColor: 'text-blue-600 bg-blue-50'
  });

  // Timer effect
  useEffect(() => {
    if (inQuiz && !completed) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            handleSubmitTest();
            return 0;
          }
          setTimeSpent((t) => t + 1);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [inQuiz, completed]);

  const handleStartQuiz = () => {
    requestAppFullscreen().catch(() => {});
    setAnswers({});
    setFlags({});
    setTimer(120);
    setTimeSpent(0);
    setCurrentIdx(0);
    setCompleted(false);
    setIssuedCert(null);
    setInQuiz(true);
  };

  const handleSelectOption = (optionKey) => {
    const q = questions[currentIdx];
    const isMulti = q?.question_type === 'multiple' || (q?.correct_answer && q.correct_answer.includes(','));

    if (isMulti) {
      const current = answers[currentIdx] || '';
      const updated = toggleOptionInSelection(current, optionKey);
      setAnswers((prev) => ({
        ...prev,
        [currentIdx]: updated
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [currentIdx]: optionKey
      }));
    }
  };

  const toggleFlag = () => {
    setFlags((prev) => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  const handleSubmitTest = async () => {
    setCompleted(true);
    setInQuiz(false);
    setShowSubmitModal(false);
    clearInterval(timerIntervalRef.current);

    const scoreData = getScoreStats();
    if (scoreData.percentage >= 60) {
      const cert = await issueStudentCertificate({
        courseTitle: meta?.title || category,
        score: scoreData.percentage,
        passingScore: 60,
        badgeTitle: `${meta?.title || category} Certified Master`,
        email: studentAccount?.email || localStorage.getItem('msc_student_email') || 'student@prpcem.ac.in'
      });
      if (cert) setIssuedCert(cert);
    }
  };

  // Score calculation
  const getScoreStats = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const candidateNorm = normalizeSelection(answers[idx]);
      const correctNorm = normalizeSelection(q.correct_answer);
      if (candidateNorm && candidateNorm === correctNorm) {
        correct++;
      }
    });
    const total = questions.length || 1;
    const score = correct * 20;
    const percentage = Math.round((correct / total) * 100);
    return { correct, wrong: total - correct, score, percentage, total };
  };

  const stats = completed ? getScoreStats() : null;

  // Render Arena Selection Page if no category is in URL
  if (!category) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-lightBlue/20 via-zinc-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              Self-Paced Practice Tracks
            </span>
            <h1 className="text-4xl font-extrabold text-brand-textMain tracking-tight leading-none">
              Practice Arena
            </h1>
            <p className="text-zinc-550 text-base max-w-lg mx-auto leading-relaxed">
              Curated technical practice examinations and developer challenges. New question modules coming soon!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(CATEGORY_META).map(([key, value]) => (
              <div
                key={key}
                className={`bg-white border border-brand-border ${value.hoverBorder} rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left group`}
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${value.iconColor}`}>
                    {key === 'frontend' && <BookOpen size={22} />}
                    {key === 'dsa' && <Trophy size={22} />}
                    {key === 'cloud' && <Layers size={22} />}
                    {key === 'dbms' && <CheckSquare size={22} />}
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                      <Clock size={10} className="text-amber-600" />
                      <span>Coming Soon</span>
                    </span>
                    <h3 className="text-base font-bold text-brand-textMain">{value.title}</h3>
                  </div>
                  
                  <p className="text-xs text-brand-textMuted leading-relaxed">
                    {value.desc}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/practice/${key}`)}
                  className="mt-6 w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-200 active:scale-98"
                >
                  <Clock size={13} className="text-amber-600" />
                  <span>Preview Track Details</span>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 text-center">
            <button
              onClick={() => navigate('/courses')}
              className="inline-flex items-center space-x-2 text-xs font-extrabold text-brand-blue hover:underline cursor-pointer"
            >
              <span>Explore All Courses & Curriculums</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Scorecard View (Quiz Completed)
  if (completed && stats) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-brand-bgLight py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          
          {/* Header Banner */}
          <div className="bg-white border border-brand-border p-8 rounded-2xl shadow-sm text-center space-y-6 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${meta?.themeColor || 'from-blue-500 to-indigo-500'}`}></div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-widest bg-brand-lightBlue px-3 py-1 rounded-full">
                Exam Scorecard
              </span>
              <h1 className="text-3xl font-extrabold text-brand-textMain">{meta?.title || 'Practice Track'}</h1>
              <p className="text-xs text-brand-textMuted max-w-sm mx-auto">
                Completed on {new Date().toLocaleDateString()} • Result Summary
              </p>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-brand-bgLight p-4 rounded-xl border border-zinc-100 flex flex-col items-center justify-center space-y-1">
                <div className="relative w-16 h-16 flex items-center justify-center my-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-zinc-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={stats.percentage >= 60 ? 'text-emerald-500' : 'text-amber-500'}
                      strokeDasharray={`${stats.percentage}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-extrabold text-lg text-brand-textMain">
                    {stats.percentage}%
                  </div>
                </div>
                <span className="text-[10px] font-bold text-brand-textMuted uppercase tracking-widest">Accuracy Score</span>
              </div>

              <div className="bg-brand-bgLight p-4 rounded-xl border border-zinc-100 flex flex-col items-center justify-center space-y-1">
                <Award size={28} className="text-brand-blue mb-1" />
                <h3 className="text-2xl font-extrabold text-brand-textMain">{stats.score}</h3>
                <span className="text-[10px] font-bold text-brand-textMuted uppercase tracking-widest">Total Points</span>
              </div>

              <div className="bg-brand-bgLight p-4 rounded-xl border border-zinc-100 flex flex-col items-center justify-center space-y-1">
                <Clock size={28} className="text-brand-textMuted mb-1" />
                <h3 className="text-2xl font-extrabold text-brand-textMain">{Math.floor(timeSpent / 60)}m {timeSpent % 60}s</h3>
                <span className="text-[10px] font-bold text-brand-textMuted uppercase tracking-widest">Time Spent</span>
              </div>
            </div>

            {/* Certificate & Digital Badge Sync Card */}
            {stats.percentage >= 60 && (
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl p-6 text-left space-y-3 animate-fade-in shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-xs">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-widest block">Cross-Portal Auto Sync</span>
                      <h4 className="text-sm font-black text-purple-950">
                        Official Certificate & Digital Badge Issued!
                      </h4>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                    {issuedCert ? issuedCert.certificateId : 'CERT-MSC-AUTO'}
                  </span>
                </div>

                <p className="text-xs text-purple-900 leading-relaxed font-medium">
                  Congratulations! You scored <strong className="font-extrabold text-purple-950">{stats.percentage}%</strong>. Your achievement badge (<em className="font-extrabold text-purple-950">{meta?.title} Certified Master</em>) and official completion certificate have been automatically synced to your Student Account profile.
                </p>

                <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={issuedCert?.verificationUrl || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VERIFICATION_PORTAL_URL) || 'https://verify.mscprpcem.tech'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <span>View in Verification Portal</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex justify-center space-x-4 border-t border-zinc-100 pt-6">
              <button
                onClick={handleStartQuiz}
                className="flex items-center space-x-2 border border-brand-border hover:border-zinc-350 hover:bg-brand-bgLight text-zinc-655 font-bold px-5 py-2.5 rounded-lg text-xs transition-all cursor-pointer shadow-sm"
              >
                <RotateCcw size={14} />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-850 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-all cursor-pointer shadow-md"
              >
                <span>Back to Courses</span>
              </button>
            </div>
          </div>

          {/* Question Review List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-850">Review Question Details</h3>
            
            {questions.map((q, idx) => {
              const selectedOpt = answers[idx];
              const isCorrect = selectedOpt === q.correct_answer;
              
              return (
                <div key={q.id || idx} className="bg-white border border-brand-border p-6 rounded-xl shadow-sm space-y-4 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-textMuted font-bold uppercase tracking-wider">Question {idx + 1}</span>
                    <span className={`font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                      isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {isCorrect ? <CheckCircle size={12} className="mr-1" /> : <AlertCircle size={12} className="mr-1" />}
                      <span>{isCorrect ? 'Correct (+100 pts)' : 'Incorrect (+0 pts)'}</span>
                    </span>
                  </div>

                  <h4 className="text-md font-bold text-brand-textMain leading-tight">
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                      { k: 'A', text: q.option_a },
                      { k: 'B', text: q.option_b },
                      { k: 'C', text: q.option_c },
                      { k: 'D', text: q.option_d }
                    ].map((opt) => {
                      const isSelected = selectedOpt === opt.k;
                      const isCorrectOpt = q.correct_answer === opt.k;
                      
                      let optionBorder = 'border-brand-border';
                      let optionBg = 'bg-brand-bgLight/20';
                      let labelBg = 'bg-zinc-100 text-zinc-650';

                      if (isCorrectOpt) {
                        optionBorder = 'border-emerald-500/30';
                        optionBg = 'bg-emerald-50/30';
                        labelBg = 'bg-emerald-500 text-white';
                      } else if (isSelected && !isCorrectOpt) {
                        optionBorder = 'border-red-500/30';
                        optionBg = 'bg-red-50/30';
                        labelBg = 'bg-red-500 text-white';
                      }

                      return (
                        <div
                          key={opt.k}
                          className={`border p-3.5 rounded-lg flex items-center space-x-3 ${optionBorder} ${optionBg}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${labelBg}`}>
                            {opt.k}
                          </div>
                          <span className="font-semibold text-zinc-700">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 text-blue-800 font-bold">
                        <HelpCircle size={14} />
                        <span>Explanation Overview:</span>
                      </div>
                      <p className="text-zinc-600 leading-relaxed font-medium">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  // Active Quiz Arena Mode
  if (inQuiz) {
    const currentQ = questions[currentIdx] || questions[0];
    const isSelected = (opt) => answers[currentIdx] === opt;
    const isFlagged = flags[currentIdx];
    const totalQ = questions.length;

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-brand-bgLight py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-3 bg-white border border-brand-border p-5 rounded-2xl shadow-sm space-y-4">
            <div className="space-y-1 border-b border-zinc-100 pb-3 text-left">
              <span className="text-[10px] font-bold text-brand-textMuted uppercase tracking-widest">{meta?.title}</span>
              <h3 className="text-md font-bold text-brand-textMain">Test Dashboard</h3>
            </div>

            <div className="space-y-2 text-left">
              <p className="text-[10px] font-bold text-brand-textMuted uppercase tracking-widest">Question Navigation</p>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx) => {
                  let cellBg = 'bg-brand-bgLight border-brand-border text-brand-textMuted';
                  if (currentIdx === idx) {
                    cellBg = 'bg-zinc-900 border-zinc-900 text-white font-bold ring-2 ring-zinc-500/20';
                  } else if (flags[idx]) {
                    cellBg = 'bg-amber-500 border-amber-500 text-white font-bold';
                  } else if (answers[idx] !== undefined) {
                    cellBg = 'bg-brand-blue border-brand-blue text-white font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-full aspect-square border rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer hover:brightness-105 ${cellBg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-xs transition-all shadow-md mt-4 cursor-pointer active:scale-98"
            >
              Submit Test Paper
            </button>
          </div>

          <div className="lg:col-span-9 space-y-6">
            <div className="flex justify-between items-center bg-white border border-brand-border px-6 py-4 rounded-xl shadow-sm">
              <div className="space-y-0.5 text-left">
                <span className="text-[10px] font-bold text-brand-textMuted uppercase tracking-widest">In Progress</span>
                <h4 className="text-md font-bold text-brand-textMain">{meta?.title}</h4>
              </div>

              <div className="flex items-center space-x-2 bg-amber-50 border border-amber-100 text-amber-800 px-4 py-2 rounded-lg font-bold">
                <Clock size={16} className="text-amber-600 animate-pulse" />
                <span className="text-sm font-bold">
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="bg-white border border-brand-border p-8 rounded-2xl shadow-sm space-y-6 text-left relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${meta?.themeColor || 'from-blue-500 to-indigo-500'}`}></div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-brand-textMuted uppercase tracking-widest">Question {currentIdx + 1} of {totalQ}</span>
                  {currentQ.question_type === 'true_false' ? (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      True / False
                    </span>
                  ) : (currentQ.question_type === 'multiple' || (currentQ.correct_answer && currentQ.correct_answer.includes(','))) ? (
                    <span className="text-[10px] font-black text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                      ☑ Multiple Choice (Select all correct)
                    </span>
                  ) : null}
                </div>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isFlagged 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : 'bg-white border-brand-border hover:bg-brand-bgLight text-brand-textMuted'
                  }`}
                >
                  <Flag size={12} fill={isFlagged ? 'currentColor' : 'none'} />
                  <span>{isFlagged ? 'Flagged' : 'Flag Question'}</span>
                </button>
              </div>

              <h2 className="text-xl font-extrabold text-zinc-850 leading-tight">
                {currentQ.question}
              </h2>

              {/* Options */}
              {currentQ.question_type === 'true_false' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {[
                    { k: 'A', text: 'True', sub: 'Correct statement' },
                    { k: 'B', text: 'False', sub: 'Incorrect statement' }
                  ].map(opt => {
                    const selected = answers[currentIdx] === opt.k;
                    return (
                      <button
                        key={opt.k}
                        type="button"
                        onClick={() => handleSelectOption(opt.k)}
                        className={`w-full text-left p-5 rounded-2xl border transition-all relative flex items-center justify-between cursor-pointer ${
                          selected 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm' 
                            : 'bg-white border-brand-border hover:bg-brand-bgLight'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            selected ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {opt.k}
                          </div>
                          <div>
                            <div className="font-extrabold text-base">{opt.text}</div>
                            <div className="text-xs text-slate-500">{opt.sub}</div>
                          </div>
                        </div>
                        {selected && <CheckCircle className="text-emerald-600" size={20} />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 pt-2">
                  {[
                    { k: 'A', text: currentQ.option_a },
                    { k: 'B', text: currentQ.option_b },
                    { k: 'C', text: currentQ.option_c },
                    { k: 'D', text: currentQ.option_d }
                  ].filter(opt => opt.text).map((opt) => {
                    const isMulti = currentQ.question_type === 'multiple' || (currentQ.correct_answer && currentQ.correct_answer.includes(','));
                    const selectedKeys = normalizeSelection(answers[currentIdx]).split(',').filter(Boolean);
                    const selected = isMulti ? selectedKeys.includes(opt.k) : answers[currentIdx] === opt.k;
                    
                    return (
                      <button
                        key={opt.k}
                        type="button"
                        onClick={() => handleSelectOption(opt.k)}
                        className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all relative flex items-center justify-between cursor-pointer ${
                          selected 
                            ? (isMulti ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-500/20' : 'bg-brand-lightBlue border-brand-blue text-brand-dark ring-2 ring-brand-blue/20') 
                            : 'bg-white border-brand-border hover:border-brand-blue/40 hover:bg-brand-bgLight/50'
                        }`}
                      >
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            selected ? (isMulti ? 'bg-purple-600 text-white' : 'bg-brand-blue text-white') : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {opt.k}
                          </div>
                          <span className="font-semibold text-brand-textMain text-base break-words">{opt.text}</span>
                        </div>
                        {selected && <CheckSquare className={isMulti ? 'text-purple-600 shrink-0' : 'text-brand-blue shrink-0'} size={20} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="flex items-center space-x-1.5 border border-brand-border disabled:opacity-40 hover:bg-brand-bgLight disabled:hover:bg-white text-zinc-600 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <ChevronLeft size={16} />
                <span>Previous Question</span>
              </button>
              
              <button
                onClick={() => setCurrentIdx((prev) => Math.min(totalQ - 1, prev + 1))}
                disabled={currentIdx === totalQ - 1}
                className="flex items-center space-x-1.5 border border-brand-border disabled:opacity-40 hover:bg-brand-bgLight disabled:hover:bg-white text-zinc-600 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <span>Next Question</span>
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        </div>

        {showSubmitModal && (
          <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
            <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-left space-y-6 animate-scale-up relative overflow-hidden">
              
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500" />

              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0 border border-purple-100 shadow-inner">
                    <CheckSquare size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Submit Practice Test?</h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Review your question completion before evaluating your score.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* KPI Summary Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-0.5">
                  <div className="text-xl sm:text-2xl font-black text-emerald-700">{Object.keys(answers).length}</div>
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Answered</div>
                </div>

                <div className={`p-3.5 rounded-2xl text-center space-y-0.5 border ${
                  totalQ - Object.keys(answers).length > 0 
                    ? 'bg-amber-50/70 border-amber-200 text-amber-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <div className="text-xl sm:text-2xl font-black">{Math.max(0, totalQ - Object.keys(answers).length)}</div>
                  <div className="text-[10px] font-black uppercase tracking-wider">Unanswered</div>
                </div>

                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-center space-y-0.5">
                  <div className="text-xl sm:text-2xl font-black text-blue-700 font-mono">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Time Left</div>
                </div>
              </div>

              {/* Questions Quick Navigator Matrix */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-600">
                  <span>Questions Status (Click to Review):</span>
                  <span className="text-slate-400 font-medium">Green = Answered</span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {questions.map((_, idx) => {
                    const isAns = answers[idx] !== undefined;
                    const isFlag = flags[idx];
                    const isCurr = currentIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCurrentIdx(idx);
                          setShowSubmitModal(false);
                        }}
                        className={`aspect-square rounded-xl text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                          isCurr
                            ? 'bg-zinc-900 text-white ring-2 ring-purple-500 ring-offset-1'
                            : isFlag
                              ? 'bg-amber-500 text-white'
                              : isAns
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                        }`}
                        title={`Question ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Context Warning / Notice */}
              {totalQ - Object.keys(answers).length > 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-semibold flex items-start space-x-2.5">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    You have <strong>{totalQ - Object.keys(answers).length} unanswered question(s)</strong>. You can return and complete them before submitting.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center space-x-2.5">
                  <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                  <div className="leading-relaxed">
                    All <strong>{totalQ} questions</strong> answered! Click submit to generate your scorecard and digital credential.
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs transition-colors cursor-pointer text-center"
                >
                  Return to Test
                </button>
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-98"
                >
                  <span>Submit Practice Test</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  // Pre-Quiz Landing Card View for the chosen course category (Coming Soon)
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-lightBlue/20 via-zinc-50 to-white">
      <div className="max-w-md w-full bg-white border border-brand-border p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden group animate-fade-in text-left">
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${meta?.themeColor || 'from-amber-500 to-orange-500'}`}></div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Clock size={12} className="text-amber-600" />
              <span>Practice Track • Coming Soon</span>
            </span>
          </div>
          <h2 className="text-2xl font-black text-brand-textMain">{meta?.title || 'Practice Track'}</h2>
          <p className="text-xs text-brand-textMuted leading-relaxed font-medium">
            {meta?.desc || 'Test your knowledge on this topic with our interactive practice examination.'}
          </p>
        </div>

        {category === 'dbms' ? (
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-3 text-xs text-blue-950">
            <div className="flex items-center space-x-2 font-black text-xs text-blue-800">
              <Code size={16} className="text-blue-600 flex-shrink-0" />
              <span>⚡ Hands-on SQL Lab is LIVE!</span>
            </div>
            <p className="text-[11px] leading-relaxed font-medium text-blue-900">
              Practice writing real SQL queries with multi-table JOINs, aggregations, and placement challenges with real-time feedback.
            </p>
            <button
              onClick={() => navigate('/practice/sql')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-sm cursor-pointer active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <span>Launch Interactive SQL Lab</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2 text-xs text-amber-900">
            <div className="flex items-center space-x-2 font-black text-xs text-amber-800">
              <Clock size={16} className="text-amber-600 flex-shrink-0" />
              <span>Under Active Development</span>
            </div>
            <p className="text-[11px] leading-relaxed font-medium text-amber-800/90">
              Practice questions, timer evaluations, and auto-synced certificates for <strong>{meta?.title || 'this track'}</strong> are currently being curated by the MSC-PRPCEM technical team.
            </p>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 font-bold">
            <span>Question Bank:</span>
            <span className="text-amber-700 font-extrabold">{category === 'dbms' ? '16 Placement Queries' : 'In Curation'}</span>
          </div>
          <div className="flex justify-between text-slate-600 font-bold">
            <span>Platform Engine:</span>
            <span className="text-emerald-700 font-extrabold">{category === 'dbms' ? 'Real-Time SQL Environment' : 'Interactive'}</span>
          </div>
          <div className="flex justify-between text-slate-600 font-bold">
            <span>Interview Topics:</span>
            <span className="text-purple-700 font-extrabold">JOINs, Aggregations, LeetCode</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate('/courses')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <span>Explore All Courses & Curriculums</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={() => navigate('/practice')}
            className="w-full py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer text-center block"
          >
            ← Return to Practice Arena
          </button>
        </div>
      </div>
    </div>
  );
}
