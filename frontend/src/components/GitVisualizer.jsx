import React, { useState } from 'react';
import { GitBranch, GitCommit, Layers, FileText, CheckCircle2, AlertCircle, Clock, ShieldCheck, Tag, ArrowRight } from 'lucide-react';

export default function GitVisualizer({ engine, className = '' }) {
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [activeView, setActiveView] = useState('graph'); // 'graph' | 'staging'

  if (!engine) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 font-mono text-xs">
        Initializing repository visualizer...
      </div>
    );
  }

  const isInitialized = engine.isInitialized();
  const commits = engine.getAllCommits();
  const branches = engine.getBranches();
  const currentBranch = engine.getHeadBranch();
  const headCommitId = engine.getHeadCommitId();
  const tags = engine.getTags();
  const files = engine.files || {};
  const index = engine.index || {};
  const headCommit = engine.getLatestCommit();
  const headFiles = headCommit ? headCommit.files : {};

  // Build branch map by commit ID: { [commitId]: [branchNames] }
  const commitBranchMap = {};
  Object.keys(branches).forEach(bName => {
    const cId = branches[bName];
    if (cId) {
      if (!commitBranchMap[cId]) commitBranchMap[cId] = [];
      commitBranchMap[cId].push(bName);
    }
  });

  // Build tag map by commit ID: { [commitId]: [tagNames] }
  const commitTagMap = {};
  Object.keys(tags).forEach(tName => {
    const tData = tags[tName];
    if (tData && tData.commitId) {
      if (!commitTagMap[tData.commitId]) commitTagMap[tData.commitId] = [];
      commitTagMap[tData.commitId].push(tName);
    }
  });

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden text-slate-200 font-sans ${className}`}>
      {/* Visualizer Header */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitBranch size={15} className="text-blue-400" />
          <span className="text-xs font-bold text-slate-100">Repository State Visualizer</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold">
            HEAD ➔ {currentBranch}
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setActiveView('graph')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              activeView === 'graph' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit size={12} />
            <span>Commit Graph</span>
          </button>
          <button
            onClick={() => setActiveView('staging')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              activeView === 'staging' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={12} />
            <span>3 Trees Inspector</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 overflow-x-auto min-h-[200px] max-h-[360px] overflow-y-auto">
        {!isInitialized ? (
          <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
            <AlertCircle size={28} className="text-amber-400" />
            <p className="text-xs font-bold text-slate-300">Repository Not Initialized</p>
            <p className="text-[11px] text-slate-500 max-w-sm">
              Run <code className="px-1.5 py-0.5 bg-slate-800 text-emerald-400 rounded">git init</code> in the terminal to initialize Git tracking.
            </p>
          </div>
        ) : activeView === 'graph' ? (
          /* Graph View */
          <div className="space-y-4">
            {commits.length === 0 ? (
              <div className="min-h-[150px] flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                <GitCommit size={26} className="text-blue-400 animate-pulse" />
                <p className="text-xs font-bold text-slate-300">No Commits Yet</p>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Stage your files with <code className="px-1.5 py-0.5 bg-slate-800 text-emerald-400 rounded">git add</code> and record your first commit with <code className="px-1.5 py-0.5 bg-slate-800 text-emerald-400 rounded">git commit -m "..."</code>.
                </p>
              </div>
            ) : (
              <div className="relative pt-2 pb-4">
                {/* Visual Linear Node Track */}
                <div className="flex items-center space-x-6 min-w-max px-2">
                  {commits.map((c, idx) => {
                    const isHead = c.id === headCommitId;
                    const assignedBranches = commitBranchMap[c.id] || [];
                    const assignedTags = commitTagMap[c.id] || [];
                    const isSelected = selectedCommit?.id === c.id;

                    return (
                      <div key={c.id || idx} className="flex items-center">
                        {/* Commit Node Card */}
                        <div
                          onClick={() => setSelectedCommit(c)}
                          className={`flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:scale-105 ${
                            isSelected ? 'scale-105' : ''
                          }`}
                        >
                          {/* Badges Container (Branches, Tags & HEAD) */}
                          <div className="flex flex-col items-center space-y-1 mb-2">
                            {isHead && (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-black flex items-center gap-1 shadow-xs animate-bounce">
                                HEAD
                              </span>
                            )}
                            {assignedBranches.map(b => (
                              <span
                                key={b}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-1 border shadow-xs ${
                                  b === currentBranch
                                    ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                                    : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                                }`}
                              >
                                <GitBranch size={9} />
                                {b}
                              </span>
                            ))}
                            {assignedTags.map(t => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold flex items-center gap-1 shadow-xs"
                              >
                                <Tag size={8} />
                                {t}
                              </span>
                            ))}
                          </div>

                          {/* Node Circle */}
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-[11px] shadow-lg transition-all ${
                              isHead
                                ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white ring-4 ring-cyan-500/20 ring-offset-2 ring-offset-slate-900'
                                : 'bg-slate-800 text-slate-200 border-2 border-slate-700 hover:border-blue-400'
                            }`}
                          >
                            <GitCommit size={15} />
                          </div>

                          {/* Commit Hash and Message */}
                          <div className="mt-2 text-center max-w-[110px]">
                            <span className="text-[10px] font-mono font-bold text-amber-400 block">{c.id}</span>
                            <span className="text-[10px] text-slate-400 truncate block font-medium" title={c.message}>
                              {c.message}
                            </span>
                          </div>
                        </div>

                        {/* Connector Arrow to Next Commit */}
                        {idx < commits.length - 1 && (
                          <div className="w-8 h-0.5 bg-slate-700 mx-1 relative flex items-center justify-center">
                            <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-slate-500 rotate-45 transform ml-1" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Selected Commit Detail Inspector */}
                {selectedCommit && (
                  <div className="mt-4 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 animate-fade-in text-xs">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">commit {selectedCommit.id}</span>
                          {selectedCommit.parentIds?.length > 1 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                              Merge Commit ({selectedCommit.parentIds.join(', ')})
                            </span>
                          )}
                        </div>
                        <p className="text-slate-100 font-bold mt-0.5">{selectedCommit.message}</p>
                      </div>
                      <button
                        onClick={() => setSelectedCommit(null)}
                        className="text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Author</span>
                        <span className="text-slate-300 font-mono">{selectedCommit.author}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Date</span>
                        <span className="text-slate-300 font-mono">{new Date(selectedCommit.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Files in Commit */}
                    <div>
                      <span className="text-slate-500 block text-[10px] mb-1 font-bold uppercase tracking-wider">Snapshot Files</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.keys(selectedCommit.files || {}).map(f => (
                          <span key={f} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[10px] font-mono flex items-center gap-1">
                            <FileText size={10} className="text-blue-400" />
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* 3 Trees Inspector View */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Column 1: Working Tree */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-[11px] font-extrabold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Working Directory
                </span>
                <span className="text-[10px] font-mono text-slate-500">{Object.keys(files).length} files</span>
              </div>
              <div className="space-y-1 max-h-[180px] overflow-y-auto">
                {Object.keys(files).length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">Empty directory</p>
                ) : (
                  Object.keys(files).map(f => {
                    const isIgnored = engine.isIgnored(f);
                    const isStaged = index[f] !== undefined;
                    const isCommitted = headFiles[f] !== undefined;
                    let tagText = 'Untracked';
                    let tagColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                    if (isIgnored) {
                      tagText = 'Ignored';
                      tagColor = 'bg-slate-800 text-slate-400 border-slate-700';
                    } else if (isStaged) {
                      tagText = 'Staged';
                      tagColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    } else if (isCommitted) {
                      tagText = 'Tracked';
                      tagColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                    }

                    return (
                      <div key={f} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 text-[11px] font-mono">
                        <span className="truncate max-w-[110px]" title={f}>{f}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${tagColor}`}>{tagText}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 2: Staging Area (Index) */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-[11px] font-extrabold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Staging Area (Index)
                </span>
                <span className="text-[10px] font-mono text-slate-500">{Object.keys(index).length} staged</span>
              </div>
              <div className="space-y-1 max-h-[180px] overflow-y-auto">
                {Object.keys(index).length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No files staged (run git add)</p>
                ) : (
                  Object.keys(index).map(f => (
                    <div key={f} className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] font-mono">
                      <span className="truncate max-w-[110px] text-emerald-300" title={f}>{f}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Ready</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: HEAD Commit Snapshot */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-[11px] font-extrabold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  HEAD Commit
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{headCommitId || 'None'}</span>
              </div>
              <div className="space-y-1 max-h-[180px] overflow-y-auto">
                {Object.keys(headFiles).length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No committed files yet</p>
                ) : (
                  Object.keys(headFiles).map(f => (
                    <div key={f} className="flex items-center justify-between p-1.5 rounded-lg bg-blue-950/30 border border-blue-500/20 text-[11px] font-mono">
                      <span className="truncate max-w-[110px] text-blue-300" title={f}>{f}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Committed</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
