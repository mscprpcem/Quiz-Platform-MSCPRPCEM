import React, { useState, useEffect, useRef } from 'react';
import { Settings, Lightbulb, Tag, Code2, CheckSquare, X, SlidersHorizontal } from 'lucide-react';

const STORAGE_KEY = 'msc_lab_settings';

export const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (_) {}
  return {
    showHints: true,
    showTags: true,
    showCheatSheet: true,
    showObjectives: true,
  };
};

function ToggleSwitch({ enabled, onChange, label, isDarkMode = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={enabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      style={{
        width: '44px',
        height: '24px',
        minWidth: '44px',
        minHeight: '24px',
        maxWidth: '44px',
        maxHeight: '24px',
        borderRadius: '12px',
        padding: '3px',
        backgroundColor: enabled ? '#2563EB' : (isDarkMode ? '#334155' : '#E2E8F0'),
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        boxSizing: 'border-box',
        position: 'relative',
        flexShrink: 0,
        transition: 'background-color 0.2s ease',
      }}
    >
      <span
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transform: enabled ? 'translateX(20px)' : 'translateX(0px)',
          transition: 'transform 0.2s ease',
          display: 'block',
          pointerEvents: 'none',
        }}
      />
    </button>
  );
}

export default function LabSettingsDropdown({ settings, onSettingsChange, isDarkMode = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (key) => {
    const next = {
      ...settings,
      [key]: !settings[key]
    };
    onSettingsChange(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (_) {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Gear Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          isOpen
            ? isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-slate-200 text-blue-600'
            : isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Display Settings"
      >
        <Settings size={16} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border p-3.5 z-50 animate-scale-up select-none ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs font-bold tracking-tight">
              <SlidersHorizontal size={13} className="text-blue-600" />
              <span>Display Settings</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer transition-colors"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Toggle List */}
          <div className="space-y-1">
            {/* Toggle: Hints */}
            <div
              onClick={() => handleToggle('showHints')}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0">
                  <Lightbulb size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Step Hints</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Hints tab & clues</div>
                </div>
              </div>
              <ToggleSwitch
                label="Step Hints"
                enabled={Boolean(settings.showHints)}
                onChange={() => handleToggle('showHints')}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Toggle: Tags */}
            <div
              onClick={() => handleToggle('showTags')}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center shrink-0">
                  <Tag size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Topic Tags</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Categories & keywords</div>
                </div>
              </div>
              <ToggleSwitch
                label="Topic Tags"
                enabled={Boolean(settings.showTags)}
                onChange={() => handleToggle('showTags')}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Toggle: Cheat Sheet & Explanations */}
            <div
              onClick={() => handleToggle('showCheatSheet')}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center shrink-0">
                  <Code2 size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Cheat Sheet</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Explanations & reference</div>
                </div>
              </div>
              <ToggleSwitch
                label="Cheat Sheet"
                enabled={Boolean(settings.showCheatSheet)}
                onChange={() => handleToggle('showCheatSheet')}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Toggle: Objectives */}
            <div
              onClick={() => handleToggle('showObjectives')}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center shrink-0">
                  <CheckSquare size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Objectives</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Milestone checklist</div>
                </div>
              </div>
              <ToggleSwitch
                label="Objectives"
                enabled={Boolean(settings.showObjectives)}
                onChange={() => handleToggle('showObjectives')}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
