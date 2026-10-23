import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, CornerDownLeft, Sparkles } from 'lucide-react';

export default function GitTerminal({
  engine,
  onCommandExecuted,
  className = '',
  initialMessage = 'Welcome to the MSC Virtual Git Lab Terminal. Type `help` or `git status` to begin.'
}) {
  const [history, setHistory] = useState([
    { type: 'system', text: initialMessage }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom whenever history changes
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Keep focus on input when clicking terminal container
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const currentBranch = engine ? engine.getHeadBranch() : 'main';

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
      executeCommand();
    }
  };

  const handleTabComplete = () => {
    const val = inputVal.trim();
    if (!val) return;

    const commonGitSubcommands = [
      'init', 'status', 'add', 'rm', 'commit', 'branch', 'checkout', 'switch',
      'log', 'diff', 'merge', 'rebase', 'stash', 'reset', 'revert', 'cherry-pick',
      'remote', 'push', 'pull', 'fetch', 'tag', 'reflog', 'restore'
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

  const executeCommand = () => {
    const rawCmd = inputVal;
    setInputVal('');
    setHistoryPointer(-1);

    if (!rawCmd.trim()) {
      setHistory(prev => [...prev, { type: 'prompt', branch: currentBranch, cmd: '' }]);
      return;
    }

    const trimmed = rawCmd.trim();
    setCommandHistory(prev => [...prev, trimmed]);

    if (trimmed === 'clear') {
      setHistory([]);
      return;
    }

    // Add prompt line
    const promptEntry = { type: 'prompt', branch: currentBranch, cmd: trimmed };

    if (!engine) {
      setHistory(prev => [...prev, promptEntry, { type: 'error', text: 'Virtual engine not ready.' }]);
      return;
    }

    const result = engine.execute(trimmed);

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

  return (
    <div
      onClick={handleContainerClick}
      className={`bg-slate-950 text-slate-100 font-mono text-xs rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden ${className}`}
    >
      {/* Terminal Title Bar */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 pl-2 flex items-center gap-1.5">
            <Terminal size={12} className="text-blue-400" />
            student@msc-repo: ~/project ({currentBranch})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleClear}
            className="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="Clear terminal output"
          >
            <Trash2 size={11} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Log Area */}
      <div className="p-4 flex-1 overflow-y-auto space-y-1.5 max-h-[380px] min-h-[220px]">
        {history.map((item, idx) => {
          if (item.type === 'system') {
            return (
              <div key={idx} className="text-slate-400 leading-relaxed pb-1 text-[11px]">
                {item.text}
              </div>
            );
          }

          if (item.type === 'prompt') {
            return (
              <div key={idx} className="flex items-center flex-wrap gap-1.5 text-slate-200 pt-1">
                <span className="text-emerald-400 font-bold">student@msc-repo</span>
                <span className="text-slate-500">:</span>
                <span className="text-blue-400 font-semibold">~/project</span>
                <span className="text-cyan-400 font-bold text-[11px]">({item.branch})</span>
                <span className="text-slate-400">$</span>
                <span className="text-slate-100 font-bold ml-1">{item.cmd}</span>
              </div>
            );
          }

          if (item.type === 'error') {
            return (
              <div key={idx} className="text-rose-400 whitespace-pre-wrap leading-relaxed pl-2 border-l border-rose-500/40">
                {item.text}
              </div>
            );
          }

          // Format output lines with colors
          const formattedLines = item.text.split('\n').map((line, lIdx) => {
            let textColor = 'text-slate-300';
            if (line.includes('new file:') || line.includes('Fast-forward') || line.startsWith('+')) {
              textColor = 'text-emerald-400 font-medium';
            } else if (line.includes('modified:') || line.startsWith('-')) {
              textColor = 'text-rose-400';
            } else if (line.includes('CONFLICT') || line.includes('error:') || line.includes('fatal:')) {
              textColor = 'text-amber-400 font-bold';
            } else if (line.includes('commit ') || line.startsWith('* [new branch]')) {
              textColor = 'text-amber-300 font-medium';
            } else if (line.includes('On branch')) {
              textColor = 'text-cyan-400 font-bold';
            }

            return (
              <div key={lIdx} className={`${textColor} whitespace-pre-wrap leading-relaxed`}>
                {line}
              </div>
            );
          });

          return (
            <div key={idx} className="pl-1 py-0.5">
              {formattedLines}
            </div>
          );
        })}

        {/* Active Command Line Input */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          <span className="text-emerald-400 font-bold">student@msc-repo</span>
          <span className="text-slate-500">:</span>
          <span className="text-blue-400 font-semibold">~/project</span>
          <span className="text-cyan-400 font-bold text-[11px]">({currentBranch})</span>
          <span className="text-slate-400">$</span>
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
            className="flex-1 bg-transparent text-slate-100 outline-none border-none font-mono text-xs ml-1 focus:ring-0 p-0"
            placeholder="Type git command... (e.g. git status)"
          />
        </div>

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Footer Quick Bar */}
      <div className="bg-slate-900/60 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">Tab</kbd> Complete
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">↑/↓</kbd> History
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-[10px]">
          <span>MSC Virtual Engine v1.0</span>
        </div>
      </div>
    </div>
  );
}
