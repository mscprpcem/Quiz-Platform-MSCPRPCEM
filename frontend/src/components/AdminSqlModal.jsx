import React, { useState } from 'react';
import {
  X, CheckCircle2, AlertTriangle, Play, Database, Sparkles,
  Plus, Trash2, Code2, Layers, BookOpen, Clock, Lightbulb
} from 'lucide-react';
import { COMMON_SCHEMAS, saveCustomChallenge } from '../data/sqlChallenges';
import { executeSqlQuery } from '../services/sqlEngine';

export default function AdminSqlModal({ isOpen, onClose, onChallengeSaved, editingChallenge = null, isDarkMode = false }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState(editingChallenge?.title || '');
  const [moduleTitle, setModuleTitle] = useState(editingChallenge?.moduleTitle || '3. Relational JOINs (Placement Core)');
  const [difficulty, setDifficulty] = useState(editingChallenge?.difficulty || 'Medium');
  const [interviewFrequency, setInterviewFrequency] = useState(editingChallenge?.interviewFrequency || 'High (Campus Placement)');
  const [tagsInput, setTagsInput] = useState(editingChallenge?.tags ? editingChallenge.tags.join(', ') : 'JOIN, GROUP BY');
  const [schemaPreset, setSchemaPreset] = useState(editingChallenge?.schemaPreset || 'hrCompany');
  const [customSetupSql, setCustomSetupSql] = useState(editingChallenge?.setupSql || COMMON_SCHEMAS.hrCompany);
  const [description, setDescription] = useState(editingChallenge?.description?.trim() || '');
  const [starterSql, setStarterSql] = useState(editingChallenge?.starterSql?.trim() || '-- Write your query here\nSELECT ');
  const [expectedSql, setExpectedSql] = useState(editingChallenge?.expectedSql?.trim() || 'SELECT * FROM employees;');
  const [hint1, setHint1] = useState(editingChallenge?.hints?.[0] || '');
  const [hint2, setHint2] = useState(editingChallenge?.hints?.[1] || '');
  const [explanation, setExplanation] = useState(editingChallenge?.explanation?.trim() || '');

  // Testing the admin query inside the modal
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const activeSetupSql = schemaPreset === 'custom' ? customSetupSql : COMMON_SCHEMAS[schemaPreset];

  const handleTestQuery = async () => {
    if (!expectedSql.trim()) {
      setTestResult({ success: false, error: 'Please provide an Expected Solution SQL query to test.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await executeSqlQuery(activeSetupSql, expectedSql);
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a challenge title.');
      return;
    }
    if (!expectedSql.trim()) {
      alert('Please provide the canonical solution query (expected SQL).');
      return;
    }

    const newChallenge = {
      id: editingChallenge?.id || `sql-custom-${Date.now()}`,
      moduleId: 'custom-module',
      moduleTitle: moduleTitle || 'Custom Admin Challenges',
      title: title.trim(),
      difficulty,
      interviewFrequency: interviewFrequency.trim(),
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      schemaPreset,
      setupSql: activeSetupSql,
      description: description.trim() || 'Write an SQL query to solve the problem.',
      starterSql: starterSql.trim() || '-- Write your SQL query here\nSELECT ',
      expectedSql: expectedSql.trim(),
      checkOrder: true,
      hints: [hint1, hint2].filter(Boolean),
      explanation: explanation.trim() || 'This query produces the expected output by joining and filtering the relational tables.',
      isAdminCustom: true,
      createdAt: new Date().toISOString()
    };

    saveCustomChallenge(newChallenge);
    if (onChallengeSaved) onChallengeSaved(newChallenge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container */}
      <div className={`relative w-full max-w-3xl rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] ${
        isDarkMode ? 'bg-slate-900 border border-slate-800 text-slate-100' : 'bg-white border border-slate-200 text-slate-800'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isDarkMode ? 'border-slate-800 bg-slate-850' : 'border-slate-200 bg-slate-50/80'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-base font-black">
                {editingChallenge ? 'Edit SQL Challenge' : 'Create New SQL Challenge'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Set question prompt, choose relational schema, and define canonical answer for automated grading
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          
          {/* Row 1: Title, Category, Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Challenge Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Total Revenue by Customer in 2024"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Basic">Basic</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>
          </div>

          {/* Row 2: Module Title & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Category Module</label>
              <select
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="1. Basic Filtering & Sorting">1. Basic Filtering & Sorting</option>
                <option value="2. Aggregations & GROUP BY / HAVING">2. Aggregations & GROUP BY / HAVING</option>
                <option value="3. Relational JOINs (Placement Core)">3. Relational JOINs (Placement Core)</option>
                <option value="4. Subqueries & LeetCode Classics">4. Subqueries & LeetCode Classics</option>
                <option value="Custom Placement Challenges">Custom Placement Challenges</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Interview Frequency / Tag</label>
              <input
                type="text"
                value={interviewFrequency}
                onChange={(e) => setInterviewFrequency(e.target.value)}
                placeholder="e.g. Amazon, TCS NQT, LeetCode 184"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Database Schema Preset Selector */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Database Schema (Mock Tables)</span>
              <span className="text-[11px] text-blue-600 font-semibold">Live Sandbox Environment</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSchemaPreset('hrCompany')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  schemaPreset === 'hrCompany'
                    ? 'border-blue-500 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/20 font-bold'
                    : isDarkMode ? 'border-slate-800 bg-slate-850 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">🏢 HR & Org Schema</div>
                <div className="text-[10px] text-slate-500 mt-0.5">employees, departments, projects</div>
              </button>

              <button
                type="button"
                onClick={() => setSchemaPreset('ecommerce')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  schemaPreset === 'ecommerce'
                    ? 'border-blue-500 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/20 font-bold'
                    : isDarkMode ? 'border-slate-800 bg-slate-850 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">🛒 E-Commerce Schema</div>
                <div className="text-[10px] text-slate-500 mt-0.5">customers, orders, order_items</div>
              </button>

              <button
                type="button"
                onClick={() => setSchemaPreset('custom')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  schemaPreset === 'custom'
                    ? 'border-blue-500 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/20 font-bold'
                    : isDarkMode ? 'border-slate-800 bg-slate-850 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold text-xs">⚙️ Custom DDL/DML</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Write your own CREATE TABLE</div>
              </button>
            </div>

            {schemaPreset === 'custom' && (
              <div className="pt-2">
                <textarea
                  value={customSetupSql}
                  onChange={(e) => setCustomSetupSql(e.target.value)}
                  rows={4}
                  placeholder="CREATE TABLE my_table (id INT, name TEXT); INSERT INTO my_table VALUES (1, 'Test');"
                  className={`w-full p-2.5 font-mono text-[11px] rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Problem Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Problem Description (Prompt)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Write a query to find the first_name and department_name of all employees earning > $80,000 using an INNER JOIN."
              className={`w-full p-3 rounded-xl border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* Solution & Starter SQL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Starter Query */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Starter SQL Template (Given to student)</label>
              <textarea
                value={starterSql}
                onChange={(e) => setStarterSql(e.target.value)}
                rows={4}
                className={`w-full p-3 font-mono text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            {/* Expected Solution SQL (The Answer) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Canonical Expected Query (The Answer) *</label>
                <button
                  type="button"
                  onClick={handleTestQuery}
                  disabled={testing}
                  className="text-[11px] font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Play size={11} className={testing ? 'animate-spin' : ''} />
                  <span>{testing ? 'Testing...' : 'Test Query Output'}</span>
                </button>
              </div>
              <textarea
                value={expectedSql}
                onChange={(e) => setExpectedSql(e.target.value)}
                rows={4}
                placeholder="SELECT e.first_name, d.department_name FROM employees e JOIN departments d ON e.department_id = d.id;"
                className={`w-full p-3 font-mono text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-emerald-600 font-semibold ${
                  isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
          </div>

          {/* Test Execution Output Banner */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="font-extrabold flex items-center gap-1.5">
                {testResult.success ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Query Verified Successfully ({testResult.rowCount} rows returned in {testResult.executionTimeMs} ms)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} className="text-rose-600" />
                    <span>SQL Error in Answer Query</span>
                  </>
                )}
              </div>
              {testResult.error ? (
                <div className="font-mono text-[11px]">{testResult.error}</div>
              ) : testResult.columns?.length > 0 && (
                <div className="overflow-x-auto max-h-24">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead className="bg-emerald-100/70">
                      <tr>
                        {testResult.columns.map((c, i) => (
                          <th key={i} className="px-2 py-1">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {testResult.values.slice(0, 3).map((r, ri) => (
                        <tr key={ri} className="border-t border-emerald-100">
                          {r.map((v, ci) => (
                            <td key={ci} className="px-2 py-0.5">{String(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {testResult.rowCount > 3 && (
                    <div className="text-[10px] text-slate-500 mt-1 italic">
                      + {testResult.rowCount - 3} more rows...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hints & Explanation */}
          <div className="space-y-3 pt-1">
            <h4 className="font-bold text-slate-700 flex items-center gap-1">
              <Lightbulb size={13} className="text-amber-500" />
              <span>Hints & Educational Explanation (Optional)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={hint1}
                onChange={(e) => setHint1(e.target.value)}
                placeholder="Hint #1 (e.g. Use INNER JOIN on department_id = id)"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <input
                type="text"
                value={hint2}
                onChange={(e) => setHint2(e.target.value)}
                placeholder="Hint #2 (e.g. Filter using WHERE salary > 80000)"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              placeholder="Detailed explanation of why this solution is optimal for interviews..."
              className={`w-full p-2.5 rounded-xl border text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className={`p-4 border-t flex items-center justify-between shrink-0 ${
          isDarkMode ? 'border-slate-800 bg-slate-850' : 'border-slate-200 bg-slate-50/80'
        }`}>
          <div className="text-[11px] text-slate-500">
            Custom challenges are saved locally and immediately available to students.
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-extrabold shadow-sm transition-all cursor-pointer text-xs flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 size={14} />
              <span>Save Challenge</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
