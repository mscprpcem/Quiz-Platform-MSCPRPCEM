import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  GitBranch, Lock, Unlock, AlertTriangle, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ArrowRight, 
  ChevronLeft, ChevronRight, Lightbulb, ShieldCheck, Terminal, Award, 
  HelpCircle, BookOpen, Layers, Search, Check, Sparkles, Trophy, 
  Copy, X, Menu, Play, Eye, EyeOff, Code2, ListChecks, CheckSquare, Square,
  Loader2, Sun, Moon, ListOrdered, ChevronDown
} from 'lucide-react';
import { GIT_CHALLENGES, getGitChallengeSlug, slugifyTitle } from '../data/gitChallenges';
import { VirtualGitEngine } from '../services/gitEngine';
import GitTerminal from '../components/GitTerminal';
import GitVisualizer from '../components/GitVisualizer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDifficultyTheme } from '../utils/difficulty';
import LabSettingsDropdown, { getSavedSettings } from '../components/LabSettingsDropdown';
import ProblemStatementView from '../components/ProblemStatementView';

// Helper to determine live objective progress for each challenge
function getChallengeObjectives(challenge, engine) {
  if (!challenge || !engine) return [];

  if (typeof challenge.getObjectives === 'function') {
    return challenge.getObjectives(engine);
  }
  if (Array.isArray(challenge.objectives) && challenge.objectives.length > 0) {
    return challenge.objectives.map(obj => ({
      label: obj.label,
      done: typeof obj.done === 'function' ? Boolean(obj.done(engine)) : Boolean(obj.done)
    }));
  }

  const isInit = engine.isInitialized();
  const branch = engine.getHeadBranch();
  const commits = engine.getCommitHistory();
  const files = engine.files || {};
  const index = engine.index || {};
  const isClean = engine.isWorkingTreeClean ? engine.isWorkingTreeClean() : false;
  const isIdxClean = engine.isIndexClean ? engine.isIndexClean() : false;

  switch (challenge.id) {
    case 'git-init-first-commit':
      return [
        { label: 'Initialize the local Git repository', done: isInit },
        { label: 'Stage the README documentation for tracking', done: index['README.md'] !== undefined || (commits[0]?.files?.['README.md'] !== undefined) },
        { label: 'Create an initial commit with a descriptive message', done: commits.length > 0 && Boolean(commits[0]?.files?.['README.md']) },
        { label: 'Ensure working tree and staging area are clean', done: isInit && commits.length > 0 && isClean && isIdxClean }
      ];

    case 'git-staging-workflow':
      const latestC = engine.getLatestCommit();
      return [
        { label: 'Stage only web assets (HTML and CSS)', done: (index['index.html'] !== undefined && index['styles.css'] !== undefined) || (commits.length >= 2 && latestC?.files?.['index.html'] && latestC?.files?.['styles.css']) },
        { label: 'Keep draft notes untracked and out of commit', done: !index['draft.txt'] && !latestC?.files?.['draft.txt'] },
        { label: 'Commit the staged web modifications', done: commits.length >= 2 && Boolean(latestC?.files?.['index.html']) && !latestC?.files?.['draft.txt'] }
      ];

    case 'gitignore-secrets':
      const gitignore = engine.readFile('.gitignore') || '';
      return [
        { label: 'Configure ignore rules for secrets and dependencies', done: gitignore.includes('.env') && gitignore.includes('node_modules') },
        { label: 'Stage the ignore configuration file', done: index['.gitignore'] !== undefined || Boolean(engine.getLatestCommit()?.files?.['.gitignore']) },
        { label: 'Commit ignore rules while keeping environment files untracked', done: Boolean(engine.getLatestCommit()?.files?.['.gitignore']) && !engine.getLatestCommit()?.files?.['.env'] }
      ];

    case 'git-status-log-inspection':
      return [
        { label: 'Inspect past commits and repository history', done: true },
        { label: 'Create changelog documentation file', done: Boolean(files['changelog.txt']) },
        { label: 'Stage and commit the changelog documentation', done: Boolean(engine.getLatestCommit()?.files?.['changelog.txt']) && commits.length >= 4 }
      ];

    case 'git-branch-create-switch':
      return [
        { label: 'Create and switch to new authentication feature branch', done: branch === 'feature/auth' },
        { label: 'Create authentication module source file', done: Boolean(files['auth.js']) },
        { label: 'Stage and commit authentication file on the feature branch', done: branch === 'feature/auth' && Boolean(engine.getLatestCommit()?.files?.['auth.js']) }
      ];

    case 'git-fast-forward-merge':
      return [
        { label: 'Switch HEAD to the main branch', done: branch === 'main' },
        { label: 'Integrate cart feature branch via fast-forward merge', done: branch === 'main' && engine.getBranchCommit('main') === engine.getBranchCommit('feature/cart') }
      ];

    case 'git-three-way-merge':
      return [
        { label: 'Ensure HEAD is on the main branch', done: branch === 'main' },
        { label: 'Merge contact feature creating a 3-way merge commit', done: branch === 'main' && (engine.getLatestCommit()?.parentIds || []).length >= 2 }
      ];

    case 'git-branch-merge-conflict':
      const headerContent = engine.readFile('header.html') || '';
      return [
        { label: 'Initiate merge with the redesign branch', done: Boolean(engine.mergeState) || (engine.getLatestCommit()?.parentIds || []).length >= 2 },
        { label: 'Resolve conflict markers in the header file', done: !headerContent.includes('<<<<<<<') && !headerContent.includes('=======') && !headerContent.includes('>>>>>>>') },
        { label: 'Stage resolved files and finalize the merge commit', done: (engine.getLatestCommit()?.parentIds || []).length >= 2 && isClean && isIdxClean }
      ];

    case 'git-stash-workflow':
      return [
        { label: 'Shelve uncommitted changes to restore a clean tree', done: engine.hasUsedStash || engine.getStashList().length > 0 },
        { label: 'Restore shelved changes back to the working tree', done: engine.hasUsedStash && engine.getStashList().length === 0 }
      ];

    case 'git-reset-mixed':
      return [
        { label: 'Undo most recent commit without losing working tree changes', done: commits.length === 1 },
        { label: 'Verify schema modifications remain intact in working directory', done: Boolean(files['schema.sql']) }
      ];

    case 'git-cherry-pick':
      return [
        { label: 'Locate the auth patch commit on experimental branch', done: true },
        { label: 'Apply only the security patch commit directly onto main', done: Boolean(engine.getLatestCommit()?.files?.['patch.txt']) && !engine.getLatestCommit()?.files?.['vr.js'] }
      ];

    case 'git-revert-commit':
      return [
        { label: 'Safely invert broken payment commit using an inverse commit', done: commits.length >= 3 && Boolean(engine.getLatestCommit()?.message?.toLowerCase().includes('revert')) }
      ];

    case 'git-remote-add':
      const remotes = engine.getRemotes();
      return [
        { label: 'Configure origin remote pointing to target repository URL', done: Boolean(remotes['origin']) },
        { label: 'Verify remote upstream configuration', done: Boolean(remotes['origin']?.url?.includes('quiz-platform.git')) }
      ];

    case 'git-push-origin':
      return [
        { label: 'Switch to profile feature branch', done: branch === 'feature/profile' },
        { label: 'Publish branch to remote origin with upstream tracking', done: engine.getRemoteBranchCommit('origin', 'feature/profile') === engine.getBranchCommit('feature/profile') }
      ];

    case 'git-fetch-inspect':
      return [
        { label: 'Download remote commits without altering local working branch', done: engine.getRemoteBranchCommit('origin', 'main') === 'f202' },
        { label: 'Inspect remote tracking state without merging', done: engine.getRemoteBranchCommit('origin', 'main') === 'f202' && engine.getBranchCommit('main') !== 'f202' }
      ];

    case 'git-tag-release':
      const tags = engine.getTags();
      return [
        { label: 'Create annotated release tag v1.0.0 with documentation', done: Boolean(tags['v1.0.0']?.annotated) }
      ];

    case 'git-reflog-recovery':
      return [
        { label: 'Locate lost commit hash in reference log history', done: true },
        { label: 'Restore repository HEAD to recovered commit', done: engine.getLatestCommit()?.id === 'c902' || Boolean(engine.getLatestCommit()?.files?.['database.js']) }
      ];

    case 'git-rebase-linear':
      return [
        { label: 'Switch to dashboard feature branch', done: branch === 'feature/dashboard' },
        { label: 'Rebase on top of main for linear history', done: branch === 'feature/dashboard' && Boolean(engine.getLatestCommit()?.files?.['theme.css']) && Boolean(engine.getLatestCommit()?.files?.['dashboard.js']) && (engine.getLatestCommit()?.parentIds || []).length === 1 }
      ];

    case 'git-secret-scrubbing':
      return [
        { label: 'Remove secret file from index without deleting local copy', done: index['secrets.txt'] === undefined },
        { label: 'Add secret to ignore list and commit configuration', done: Boolean(engine.readFile('.gitignore')?.includes('secrets.txt')) && !engine.getLatestCommit()?.files?.['secrets.txt'] }
      ];

    case 'git-hotfix-workflow':
      const tagsHotfix = engine.getTags();
      const serverCode = engine.readFile('server.js') || '';
      return [
        { label: 'Create and switch to emergency hotfix branch', done: true },
        { label: 'Patch security vulnerability in server code', done: !serverCode.includes('allowAll = true') },
        { label: 'Merge fix into main and create release tag v1.0.1', done: branch === 'main' && Boolean(tagsHotfix['v1.0.1']) }
      ];

    default:
      return [
        { label: 'Execute target git workflow objectives', done: false },
        { label: 'Verify repository state matches requirements', done: isClean }
      ];
  }
}



export default function GitPractice() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Find active challenge based on URL slug, raw id, title slug, or 1-based index
  const activeChallenge = useMemo(() => {
    if (challengeId) {
      const cleanTarget = decodeURIComponent(challengeId).toLowerCase().trim();
      const found = GIT_CHALLENGES.find((c, idx) => 
        c.slug === cleanTarget || 
        c.id.toLowerCase() === cleanTarget ||
        slugifyTitle(c.title) === cleanTarget ||
        String(idx + 1) === cleanTarget ||
        c.id.replace(/^(cli|git)-/i, '').toLowerCase() === cleanTarget
      );
      if (found) return found;
    }
    return GIT_CHALLENGES[0];
  }, [challengeId]);

  // Auto-redirect /practice/git/lab or legacy ID to standard canonical URL slug
  useEffect(() => {
    if (activeChallenge) {
      const targetSlug = getGitChallengeSlug(activeChallenge);
      if (challengeId !== targetSlug) {
        navigate(`/practice/git/${targetSlug}`, { replace: true });
      }
    }
  }, [challengeId, activeChallenge, navigate]);

  // State
  const [engine, setEngine] = useState(null);
  const [engineVersion, setEngineVersion] = useState(0); // For forcing re-renders
  const [validationResult, setValidationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState('brief'); // 'brief' | 'hints' | 'cheatsheet'
  const [showVisualizer, setShowVisualizer] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerCategory, setDrawerCategory] = useState('all');
  const [cheatSheetSearch, setCheatSheetSearch] = useState('');
  const [activeHintIndex, setActiveHintIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [labSettings, setLabSettings] = useState(() => getSavedSettings());
  const [mobileView, setMobileView] = useState('brief'); // 'brief' | 'terminal'

  // Automatically switch away from hidden tabs if disabled in settings
  useEffect(() => {
    if (!labSettings.showHints && activeTab === 'hints') {
      setActiveTab('brief');
    }
    if (!labSettings.showCheatSheet && activeTab === 'cheatsheet') {
      setActiveTab('brief');
    }
  }, [labSettings, activeTab]);

  
  // Viewed hints tracking per challenge { [challengeId]: true }
  const [viewedHints, setViewedHints] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_viewed_hints');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleUnlockHints = (cId) => {
    setViewedHints(prev => {
      const next = { ...prev, [cId]: true };
      try {
        localStorage.setItem('msc_git_viewed_hints', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
    addToast('Hints revealed. No points will be allotted for this challenge.', 'info');
  };

  const [solvedChallenges, setSolvedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_solved_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Light / Dark Theme toggle (Default is false = Clean Modern Light Theme)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('msc_git_theme');
      return savedTheme === 'dark'; // Defaults to false (Clean Modern Light Theme)
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('msc_git_theme', next ? 'dark' : 'light');
      } catch (_) {}
      return next;
    });
  };

  // Layout Splitter Refs & Resizing States
  const workspaceRef = useRef(null);
  const rightPaneRef = useRef(null);

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Splitter: Left pane width percentage (default 40%, min 20%, max 75%)
  const [leftWidthPercent, setLeftWidthPercent] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_splitter_width');
      return saved ? parseFloat(saved) : 40;
    } catch {
      return 40;
    }
  });
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);

  // Splitter: Visualizer height in px (default 190px, min 90px, max 450px)
  const [visualizerHeightPx, setVisualizerHeightPx] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_visualizer_height');
      return saved ? parseInt(saved, 10) : 190;
    } catch {
      return 190;
    }
  });
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);

  // Dragging logic for Horizontal Splitter (Left vs Right Pane Width)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingHorizontal || !workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const rawPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(20, Math.min(75, rawPercent));
      setLeftWidthPercent(clamped);
    };

    const handleMouseUp = () => {
      if (isDraggingHorizontal) {
        setIsDraggingHorizontal(false);
        try {
          localStorage.setItem('msc_git_splitter_width', leftWidthPercent.toString());
        } catch {}
      }
    };

    if (isDraggingHorizontal) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingHorizontal, leftWidthPercent]);

  // Dragging logic for Vertical Splitter (Visualizer Height vs Terminal)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingVertical || !rightPaneRef.current) return;
      const rect = rightPaneRef.current.getBoundingClientRect();
      const topOffset = 40; // Sandbox header height ~40px
      const newHeight = e.clientY - rect.top - topOffset;
      const clampedHeight = Math.max(90, Math.min(450, newHeight));
      setVisualizerHeightPx(clampedHeight);
    };

    const handleMouseUp = () => {
      if (isDraggingVertical) {
        setIsDraggingVertical(false);
        try {
          localStorage.setItem('msc_git_visualizer_height', visualizerHeightPx.toString());
        } catch {}
      }
    };

    if (isDraggingVertical) {
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingVertical, visualizerHeightPx]);

  // Initialize virtual engine on challenge change
  useEffect(() => {
    if (activeChallenge) {
      const newEngine = new VirtualGitEngine(activeChallenge.initialState || {});
      setEngine(newEngine);
      setEngineVersion(prev => prev + 1);
      setValidationResult(null);
      setShowCelebration(false);
      setActiveHintIndex(0);
    }
  }, [activeChallenge]);

  // Load user progress from backend if logged in
  useEffect(() => {
    if (user?.email) {
      api.get(`/git/progress?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          if (res.data?.success && res.data?.progress?.completed_challenges) {
            setSolvedChallenges(res.data.progress.completed_challenges);
            localStorage.setItem('msc_git_solved_challenges', JSON.stringify(res.data.progress.completed_challenges));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Handle terminal command execution
  const handleCommandExecuted = (cmd, result) => {
    setEngineVersion(prev => prev + 1);
    // Clear failed validation result on new actions
    if (validationResult && !validationResult.passed) {
      setValidationResult(null);
    }
  };

  // Reset sandbox
  const handleResetSandbox = () => {
    if (window.confirm('Reset this challenge sandbox to its initial state? All in-progress virtual work will be cleared.')) {
      const newEngine = new VirtualGitEngine(activeChallenge.initialState || {});
      setEngine(newEngine);
      setEngineVersion(prev => prev + 1);
      setValidationResult(null);
      addToast('Sandbox reset to initial state', 'info');
    }
  };

  // Verify challenge
  const handleVerifySolution = async () => {
    if (!engine || !activeChallenge) return;
    setIsVerifying(true);

    try {
      // Execute state validator predicate
      const result = activeChallenge.validation(engine);
      setValidationResult(result);

      if (result.passed) {
        setShowCelebration(true);
        const updated = Array.from(new Set([...solvedChallenges, activeChallenge.id]));
        const hintWasUsed = Boolean(viewedHints[activeChallenge.id]);

        setSolvedChallenges(updated);
        localStorage.setItem('msc_git_solved_challenges', JSON.stringify(updated));

        // Sync with backend API
        if (user?.email) {
          try {
            await api.post('/git/progress/challenge', {
              challengeId: activeChallenge.id,
              email: user.email,
              isClean: !hintWasUsed
            });
          } catch (syncErr) {
            console.warn('Could not sync git progress to server, saved locally:', syncErr.message);
          }
        }

        if (hintWasUsed) {
          addToast('✓ Challenge Completed! (No points allotted because hints were used)', 'info');
        } else {
          addToast('🎉 Challenge Solved Successfully!', 'success');
        }
      } else {
        addToast(result.message || 'Solution did not pass validation.', 'error');
      }
    } catch (e) {
      setValidationResult({ passed: false, message: `Validator error: ${e.message}` });
    } finally {
      setIsVerifying(false);
    }
  };

  // Dynamic Objectives Checklist
  const objectives = useMemo(() => {
    return getChallengeObjectives(activeChallenge, engine);
  }, [activeChallenge, engine, engineVersion]);

  // Navigation
  const currentIndex = GIT_CHALLENGES.findIndex(c => c.id === activeChallenge.id);
  const nextChallenge = GIT_CHALLENGES[currentIndex + 1] || null;
  const prevChallenge = GIT_CHALLENGES[currentIndex - 1] || null;
  const isSolved = solvedChallenges.includes(activeChallenge.id);

  // Drawer filtering
  const filteredChallenges = useMemo(() => {
    return GIT_CHALLENGES.filter(c => {
      if (drawerCategory === 'solved' && !solvedChallenges.includes(c.id)) return false;
      if (drawerCategory !== 'all' && drawerCategory !== 'solved' && c.track !== drawerCategory) return false;
      if (drawerSearch.trim()) {
        const q = drawerSearch.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.scenario.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [drawerCategory, drawerSearch, solvedChallenges]);

  // Cheat Sheet Data
  const cheatSheetGroups = [
    {
      title: 'Basics & Staging',
      commands: [
        { cmd: 'git init', desc: 'Initialize a new repository' },
        { cmd: 'git status', desc: 'Check status of working tree & staging' },
        { cmd: 'git add <file>', desc: 'Stage specific file' },
        { cmd: 'git add .', desc: 'Stage all modified & untracked files' },
        { cmd: 'git commit -m "msg"', desc: 'Record staged changes in a commit' },
        { cmd: 'git commit -am "msg"', desc: 'Stage tracked files & commit' },
        { cmd: 'git --help', desc: 'Display global Git usage guide' }
      ]
    },
    {
      title: 'Branching & Merging',
      commands: [
        { cmd: 'git branch', desc: 'List local branches' },
        { cmd: 'git branch -a', desc: 'List local & remote branches' },
        { cmd: 'git switch -c <branch>', desc: 'Create & switch to new branch' },
        { cmd: 'git checkout -b <branch>', desc: 'Create & switch (classic syntax)' },
        { cmd: 'git switch <branch>', desc: 'Switch branch' },
        { cmd: 'git merge <branch>', desc: 'Merge branch into current HEAD' }
      ]
    },
    {
      title: 'Inspection & Logs',
      commands: [
        { cmd: 'git log --oneline', desc: 'Compact commit history' },
        { cmd: 'git log --graph', desc: 'Text-based branch tree graph' },
        { cmd: 'git diff', desc: 'Show unstaged working tree changes' },
        { cmd: 'git diff --staged', desc: 'Show staged changes against HEAD' },
        { cmd: 'git show <commit>', desc: 'Inspect commit snapshot & author' }
      ]
    },
    {
      title: 'Undoing & Stashing',
      commands: [
        { cmd: 'git stash', desc: 'Save uncommitted work to stash' },
        { cmd: 'git stash pop', desc: 'Restore saved stash changes' },
        { cmd: 'git reset <file>', desc: 'Unstage file while preserving work' },
        { cmd: 'git reset --mixed HEAD~1', desc: 'Rewind commit, unstage changes' },
        { cmd: 'git reset --hard HEAD~1', desc: 'Discard last commit & files' },
        { cmd: 'git revert <commit>', desc: 'Create safe inverted undo commit' }
      ]
    },
    {
      title: 'Remotes & Tagging',
      commands: [
        { cmd: 'git remote -v', desc: 'List configured remotes & URLs' },
        { cmd: 'git remote add <name> <url>', desc: 'Add remote repository' },
        { cmd: 'git push -u origin <branch>', desc: 'Push & set upstream tracking' },
        { cmd: 'git fetch origin', desc: 'Download remote commits safely' },
        { cmd: 'git tag -a v1.0.0 -m "msg"', desc: 'Create annotated release tag' }
      ]
    }
  ];

  // Filtered cheat sheet commands
  const filteredCheatSheetGroups = useMemo(() => {
    if (!cheatSheetSearch.trim()) return cheatSheetGroups;
    const q = cheatSheetSearch.toLowerCase();
    return cheatSheetGroups.map(g => ({
      ...g,
      commands: g.commands.filter(c => c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
    })).filter(g => g.commands.length > 0);
  }, [cheatSheetGroups, cheatSheetSearch]);

  return (
    <div className="h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col bg-white text-slate-800 font-sans overflow-hidden">
      
      {/* ── Top Header Navigation Bar (Clean Unboxed Typography) ── */}
      <header className="h-11 sm:h-12 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2.5 sm:px-4 md:px-6 flex items-center justify-between shrink-0 z-30">
        
        {/* Left: Back Link, Challenge Title (Unboxed), Difficulty & Solved */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 overflow-hidden">
          <Link
            to="/courses/git"
            className="text-slate-500 hover:text-slate-900 transition-colors p-1 rounded-lg hover:bg-slate-100 shrink-0"
            title="Return to Git Course Hub"
          >
            <ArrowLeft size={16} />
          </Link>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          {/* Challenge Selector (Clean Unboxed Title) */}
          <button
            onClick={() => setShowDrawer(true)}
            className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer truncate max-w-[125px] xs:max-w-[170px] sm:max-w-xs md:max-w-md py-1"
            title="Browse all Git practice labs"
          >
            <span className="truncate">
              {currentIndex + 1}. {activeChallenge.title}
            </span>
            <ChevronDown size={13} className="text-slate-400 shrink-0" />
          </button>

          {/* Difficulty (Clean Unboxed without dot) */}
          {(() => {
            const diffTheme = getDifficultyTheme(activeChallenge.difficulty);
            return (
              <div className="hidden md:flex items-center text-xs font-semibold shrink-0">
                <span className={diffTheme.text}>{diffTheme.label}</span>
              </div>
            );
          })()}

          {/* Solved Status (Clean Unboxed) */}
          {isSolved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 shrink-0">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="hidden sm:inline">Solved</span>
            </span>
          )}
        </div>

        {/* Right: Progress Counter (Unboxed) & Navigation */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          
          {/* Solved Progress Counter (Clean Unboxed Typography) */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <Trophy size={13} className="text-amber-500" />
            <span>Progress:</span>
            <span className="text-slate-900 font-mono font-bold">{solvedChallenges.length}</span>
            <span className="text-slate-400">/</span>
            <span className="font-mono text-slate-600">{GIT_CHALLENGES.length}</span>
          </div>



          <div className="hidden lg:block h-4 w-px bg-slate-200" />

          {/* Lab Preferences & Settings (Hide hints, tags, cheat sheet, etc.) */}
          <LabSettingsDropdown
            settings={labSettings}
            onSettingsChange={setLabSettings}
            isDarkMode={false}
          />

          {/* Navigation Prev / Next (Clean Ghost Buttons) */}
          <div className="flex items-center space-x-0.5">
            <button
              onClick={() => prevChallenge && navigate(`/practice/git/${getGitChallengeSlug(prevChallenge)}`)}
              disabled={!prevChallenge}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
              title={prevChallenge ? `Previous: ${prevChallenge.title}` : 'First Challenge'}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => nextChallenge && navigate(`/practice/git/${getGitChallengeSlug(nextChallenge)}`)}
              disabled={!nextChallenge}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
              title={nextChallenge ? `Next: ${nextChallenge.title}` : 'Last Challenge'}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile View Switcher (Only visible on screens < 1024px) */}
      <div className="lg:hidden flex items-center justify-between border-b border-slate-200 bg-slate-100 px-2 py-1.5 shrink-0 select-none">
        <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold w-full">
          <button
            onClick={() => setMobileView('brief')}
            className={`flex-1 h-8 px-2 rounded-md transition-all inline-flex items-center justify-center gap-1.5 leading-none whitespace-nowrap ${
              mobileView === 'brief'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={13} />
            <span>Brief</span>
          </button>
          <button
            onClick={() => setMobileView('terminal')}
            className={`flex-1 h-8 px-2 rounded-md transition-all inline-flex items-center justify-center gap-1.5 leading-none whitespace-nowrap ${
              mobileView === 'terminal'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal size={13} />
            <span>Terminal</span>
          </button>
          <button
            onClick={() => setMobileView('graph')}
            className={`flex-1 h-8 px-2 rounded-md transition-all inline-flex items-center justify-center gap-1.5 leading-none whitespace-nowrap ${
              mobileView === 'graph'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch size={13} />
            <span>Graph</span>
          </button>
        </div>
      </div>

      {/* ── Main Side-by-Side Split Workspace (100% Space, No Curves at Corners) ── */}
      <div 
        ref={workspaceRef}
        className="flex-1 flex flex-col lg:flex-row overflow-hidden relative w-full h-full"
      >

        {/* ══════════════════════════════════════════════════════
            LEFT PANE: LAB BRIEF, OBJECTIVES, HINTS & CHEAT SHEET
            ══════════════════════════════════════════════════════ */}
        <div 
          style={{ width: isDesktop ? `${leftWidthPercent}%` : '100%' }}
          className={`${
            !isDesktop && mobileView !== 'brief' ? 'hidden' : 'flex'
          } w-full flex-col border-r border-slate-200 bg-white shrink-0 overflow-hidden h-full rounded-none`}
        >
          
          {/* Left Panel Tabs (Clean Light Theme, Same as SQL Editor) */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 pt-2 gap-2 text-xs font-extrabold shrink-0">
            <button
              onClick={() => setActiveTab('brief')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'brief'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen size={13} />
              <span>Lab Brief</span>
            </button>

            {labSettings.showHints && (
              <button
                onClick={() => setActiveTab('hints')}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'hints'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lightbulb size={13} />
                <span>Step Hints</span>
                {viewedHints[activeChallenge.id] ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                    No Points
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {activeChallenge.hints?.length || 0}
                  </span>
                )}
              </button>
            )}

            {labSettings.showCheatSheet && (
              <button
                onClick={() => setActiveTab('cheatsheet')}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'cheatsheet'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Code2 size={13} />
                <span>Cheat Sheet</span>
              </button>
            )}
          </div>

          {/* Left Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white text-sm text-slate-800 select-text">
            
            {/* TAB 1: LAB BRIEF & OBJECTIVES */}
            {activeTab === 'brief' && (
              <div className="space-y-5 flex flex-col">
                
                {/* Problem Statement View */}
                <ProblemStatementView challenge={activeChallenge} isDarkMode={isDarkMode} showTags={labSettings.showTags} />

                {/* Live Interactive Objectives Checklist */}
                {labSettings.showObjectives && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ListChecks size={14} className="text-blue-600" />
                      Lab Objectives Checklist
                    </span>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {objectives.filter(o => o.done).length}/{objectives.length} Completed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {objectives.map((obj, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-lg border text-xs flex items-center space-x-2.5 transition-all ${
                          obj.done
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {obj.done ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Square size={16} className="text-slate-400 shrink-0" />
                        )}
                        <span className={`text-xs font-medium ${obj.done ? 'text-emerald-800 font-semibold line-through opacity-85' : 'text-slate-700'}`}>
                          {obj.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                {/* Initial Starter Files Preview */}
                {activeChallenge.initialState?.files && Object.keys(activeChallenge.initialState.files).length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Starting Files in Directory:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(activeChallenge.initialState.files).map(f => (
                        <span key={f} className="text-xs font-mono px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-bold flex items-center gap-1.5 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation Notice or Result */}
                {validationResult && (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed animate-fade-in flex items-start space-x-3 shadow-sm ${
                    validationResult.passed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}>
                    {validationResult.passed ? (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <span className="font-extrabold block text-xs">
                        {validationResult.passed ? 'Challenge Solved! 🎉' : 'Needs Revision'}
                      </span>
                      <p className="text-xs text-slate-700 leading-normal">
                        {validationResult.message}
                      </p>
                    </div>
                  </div>
                )}
                {/* Mobile Quick Switch to Terminal */}
                {!isDesktop && (
                  <div className="pt-2 pb-6">
                    <button
                      onClick={() => setMobileView('terminal')}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Terminal size={14} />
                      <span>Open Terminal & Run Commands →</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: STEP-BY-STEP HINTS */}
            {activeTab === 'hints' && (
              <div className="space-y-4">
                {!viewedHints[activeChallenge.id] ? (
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3.5 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-600 dark:text-slate-400">
                      <Lock size={20} />
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5">
                        <AlertCircle size={14} />
                        <span>Warning: No points will be allotted</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        If you use hints, <strong>no points will be allotted</strong> for this challenge. Try to think and solve it on your own!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnlockHints(activeChallenge.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                      <Lock size={13} />
                      <span>Reveal Hint (No Points Will Be Allotted)</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <span className="flex items-center gap-1.5 font-bold">
                        <AlertCircle size={14} className="text-red-500" />
                        <span>Hint Used — No Points Will Be Allotted</span>
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Step {activeHintIndex + 1} of {activeChallenge.hints?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Lightbulb size={14} className="text-slate-500" />
                        Progressive Guidance Clues
                      </span>
                    </div>

                    {activeChallenge.hints && activeChallenge.hints.length > 0 ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 rounded border border-slate-300 dark:border-slate-600">
                              Step {activeHintIndex + 1}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
                            {activeChallenge.hints[activeHintIndex]}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-1 text-xs">
                          <button
                            disabled={activeHintIndex === 0}
                            onClick={() => setActiveHintIndex(prev => Math.max(0, prev - 1))}
                            className="text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 transition-colors shadow-2xs"
                          >
                            ← Previous Hint
                          </button>
                          <button
                            disabled={activeHintIndex === (activeChallenge.hints?.length || 1) - 1}
                            onClick={() => setActiveHintIndex(prev => Math.min((activeChallenge.hints?.length || 1) - 1, prev + 1))}
                            className="text-blue-700 hover:bg-blue-100 disabled:opacity-30 cursor-pointer font-bold px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 transition-colors shadow-2xs"
                          >
                            Next Hint →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-4 text-center">No hints provided for this lab.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GIT CHEAT SHEET */}
            {activeTab === 'cheatsheet' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Git commands..."
                    value={cheatSheetSearch}
                    onChange={(e) => setCheatSheetSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  {filteredCheatSheetGroups.map((group) => (
                    <div key={group.title} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        {group.title}
                      </span>
                      <div className="space-y-1.5 select-text">
                        {group.commands.map((item) => (
                          <div 
                            key={item.cmd} 
                            onClick={() => {
                              navigator.clipboard.writeText(item.cmd);
                              addToast?.(`Copied "${item.cmd}" to clipboard!`, { type: 'success' });
                            }}
                            className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between gap-2 shadow-2xs hover:bg-slate-100/80 transition-colors cursor-pointer group"
                            title="Click to copy command"
                          >
                            <div className="flex flex-col gap-0.5 select-text">
                              <code className="text-blue-700 font-mono font-bold text-[11px]">{item.cmd}</code>
                              <span className="text-[10px] text-slate-500">{item.desc}</span>
                            </div>
                            <span className="p-1 rounded-md text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
                              <Copy size={12} />
                            </span>
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

        {/* ── DESKTOP DRAGGABLE VERTICAL DIVIDER (Resizes Left vs Right Width) ── */}
        <div
          onMouseDown={() => setIsDraggingHorizontal(true)}
          className={`hidden lg:flex w-1.5 hover:w-2 bg-slate-200 hover:bg-blue-600 active:bg-blue-600 cursor-col-resize select-none transition-all relative items-center justify-center shrink-0 z-20 group ${
            isDraggingHorizontal ? 'bg-blue-600 w-2' : ''
          }`}
          title="Drag left or right to adjust pane widths"
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT PANE: LIVE SANDBOX WORKSPACE (FULL SPACE, NO CURVE)
            ══════════════════════════════════════════════════════ */}
        <div 
          ref={rightPaneRef}
          style={{ width: isDesktop ? `${100 - leftWidthPercent}%` : '100%' }}
          className={`${
            !isDesktop && mobileView !== 'terminal' ? 'hidden' : 'flex'
          } flex-1 flex-col bg-white overflow-hidden min-w-0 h-full rounded-none`}
        >
          
          {/* Top Sandbox Controls Bar */}
          <div className="h-10 bg-slate-100/90 border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between shrink-0 text-slate-700">
            <div className="flex items-center space-x-2 overflow-hidden">
              <span className="text-xs font-bold font-mono text-slate-800 flex items-center gap-1.5 shrink-0">
                <Terminal size={13} className="text-blue-600" />
                <span className="hidden sm:inline">Sandbox Workspace</span>
                <span className="sm:hidden">Terminal</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full truncate max-w-[130px]">
                HEAD -&gt; {engine ? engine.getHeadBranch() : 'main'}
              </span>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-2 shrink-0">
              {!isDesktop ? (
                <button
                  onClick={() => setMobileView('graph')}
                  className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md transition-all flex items-center gap-1 shadow-2xs"
                >
                  <GitBranch size={11} className="text-blue-600" />
                  <span>Graph</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowVisualizer(!showVisualizer)}
                  className="text-[11px] font-bold text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  title={showVisualizer ? 'Hide state visualizer' : 'Show state visualizer'}
                >
                  {showVisualizer ? <EyeOff size={11} /> : <Eye size={11} />}
                  <span className="hidden sm:inline">{showVisualizer ? 'Hide Visualizer' : 'Show Visualizer'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Sandbox Split View Body (Edge-to-edge full space, zero curves) */}
          <div className="flex-1 flex flex-col overflow-hidden w-full h-full p-0 gap-0 bg-white">
            
            {/* Visualizer Area (Desktop only - flush top pane with dynamic height) */}
            {isDesktop && showVisualizer && (
              <div 
                style={{ height: `${visualizerHeightPx}px` }}
                className="shrink-0 w-full overflow-hidden border-b border-slate-200"
              >
                <GitVisualizer engine={engine} key={`vis-${engineVersion}`} />
              </div>
            )}

            {/* Draggable Horizontal Divider (Desktop only) */}
            {isDesktop && showVisualizer && (
              <div
                onMouseDown={() => setIsDraggingVertical(true)}
                className={`w-full h-1.5 hover:h-2 bg-slate-200 hover:bg-blue-600 active:bg-blue-600 cursor-row-resize select-none transition-all flex items-center justify-center shrink-0 z-10 ${
                  isDraggingVertical ? 'bg-blue-600 h-2' : ''
                }`}
                title="Drag up or down to adjust visualizer height"
              >
                <div className="h-0.5 w-8 rounded-full bg-slate-400" />
              </div>
            )}

            {/* Interactive Terminal Area (Fills remaining height edge-to-edge) */}
            <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
              <GitTerminal
                engine={engine}
                onCommandExecuted={handleCommandExecuted}
                key={`term-${activeChallenge.id}`}
                className="h-full w-full flex-1"
                initialMessage={`Welcome to the Git Terminal Simulator!\nPlayground mode activated. Freely experiment with Git commands. Type 'help' for help.\n▲ Note: This is a simplified Git simulation for learning purposes. Some commands may behave differently than in real Git.`}
              />
            </div>

            {/* ── Action Bar at Bottom of Terminal ── */}
            <div className="h-12 border-t border-slate-200 bg-slate-50/90 px-3 sm:px-4 flex items-center justify-between shrink-0">
              {/* Left: Staged count & Keyboard shortcuts */}
              <div className="flex items-center space-x-2 text-xs">
                {engine && Object.keys(engine.index || {}).length > 0 && (
                  <span className="text-emerald-600 font-mono font-bold text-xs flex items-center gap-1">
                    + {Object.keys(engine.index).length} staged
                  </span>
                )}
                <div className="hidden sm:flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                  <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 shadow-2xs">Tab</kbd> complete</span>
                  <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 shadow-2xs">↑/↓</kbd> history</span>
                </div>
              </div>

              {/* Right: Reset & Verify and Submit Button */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                <button
                  onClick={handleResetSandbox}
                  className="h-8 px-2.5 sm:px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs leading-none shrink-0 whitespace-nowrap"
                  title="Reset sandbox to initial state"
                >
                  <RefreshCw size={12} className="text-slate-500" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                <button
                  onClick={handleVerifySolution}
                  disabled={isVerifying}
                  className="h-8 px-3 sm:px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all inline-flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 leading-none shrink-0 whitespace-nowrap"
                  title="Submit and verify solution"
                >
                  {isVerifying ? (
                    <Loader2 size={13} className="animate-spin text-white" />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}
                  <span>{isVerifying ? 'Evaluating...' : 'Verify & Submit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MOBILE-ONLY FULL SCREEN GIT GRAPH / VISUALIZER PANE
            ══════════════════════════════════════════════════════ */}
        {!isDesktop && (
          <div 
            className={`${
              mobileView === 'graph' ? 'flex' : 'hidden'
            } flex-1 flex-col bg-white overflow-hidden min-w-0 w-full h-full`}
          >
            <div className="h-10 bg-slate-100/90 border-b border-slate-200 px-3 flex items-center justify-between shrink-0 text-slate-700">
              <span className="text-xs font-bold font-mono text-slate-800 flex items-center gap-1.5">
                <GitBranch size={13} className="text-blue-600" />
                <span>Git Visualizer Graph</span>
              </span>
              <button
                onClick={() => setMobileView('terminal')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg"
              >
                <span>Terminal</span>
                <ArrowRight size={12} />
              </button>
            </div>
            <div className="flex-1 min-h-0 w-full overflow-y-auto">
              <GitVisualizer engine={engine} key={`vis-mob-${engineVersion}`} />
            </div>
            <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
              <button
                onClick={() => setMobileView('terminal')}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Terminal size={13} />
                <span>Open Terminal to Run Commands →</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Transparent Drag Overlay during dragging */}
      {(isDraggingHorizontal || isDraggingVertical) && (
        <div 
          onClick={() => {
            setIsDraggingHorizontal(false);
            setIsDraggingVertical(false);
          }}
          onMouseUp={() => {
            setIsDraggingHorizontal(false);
            setIsDraggingVertical(false);
          }}
          className={`fixed inset-0 z-50 select-none ${
            isDraggingHorizontal ? 'cursor-col-resize' : 'cursor-row-resize'
          }`} 
        />
      )}

      {/* ── Slide-Over Challenge Drawer Modal (Clean Light Theme) ── */}
      {showDrawer && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-start"
          onClick={() => setShowDrawer(false)}
        >
          <div 
            className="bg-white border-r border-slate-200 w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-right select-text"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center space-x-2">
                <ListOrdered size={16} className="text-blue-600" />
                <span className="text-sm font-bold text-slate-900 tracking-tight">Git Practice Labs</span>
                <span className="text-xs text-slate-400 font-mono">({GIT_CHALLENGES.length})</span>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Search & Track Filters */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="Search labs by command or title..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {[
                  { id: 'all', label: 'All (70)' },
                  { id: 'terminal', label: 'Terminal (25)' },
                  { id: 'git-basics', label: 'Git Basics (25)' },
                  { id: 'git-advanced', label: 'Advanced Git (20)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDrawerCategory(tab.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      drawerCategory === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Challenge List in Drawer (Clean, No Curves) */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
              {filteredChallenges.map((c, idx) => {
                const isSelected = c.id === activeChallenge.id;
                const completed = solvedChallenges.includes(c.id);
                const diffTheme = getDifficultyTheme(c.difficulty, isSelected);

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setShowDrawer(false);
                      navigate(`/practice/git/${getGitChallengeSlug(c)}`);
                    }}
                    className={`px-4 py-3.5 transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate flex-1 pr-2">
                      {/* Tick mark before completed questions; extra spacing placeholder for non-completed */}
                      {completed ? (
                        <Check
                          size={14}
                          strokeWidth={2.5}
                          className={`shrink-0 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`}
                        />
                      ) : (
                        <span className="w-3.5 shrink-0" />
                      )}

                      <span className={`text-xs font-mono font-bold w-5 shrink-0 ${
                        isSelected ? 'text-slate-400' : 'text-slate-400'
                      }`}>
                        {idx + 1}.
                      </span>
                      <div className="truncate">
                        <span className={`text-xs block truncate ${
                          isSelected
                            ? 'font-bold text-white'
                            : 'font-medium text-slate-900'
                        }`}>
                          {c.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center shrink-0">
                      <span className={`text-[11px] font-semibold ${diffTheme.text}`}>
                        {diffTheme.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Celebration Modal on Solved ── */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-md">
              <Award size={32} />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Challenge Solved
              </span>
              <h3 className="text-lg font-black text-slate-900">{activeChallenge.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {validationResult?.message || "Great work! You achieved the correct repository state."}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => setShowCelebration(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
              >
                Keep Experimenting
              </button>

              {nextChallenge && (
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    navigate(`/practice/git/${getGitChallengeSlug(nextChallenge)}`);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Next Challenge</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
