import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, Trash2, FileCode, Check, Save, Plus, X, 
  SquareCode, CheckCircle2, ChevronRight, FileText, HelpCircle, 
  RotateCcw
} from 'lucide-react';

export default function GitTerminal({
  engine,
  onCommandExecuted,
  className = '',
  initialMessage = `Welcome to the Git Terminal Simulator!\nPlayground mode activated. Freely experiment with Git commands. Type 'help' for help.\n▲ Note: This is a simplified Git simulation for learning purposes. Some commands may behave differently than in real Git.`
}) {
  // Modes: 'shell' | 'cmd' | 'vim'
  const [terminalMode, setTerminalMode] = useState('shell');
  const [previousMode, setPreviousMode] = useState('shell');

  // Terminal history & input state
  const [history, setHistory] = useState([
    { type: 'system', text: initialMessage }
  ]);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  // Auto-hide welcome simulator message after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeBanner(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);

  // Vim Editor state
  const [vimCurrentFile, setVimCurrentFile] = useState('README.md');
  const [vimContent, setVimContent] = useState('');
  const [vimMode, setVimMode] = useState('NORMAL'); // 'NORMAL' | 'INSERT' | 'COMMAND'
  const [vimCommandLine, setVimCommandLine] = useState('');
  const [vimStatusMsg, setVimStatusMsg] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const terminalEndRef = useRef(null);
  const terminalBodyRef = useRef(null);
  const inputRef = useRef(null);
  const vimTextareaRef = useRef(null);
  const vimCommandInputRef = useRef(null);

  // Auto-scroll to bottom of terminal content area
  useEffect(() => {
    if (terminalMode !== 'vim' && terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history, terminalMode, inputVal]);

  // Sync Vim content whenever opening Vim or switching file
  useEffect(() => {
    if (terminalMode === 'vim' && engine) {
      const existingFiles = Object.keys(engine.files || {});
      let targetFile = vimCurrentFile;
      if (!targetFile || (existingFiles.length > 0 && !engine.files[targetFile])) {
        targetFile = existingFiles[0] || 'README.md';
        setVimCurrentFile(targetFile);
      }
      const content = engine.readFile ? engine.readFile(targetFile) : (engine.files?.[targetFile] || '');
      setVimContent(content || '');
      const lineCount = (content || '').split('\n').length;
      setVimStatusMsg(`"${targetFile}" ${lineCount}L, ${(content || '').length}B`);
      setVimMode('NORMAL');
    }
  }, [terminalMode, vimCurrentFile, engine]);

  // Keep focus on input when clicking anywhere in terminal
  const handleContainerClick = (e) => {
    // If user has highlighted / selected text with mouse, do not clear selection
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      return;
    }
    // Do not steal focus if clicking interactive elements
    if (e?.target?.closest('button, input, select, textarea, a')) {
      return;
    }
    if (terminalMode === 'vim') {
      if (vimMode === 'INSERT') {
        vimTextareaRef.current?.focus();
      }
    } else {
      inputRef.current?.focus();
    }
  };

  const currentBranch = engine ? engine.getHeadBranch() : 'main';

  // Switch terminal mode safely
  const handleSwitchMode = (newMode) => {
    if (newMode === terminalMode) return;
    if (terminalMode !== 'vim') {
      setPreviousMode(terminalMode);
    }
    setTerminalMode(newMode);
    if (newMode === 'vim') {
      const existingFiles = Object.keys(engine?.files || {});
      const activeFile = existingFiles.includes(vimCurrentFile) ? vimCurrentFile : (existingFiles[0] || 'README.md');
      setVimCurrentFile(activeFile);
      setVimContent(engine?.readFile ? engine.readFile(activeFile) || '' : '');
      setVimMode('NORMAL');
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    // Arrow Up: Previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextPtr = historyPointer === -1 ? commandHistory.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPtr);
      setInputVal(commandHistory[nextPtr] || '');
      return;
    }

    // Arrow Down: Next command
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer === -1) return;
      const nextPtr = historyPointer + 1;
      if (nextPtr >= commandHistory.length) {
        setHistoryPointer(-1);
        setInputVal('');
      } else {
        setHistoryPointer(nextPtr);
        setInputVal(commandHistory[nextPtr] || '');
      }
      return;
    }

    // Tab: Auto-completion
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabComplete();
      return;
    }

    // Enter: Execute command
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputVal);
    }
  };

  const handleTabComplete = () => {
    const val = inputVal.trim();
    if (!val) return;

    const commonGitSubcommands = [
      'init', 'status', 'add', 'rm', 'commit', 'branch', 'checkout', 'switch',
      'log', 'diff', 'merge', 'rebase', 'stash', 'reset', 'revert', 'cherry-pick',
      'remote', 'push', 'pull', 'fetch', 'tag', 'reflog', 'restore', 'show',
      '--help', '--version', 'help'
    ];

    if (val === 'git' || val.startsWith('git ')) {
      const parts = val.split(' ');
      if (parts.length === 2) {
        const prefix = parts[1];
        const match = commonGitSubcommands.find(c => c.startsWith(prefix));
        if (match) {
          setInputVal(`git ${match} `);
          return;
        }
      }

      // Branch completion: git checkout <b...>, git switch <b...>, git merge <b...>
      if (parts.length === 3 && (parts[1] === 'checkout' || parts[1] === 'switch' || parts[1] === 'merge' || parts[1] === 'rebase')) {
        if (engine && engine.getBranches) {
          const branches = Object.keys(engine.getBranches());
          const matchBranch = branches.find(b => b.startsWith(parts[2]));
          if (matchBranch) {
            setInputVal(`git ${parts[1]} ${matchBranch}`);
            return;
          }
        }
      }
    }

    // File completion
    if (engine && engine.files) {
      const files = Object.keys(engine.files);
      const parts = val.split(' ');
      const lastPart = parts[parts.length - 1];
      const matchFile = files.find(f => f.startsWith(lastPart));
      if (matchFile) {
        parts[parts.length - 1] = matchFile;
        setInputVal(parts.join(' ') + ' ');
      }
    }
  };

  const executeCommand = (cmdToRun) => {
    const rawCmd = cmdToRun !== undefined ? cmdToRun : inputVal;
    setInputVal('');
    setHistoryPointer(-1);

    const isCmdMode = terminalMode === 'cmd';

    if (!rawCmd.trim()) {
      setHistory(prev => [...prev, { type: 'prompt', branch: currentBranch, cmd: '', isCmdMode }]);
      return;
    }

    const trimmed = rawCmd.trim();
    setCommandHistory(prev => [...prev, trimmed]);
    setShowWelcomeBanner(false);

    if (trimmed === 'clear' || trimmed === 'cls') {
      setHistory([]);
      return;
    }

    // Add prompt line
    const promptEntry = { type: 'prompt', branch: currentBranch, cmd: trimmed, isCmdMode };

    if (!engine) {
      setHistory(prev => [...prev, promptEntry, { type: 'error', text: 'Virtual engine not ready.' }]);
      return;
    }

    const result = engine.execute(trimmed);

    // If command triggers Vim
    if (result.openVim) {
      const targetFile = result.file || 'README.md';
      if (engine.files && engine.files[targetFile] === undefined) {
        if (engine.writeFile) engine.writeFile(targetFile, '');
      }
      setVimCurrentFile(targetFile);
      setVimContent(engine.readFile ? (engine.readFile(targetFile) || '') : '');
      setPreviousMode(terminalMode);
      setTerminalMode('vim');
      setVimMode('NORMAL');
      setHistory(prev => [
        ...prev, 
        promptEntry, 
        { type: 'system', text: `Opened interactive Vim editor for ${targetFile}` }
      ]);
      return;
    }

    if (result.clear) {
      setHistory([]);
      return;
    }

    const newEntries = [promptEntry];
    if (result.output) {
      newEntries.push({
        type: result.error ? 'error' : 'output',
        text: result.output
      });
    }

    setHistory(prev => [...prev, ...newEntries]);

    if (onCommandExecuted) {
      onCommandExecuted(trimmed, result);
    }
  };

  const handleClear = () => {
    setHistory([]);
    inputRef.current?.focus();
  };

  // ── Vim Actions ──
  const handleVimSave = (showToast = true) => {
    if (!engine || !vimCurrentFile) return;
    if (engine.writeFile) {
      engine.writeFile(vimCurrentFile, vimContent);
    } else if (engine.files) {
      engine.files[vimCurrentFile] = vimContent;
    }

    const lineCount = vimContent.split('\n').length;
    const byteCount = vimContent.length;
    const msg = `"${vimCurrentFile}" ${lineCount}L, ${byteCount}B written`;
    setVimStatusMsg(msg);

    if (onCommandExecuted) {
      onCommandExecuted(`vim ${vimCurrentFile}`, { 
        output: msg, 
        error: false 
      });
    }
  };

  const handleVimSaveAndExit = () => {
    handleVimSave(false);
    const lineCount = vimContent.split('\n').length;
    const byteCount = vimContent.length;
    setHistory(prev => [
      ...prev,
      { type: 'system', text: `[Vim] "${vimCurrentFile}" ${lineCount}L, ${byteCount}B written and saved.` }
    ]);
    setTerminalMode(previousMode || 'shell');
  };

  const handleVimExit = () => {
    setHistory(prev => [
      ...prev,
      { type: 'system', text: `[Vim] Closed buffer without changes.` }
    ]);
    setTerminalMode(previousMode || 'shell');
  };

  const handleVimCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = vimCommandLine.trim();
    setVimCommandLine('');
    setVimMode('NORMAL');

    if (cmd === 'w' || cmd === ':w') {
      handleVimSave();
    } else if (cmd === 'wq' || cmd === ':wq' || cmd === 'x' || cmd === ':x') {
      handleVimSaveAndExit();
    } else if (cmd === 'q' || cmd === ':q' || cmd === 'q!' || cmd === ':q!') {
      handleVimExit();
    } else {
      setVimStatusMsg(`E492: Not an editor command: ${cmd}`);
    }
  };

  const handleCreateNewFile = (e) => {
    e.preventDefault();
    const fname = newFileName.trim();
    if (!fname) return;

    if (engine) {
      if (engine.writeFile) engine.writeFile(fname, '');
      else if (engine.files) engine.files[fname] = '';
    }
    setVimCurrentFile(fname);
    setVimContent('');
    setNewFileName('');
    setShowNewFileInput(false);
    setVimStatusMsg(`"${fname}" [New File]`);
    if (onCommandExecuted) {
      onCommandExecuted(`touch ${fname}`, { output: '', error: false });
    }
  };

  const allRepoFiles = Object.keys(engine?.files || {});

  return (
    <div
      onClick={handleContainerClick}
      className={`bg-[#0c1017] text-slate-100 font-mono text-xs flex flex-col overflow-hidden w-full h-full rounded-none border-0 ${className}`}
    >
      {/* ── Terminal Header Bar (Light Frame Header Matching SQL Editor) ── */}
      <div className="h-10 bg-slate-100/90 px-4 border-b border-slate-200 flex items-center justify-between select-none shrink-0 gap-2">
        
        {/* Left: Indicator dot + Current directory */}
        <div className="flex items-center space-x-2 overflow-hidden">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-xs font-mono font-bold text-slate-700 truncate">
            {terminalMode === 'cmd' ? 'C:\\playground' : '~/playground'}
          </span>
        </div>

        {/* Right: Environment Mode Switcher (Shell / CMD / Vim) + Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Segmented Mode Switcher */}
          <div className="bg-white p-0.5 rounded-lg border border-slate-200 flex items-center gap-1 shadow-2xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSwitchMode('shell');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                terminalMode === 'shell'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Switch to Bash / POSIX Shell"
            >
              <Terminal size={11} />
              <span>Shell</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSwitchMode('cmd');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                terminalMode === 'cmd'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Switch to Windows Command Prompt"
            >
              <SquareCode size={11} />
              <span>CMD</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSwitchMode('vim');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                terminalMode === 'vim'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Switch to Interactive Vim File Editor"
            >
              <FileCode size={11} />
              <span>Vim</span>
            </button>
          </div>

          {/* Quick Help & Clear Action Icons */}
          {terminalMode !== 'vim' && (
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  executeCommand('git --help');
                }}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Git Help"
              >
                <HelpCircle size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Clear Output"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          VIEW 1 & 2: GENUINE TERMINAL STYLE (INLINE PROMPT, NO EXTRA SPACE)
          ══════════════════════════════════════════════════════════ */}
      {terminalMode !== 'vim' && (
        <div 
          ref={terminalBodyRef} 
          className="p-4 flex-1 overflow-y-auto space-y-1.5 min-h-[160px] bg-[#0c1017] text-slate-200 font-mono text-xs leading-relaxed selection:bg-blue-600/40 cursor-text select-text"
        >
          {history.map((item, idx) => {
            // System Welcome / Warning Message (shown for few seconds then hidden)
            if (item.type === 'system') {
              if (!showWelcomeBanner) return null;
              const lines = item.text.split('\n');
              return (
                <div key={idx} className="bg-[#121824] border border-slate-800 rounded-lg p-3 space-y-1 text-slate-300 mb-2 relative transition-all">
                  <button
                    onClick={() => setShowWelcomeBanner(false)}
                    className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                    title="Dismiss"
                  >
                    <X size={13} />
                  </button>
                  {lines.map((line, lIdx) => {
                    if (line.includes('Note:') || line.includes('▲ Note:')) {
                      return (
                        <div key={lIdx} className="text-amber-300 bg-amber-950/40 border border-amber-600/30 rounded p-1.5 font-medium flex items-start gap-1.5 mt-1 text-[11px]">
                          <span>{line}</span>
                        </div>
                      );
                    }
                    if (lIdx === 0) {
                      return <div key={lIdx} className="text-white font-bold text-xs pr-6">{line}</div>;
                    }
                    return <div key={lIdx} className="text-slate-400 text-xs">{line}</div>;
                  })}
                </div>
              );
            }

            // Command prompt row
            if (item.type === 'prompt') {
              return (
                <div key={idx} className="flex items-center flex-wrap gap-1.5 pt-0.5 font-mono">
                  {item.isCmdMode ? (
                    <span className="text-sky-400 font-bold select-none">C:\Users\student\project&gt;</span>
                  ) : (
                    <span className="text-emerald-400 font-bold select-none">$</span>
                  )}
                  <span className="text-white font-bold ml-1">{item.cmd}</span>
                </div>
              );
            }

            // Error row
            if (item.type === 'error') {
              return (
                <div key={idx} className="text-rose-400 bg-rose-950/20 border-l-2 border-rose-500 pl-2.5 py-1 whitespace-pre-wrap leading-relaxed font-mono">
                  {item.text}
                </div>
              );
            }

            // Standard output lines
            const formattedLines = item.text.split('\n').map((line, lIdx) => {
              let textColor = 'text-slate-300';
              if (
                line.includes('Initialized empty Git') || 
                line.includes('Reinitialized existing Git') || 
                line.includes('Switched to branch') || 
                line.includes('On branch')
              ) {
                textColor = 'text-sky-300 font-bold';
              } else if (line.includes('new file:') || line.includes('Fast-forward') || line.startsWith('+')) {
                textColor = 'text-emerald-400 font-bold';
              } else if (line.includes('deleted:') || line.startsWith('-') || line.includes('error:') || line.includes('fatal:') || line.includes('CONFLICT')) {
                textColor = 'text-rose-400 font-bold bg-rose-950/30 px-1 rounded';
              } else if (line.includes('modified:') || line.includes('commit ')) {
                textColor = 'text-amber-300 font-bold';
              }

              return (
                <div key={lIdx} className={`${textColor} whitespace-pre-wrap leading-relaxed`}>
                  {line}
                </div>
              );
            });

            return (
              <div key={idx} className="pl-1 py-0.5 space-y-0.5">
                {formattedLines}
              </div>
            );
          })}

          {/* Genuine Terminal Style Inline Prompt Line (No Extra Space Box!) */}
          <div className="flex items-center flex-wrap gap-1.5 pt-1 font-mono">
            {terminalMode === 'cmd' ? (
              <span className="text-sky-400 font-bold select-none">C:\Users\student\project&gt;</span>
            ) : (
              <span className="text-emerald-400 font-bold select-none">$</span>
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className="flex-1 min-w-[180px] bg-transparent text-white outline-none border-none font-mono text-xs focus:ring-0 focus:outline-none p-0 caret-emerald-400 ml-1"
            />
          </div>

          <div ref={terminalEndRef} />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          VIEW 3: INTERACTIVE VIM FILE EDITOR
          ══════════════════════════════════════════════════════════ */}
      {terminalMode === 'vim' && (
        <div className="flex-1 flex flex-col bg-[#0c1017] overflow-hidden min-h-0 select-text">
          
          {/* Vim File Tabs & Action Bar */}
          <div className="bg-[#121824] border-b border-slate-800 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0 select-none">
            
            {/* Repository Files Tab List */}
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              {allRepoFiles.length === 0 ? (
                <span className="text-[10px] text-slate-500 italic px-2">No files in repository</span>
              ) : (
                allRepoFiles.map((file) => (
                  <button
                    key={file}
                    onClick={() => {
                      if (file !== vimCurrentFile) {
                        setVimCurrentFile(file);
                        setVimContent(engine?.readFile ? (engine.readFile(file) || '') : (engine?.files?.[file] || ''));
                        setVimStatusMsg(`"${file}" loaded`);
                        setVimMode('NORMAL');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      vimCurrentFile === file
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <FileText size={10} />
                    <span>{file}</span>
                  </button>
                ))
              )}

              {/* Add New File Button */}
              {showNewFileInput ? (
                <form onSubmit={handleCreateNewFile} className="flex items-center space-x-1 shrink-0">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="filename.ext"
                    autoFocus
                    className="bg-[#0c1017] border border-blue-500 text-white px-2 py-0.5 rounded text-[10px] font-mono outline-none w-28"
                  />
                  <button
                    type="submit"
                    className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] cursor-pointer"
                  >
                    <Check size={10} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewFileInput(false)}
                    className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowNewFileInput(true)}
                  className="px-2 py-0.5 rounded-lg text-[10px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  title="Create new file in working directory"
                >
                  <Plus size={11} />
                  <span>New File</span>
                </button>
              )}
            </div>

            {/* Vim Action Buttons (:w, :wq, :q) */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={() => handleVimSave(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Save buffer (:w)"
              >
                <Save size={10} />
                <span>:w Save</span>
              </button>

              <button
                onClick={handleVimSaveAndExit}
                className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Save buffer and return to terminal (:wq)"
              >
                <CheckCircle2 size={10} />
                <span>:wq Save & Exit</span>
              </button>

              <button
                onClick={handleVimExit}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Close buffer without saving (:q)"
              >
                <X size={10} />
                <span>:q Exit</span>
              </button>
            </div>
          </div>

          {/* Vim Editor Gutter & Text Area */}
          <div className="flex-1 flex overflow-hidden min-h-0 bg-[#0c1017]">
            
            {/* Line Number Gutter */}
            <div className="w-11 bg-[#121824] border-r border-slate-800 py-3 select-none text-right pr-2.5 text-slate-500 font-mono text-xs leading-6 shrink-0">
              {vimContent.split('\n').map((_, lIdx) => (
                <div key={lIdx} className="hover:text-slate-300">
                  {lIdx + 1}
                </div>
              ))}
              {Array.from({ length: Math.max(2, 14 - vimContent.split('\n').length) }).map((_, tIdx) => (
                <div key={`tilde-${tIdx}`} className="text-slate-700 select-none">
                  ~
                </div>
              ))}
            </div>

            {/* Editable Text Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
              <textarea
                ref={vimTextareaRef}
                value={vimContent}
                onChange={(e) => {
                  setVimContent(e.target.value);
                  if (vimMode === 'NORMAL') setVimMode('INSERT');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setVimMode('NORMAL');
                    return;
                  }

                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = e.target.selectionStart;
                    const end = e.target.selectionEnd;
                    const updated = vimContent.substring(0, start) + '  ' + vimContent.substring(end);
                    setVimContent(updated);
                    setTimeout(() => {
                      if (vimTextareaRef.current) {
                        vimTextareaRef.current.selectionStart = vimTextareaRef.current.selectionEnd = start + 2;
                      }
                    }, 0);
                  }
                }}
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="flex-1 w-full h-full bg-[#0c1017] text-slate-100 font-mono text-xs p-3 leading-6 outline-none resize-none border-none caret-emerald-400 selection:bg-blue-900/60 overflow-y-auto"
                placeholder="Type file contents here... Press Esc for NORMAL mode, type :w or :wq to save."
              />
            </div>
          </div>

          {/* Vim Command Input Bar */}
          {vimMode === 'COMMAND' && (
            <form onSubmit={handleVimCommandSubmit} className="bg-[#121824] border-t border-slate-800 px-4 py-1.5 flex items-center space-x-2 shrink-0">
              <span className="text-amber-400 font-bold">:</span>
              <input
                ref={vimCommandInputRef}
                type="text"
                value={vimCommandLine}
                onChange={(e) => setVimCommandLine(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setVimMode('NORMAL');
                    setVimCommandLine('');
                  }
                }}
                autoFocus
                placeholder="w, wq, q, q!"
                className="flex-1 bg-transparent text-white outline-none font-mono text-xs caret-amber-400"
              />
            </form>
          )}

          {/* Vim Statusline Bar */}
          <div className="bg-[#121824] border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] font-mono select-none shrink-0">
            
            {/* Mode Indicator & File Status */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setVimMode(vimMode === 'INSERT' ? 'NORMAL' : 'INSERT')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer border ${
                  vimMode === 'INSERT'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                    : vimMode === 'COMMAND'
                    ? 'bg-blue-500 text-white border-blue-400 font-bold'
                    : 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                }`}
              >
                -- {vimMode} --
              </button>

              <span className="text-slate-300 text-[11px] font-medium">
                {vimStatusMsg || `"${vimCurrentFile}"`}
              </span>
            </div>

            {/* Quick Keyboard Helpers */}
            <div className="hidden sm:flex items-center space-x-3 text-[10px] text-slate-400">
              <span><kbd className="px-1 py-0.2 bg-[#0c1017] border border-slate-700 rounded text-slate-300 font-mono">i</kbd> Insert</span>
              <span><kbd className="px-1 py-0.2 bg-[#0c1017] border border-slate-700 rounded text-slate-300 font-mono">Esc</kbd> Normal</span>
              <span><kbd className="px-1 py-0.2 bg-[#0c1017] border border-slate-700 rounded text-slate-300 font-mono">:w</kbd> Save</span>
              <span><kbd className="px-1 py-0.2 bg-[#0c1017] border border-slate-700 rounded text-slate-300 font-mono">:wq</kbd> Exit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
