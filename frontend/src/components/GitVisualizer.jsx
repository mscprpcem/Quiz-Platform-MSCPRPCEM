import React, { useState } from 'react';
import { GitBranch, GitCommit, Layers, FileText, CheckCircle2, AlertCircle, Clock, ShieldCheck, Tag, ArrowRight, X } from 'lucide-react';

export default function GitVisualizer({ engine, className = '' }) {
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [activeView, setActiveView] = useState('graph'); // 'graph' | 'staging'

  if (!engine) {
    return (
      <div className="bg-slate-50 p-6 text-center text-slate-500 font-mono text-xs w-full">
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
    <div className={`bg-white flex flex-col overflow-hidden text-slate-800 font-sans w-full h-full rounded-none border-0 ${className}`}>
      {/* Visualizer Header Bar (Clean Light Theme, Same as SQL Editor) */}
      <div className="h-10 bg-slate-100/90 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-2">
          <GitBranch size={14} className="text-blue-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700 tracking-tight">Repository State</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
            HEAD -&gt; {currentBranch}
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold shadow-2xs">
          <button
            onClick={() => setActiveView('graph')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'graph' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GitCommit size={12} />
            <span>Commit Graph</span>
          </button>
          <button
            onClick={() => setActiveView('staging')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'staging' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers size={12} />
            <span>3 Trees Inspector</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 overflow-x-auto overflow-y-auto bg-white min-h-0 select-text">
        {!isInitialized ? (
          <div className="py-6 flex items-center justify-center text-center space-x-3 text-slate-500">
            <AlertCircle size={22} className="text-amber-500 shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 block">Repository Not Initialized</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Initialize the repository in the terminal (git init) to begin tracking history.
              </p>
            </div>
          </div>
        ) : activeView === 'graph' ? (
          /* Graph View */
          <div className="space-y-4">
            {commits.length === 0 ? (
              <div className="py-6 flex items-center justify-center text-center space-x-3 text-slate-500">
                <GitCommit size={22} className="text-blue-500 shrink-0 animate-pulse" />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 block">No Commits Recorded</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Stage modified files and create an initial commit snapshot.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative pt-1 pb-1">
                {/* Visual Linear Node Track (Continuous connected commit graph rail) */}
                <div className="flex items-center min-w-max px-3 py-2">
                  {commits.map((c, idx) => {
                    const isHead = c.id === headCommitId;
                    const assignedBranches = commitBranchMap[c.id] || [];
                    const assignedTags = commitTagMap[c.id] || [];
                    const isSelected = selectedCommit?.id === c.id;
                    const hasBadges = isHead || assignedBranches.length > 0 || assignedTags.length > 0;

                    return (
                      <div
                        key={c.id || idx}
                        onClick={() => setSelectedCommit(c)}
                        className="w-24 flex flex-col items-center group cursor-pointer relative select-none"
                      >
                        {/* Row 1: Badges Area (Compact h-7, perfectly centered above circle) */}
                        <div className="h-7 w-full flex items-center justify-center relative z-20">
                          {hasBadges && (
                            <div className="flex items-center gap-1 max-w-full px-0.5">
                              {isHead && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-mono font-bold leading-none shadow-2xs">
                                  HEAD
                                </span>
                              )}
                              {assignedBranches.map(b => (
                                <span
                                  key={b}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold leading-none flex items-center gap-0.5 border shadow-2xs ${
                                    b === currentBranch
                                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  <GitBranch size={8} />
                                  {b}
                                </span>
                              ))}
                              {assignedTags.map(t => (
                                <span
                                  key={t}
                                  className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 text-[9px] font-mono font-bold leading-none flex items-center gap-0.5 shadow-2xs"
                                >
                                  <Tag size={7} />
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Row 2: Node Circle & Seamless Continuous Connecting Line */}
                        <div className="h-8 w-full flex items-center justify-center relative">
                          {/* Incoming Line from Left (starts at left edge of cell, runs to center) */}
                          {idx > 0 && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-[2px] bg-blue-400">
                              {/* Arrowhead pointing into left edge of circle (circle radius is 14px) */}
                              <div className="absolute right-[14px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-blue-500 rotate-45 transform" />
                            </div>
                          )}

                          {/* Outgoing Line to Right (starts at center, runs to right edge of cell) */}
                          {idx < commits.length - 1 && (
                            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-1/2 h-[2px] bg-blue-400" />
                          )}

                          {/* Commit Node Circle (Solid center node sitting on top of the line) */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center relative z-10 transition-all duration-150 ${
                              isHead
                                ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm border-2 border-white'
                                : isSelected
                                ? 'bg-blue-50 text-blue-700 border-2 border-blue-600 ring-2 ring-blue-300 shadow-xs'
                                : 'bg-white border-2 border-slate-400 group-hover:border-blue-500 group-hover:scale-110 shadow-xs'
                            }`}
                          >
                            {isHead ? (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            ) : isSelected ? (
                              <div className="w-2 h-2 rounded-full bg-blue-600" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-blue-500 transition-colors" />
                            )}
                          </div>
                        </div>

                        {/* Row 3: Commit Hash & Commit Message */}
                        <div className="mt-1 text-center w-full px-1">
                          <span className="text-[10px] font-mono font-bold text-slate-800 block truncate group-hover:text-blue-600 transition-colors">
                            {c.id}
                          </span>
                          <span className="text-[9px] text-slate-500 truncate block font-medium leading-tight mt-0.5" title={c.message}>
                            {c.message}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Commit Detail Inspector */}
                {selectedCommit && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">commit {selectedCommit.id}</span>
                          {selectedCommit.parentIds?.length > 1 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                              Merge Commit ({selectedCommit.parentIds.join(', ')})
                            </span>
                          )}
                        </div>
                        <p className="text-slate-900 font-bold mt-1 text-xs sm:text-sm">{selectedCommit.message}</p>
                      </div>
                      <button
                        onClick={() => setSelectedCommit(null)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
                        title="Close Inspector"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Author</span>
                        <span className="text-slate-800 font-mono">{selectedCommit.author}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Timestamp</span>
                        <span className="text-slate-800 font-mono">{new Date(selectedCommit.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Files in Commit */}
                    <div>
                      <span className="text-slate-500 block text-[10px] mb-1 font-bold uppercase tracking-wider">Snapshot Files</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.keys(selectedCommit.files || {}).map(f => (
                          <span key={f} className="px-2.5 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[10px] font-mono flex items-center gap-1.5 font-bold shadow-2xs">
                            <FileText size={10} className="text-blue-600" />
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
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Working Directory
                </span>
                <span className="text-[10px] font-mono text-slate-500">{Object.keys(files).length} files</span>
              </div>
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                {Object.keys(files).length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">Empty directory</p>
                ) : (
                  Object.keys(files).map(f => {
                    const isIgnored = engine.isIgnored(f);
                    const isStaged = index[f] !== undefined;
                    const isCommitted = headFiles[f] !== undefined;
                    let tagText = 'Untracked';
                    let tagColor = 'bg-rose-50 text-rose-700 border-rose-200';

                    if (isIgnored) {
                      tagText = 'Ignored';
                      tagColor = 'bg-slate-100 text-slate-600 border-slate-200';
                    } else if (isStaged) {
                      tagText = 'Staged';
                      tagColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
                    } else if (isCommitted) {
                      tagText = 'Tracked';
                      tagColor = 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
                    }

                    return (
                      <div key={f} className="flex items-center justify-between p-1.5 rounded-lg bg-white text-xs font-mono border border-slate-200 shadow-2xs">
                        <span className="truncate max-w-[120px] text-slate-800" title={f}>{f}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${tagColor}`}>{tagText}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 2: Staging Area (Index) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Staging Area (Index)
                </span>
                <span className="text-[10px] font-mono text-slate-500">{Object.keys(index).length} staged</span>
              </div>
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                {Object.keys(index).length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No files staged (run git add)</p>
                ) : (
                  Object.keys(index).map(f => (
                    <div key={f} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono shadow-2xs">
                      <span className="truncate max-w-[120px] text-amber-900 font-bold" title={f}>{f}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">Ready</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: HEAD Commit Snapshot */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  HEAD Commit
                </span>
                <span className="text-[10px] font-mono text-blue-700 font-bold">{headCommitId || 'None'}</span>
              </div>
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                {Object.keys(headFiles).length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No committed files yet</p>
                ) : (
                  Object.keys(headFiles).map(f => (
                    <div key={f} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono shadow-2xs">
                      <span className="truncate max-w-[120px] text-blue-900 font-bold" title={f}>{f}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">Committed</span>
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
