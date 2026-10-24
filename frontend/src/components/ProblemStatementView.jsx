import React from 'react';
import { Target, AlertCircle, Zap, Terminal, Sparkles, BookOpen } from 'lucide-react';

/**
 * LeetCode & InterviewBit Grade Problem Statement Renderer.
 * Parses rich Markdown tables, ASCII schemas, Example 1/2 blocks, notes, and requirements.
 */
export default function ProblemStatementView({ challenge, isDarkMode = false, showTags = true }) {
  if (!challenge) return null;

  const renderFormattedContent = (text) => {
    if (!text) return null;

    const sections = parseMarkdownDocument(text);

    const renderItem = (item, idx) => {
      switch (item.type) {
        case 'divider':
          return (
            <hr
              key={idx}
              className={`my-3.5 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}
            />
          );

        case 'heading':
          return (
            <h4
              key={idx}
              className={`text-xs font-black uppercase tracking-wider mt-3 mb-1 ${
                isDarkMode ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              {item.title}
            </h4>
          );

        case 'code':
          return (
            <div key={idx} className="my-3 overflow-hidden rounded-xl border border-slate-800 shadow-sm">
              <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Terminal size={12} className="text-emerald-400" />
                  <span>Schema / Example Table</span>
                </span>
              </div>
              <pre className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                {item.content}
              </pre>
            </div>
          );

        case 'table':
          return (
            <div
              key={idx}
              className={`my-2.5 overflow-x-auto border rounded-xl shadow-2xs ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <table className="w-full text-left text-xs font-mono">
                <thead
                  className={`uppercase text-[10px] font-black border-b ${
                    isDarkMode
                      ? 'bg-slate-900 text-slate-300 border-slate-800'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <tr>
                    {item.data.headerCells.map((h, hIdx) => (
                      <th key={hIdx} className="px-3.5 py-2 whitespace-nowrap">
                        {parseInlineTokens(h, isDarkMode)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDarkMode ? 'divide-slate-800 bg-slate-950' : 'divide-slate-100 bg-white'
                  }`}
                >
                  {item.data.dataRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={isDarkMode ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50/80 transition-colors'}
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-1.5 font-medium whitespace-nowrap">
                          {parseInlineTokens(cell, isDarkMode)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );

        case 'label':
          if (item.label.toLowerCase() === 'input') {
            return (
              <div key={idx} className="flex items-center gap-1.5 mt-2 mb-1">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-slate-200 text-slate-800 border border-slate-300'
                  }`}
                >
                  Input
                </span>
                {item.remainder && (
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {parseInlineTokens(item.remainder, isDarkMode)}
                  </span>
                )}
              </div>
            );
          }
          if (item.label.toLowerCase() === 'output') {
            return (
              <div key={idx} className="flex items-center gap-1.5 mt-3 mb-1">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                    isDarkMode
                      ? 'bg-blue-950/60 text-blue-400 border border-blue-900'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  Output
                </span>
                {item.remainder && (
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {parseInlineTokens(item.remainder, isDarkMode)}
                  </span>
                )}
              </div>
            );
          }
          return (
            <div key={idx} className="mt-2.5 mb-1 text-xs">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 mr-1.5">
                {item.label}:
              </span>
              {item.remainder && (
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                  {parseInlineTokens(item.remainder, isDarkMode)}
                </span>
              )}
            </div>
          );

        case 'bullets':
          return (
            <ul key={idx} className="space-y-1.5 my-2 pl-1">
              {item.items.map((bItem, bIdx) => (
                <li key={bIdx} className="flex items-start space-x-2 text-xs leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                    {parseInlineTokens(bItem, isDarkMode)}
                  </span>
                </li>
              ))}
            </ul>
          );

        case 'example':
          return (
            <div
              key={idx}
              className={`my-3.5 p-4 rounded-2xl border space-y-2 ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                  : 'bg-slate-50/90 border-slate-200 text-slate-800 shadow-2xs'
              }`}
            >
              <div className="flex items-center space-x-1.5 text-xs font-black text-blue-600 uppercase tracking-wider pb-1 border-b border-slate-200/60 dark:border-slate-800">
                <Sparkles size={13} />
                <span>{item.title}</span>
              </div>
              <div className="space-y-2 text-xs leading-relaxed">
                {item.items.map((subItem, sIdx) => renderItem(subItem, `${idx}-${sIdx}`))}
              </div>
            </div>
          );

        case 'paragraph':
        default:
          return (
            <p
              key={idx}
              className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
            >
              {parseInlineTokens(item.text, isDarkMode)}
            </p>
          );
      }
    };

    return sections.map((sec, idx) => renderItem(sec, idx));
  };

  return (
    <div className="space-y-5">
      {/* Header Info Banner */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
            {challenge.moduleTitle}
          </span>
          {challenge.interviewFrequency && (
            <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
              <Zap size={12} />
              <span>{challenge.interviewFrequency}</span>
            </span>
          )}
        </div>
        <h2 className={`text-xl font-black mt-2 tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
          {challenge.title}
        </h2>
      </div>

      {/* Tags */}
      {showTags && challenge.tags && challenge.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {challenge.tags.map((tag, idx) => (
            <span key={idx} className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Problem Statement Card (LeetCode Styled) */}
      <div className={`border rounded-2xl p-5 space-y-4 shadow-2xs ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center space-x-2 border-b pb-3 border-slate-100">
          <Target size={14} className="text-blue-600" />
          <h3 className={`text-xs font-black uppercase tracking-wider ${
            isDarkMode ? 'text-slate-300' : 'text-slate-800'
          }`}>
            Problem Statement & Specifications
          </h3>
        </div>

        <div className="space-y-3">
          {renderFormattedContent(challenge.description)}
        </div>
      </div>
    </div>
  );
}

/**
 * Parses bold (**text**), inline code (`code`), and italics (*text*) into JSX elements.
 */
function parseInlineTokens(text, isDarkMode) {
  if (!text) return '';

  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={idx} className={`font-black ${
          isDarkMode ? 'text-blue-400' : 'text-slate-900'
        }`}>
          {boldText}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code key={idx} className={`px-1.5 py-0.5 rounded font-mono text-[11px] border font-bold ${
          isDarkMode 
            ? 'bg-slate-800 text-amber-300 border-slate-700' 
            : 'bg-slate-100 text-blue-700 border-slate-200'
        }`}>
          {codeText}
        </code>
      );
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      const italicText = part.slice(1, -1);
      return <em key={idx} className="italic text-slate-500">{italicText}</em>;
    }

    return part;
  });
}

/**
 * Robust document-level Markdown parser for LeetCode SQL challenges.
 * Correctly segments dividers (---), schemas/tables, headings, bullet lists,
 * and Example cards (with Input, Output, Explanation, and embedded tables).
 */
function parseMarkdownDocument(text) {
  if (!text) return [];
  const lines = text.trim().split('\n');
  const sections = [];
  let currentExample = null;
  let i = 0;

  function parseTable(startIdx) {
    const tableLines = [];
    while (startIdx < lines.length && lines[startIdx].trim().startsWith('|')) {
      tableLines.push(lines[startIdx].trim());
      startIdx++;
    }
    if (tableLines.length >= 2) {
      const headerCells = tableLines[0].split('|').map(c => c.trim()).filter(Boolean);
      const isSep = tableLines[1].replace(/[:\-\s|]/g, '') === '';
      const dataRows = (isSep ? tableLines.slice(2) : tableLines.slice(1)).map(line =>
        line.split('|').map(c => c.trim()).filter(Boolean)
      );
      return {
        table: { headerCells, dataRows },
        nextIdx: startIdx
      };
    }
    return null;
  }

  function pushItem(item) {
    if (currentExample) {
      currentExample.items.push(item);
    } else {
      sections.push(item);
    }
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Horizontal divider (--- or ***)
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      if (currentExample) {
        sections.push(currentExample);
        currentExample = null;
      }
      sections.push({ type: 'divider' });
      i++;
      continue;
    }

    // 2. Example header: ### Example 1: or **Example 1**: or Example 1:
    const exampleMatch = trimmed.match(/^(?:#{1,4}\s*)?(?:\*{0,2})(Example\s*\d+)(?:\*{0,2}):?/i);
    if (exampleMatch) {
      if (currentExample) {
        sections.push(currentExample);
      }
      currentExample = {
        type: 'example',
        title: exampleMatch[1].trim(),
        items: []
      };
      i++;
      continue;
    }

    // 3. Headings: ### Task or ## Details
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      pushItem({ type: 'heading', level: headingMatch[1].length, title: headingMatch[2].trim() });
      i++;
      continue;
    }

    // 4. Code block (```)
    if (trimmed.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      pushItem({ type: 'code', content: codeLines.join('\n') });
      continue;
    }

    // 5. ASCII table (+---+---+)
    if (trimmed.startsWith('+') && trimmed.includes('-+')) {
      const asciiLines = [];
      while (i < lines.length && (lines[i].trim().startsWith('+') || lines[i].trim().startsWith('|'))) {
        asciiLines.push(lines[i]);
        i++;
      }
      pushItem({ type: 'code', content: asciiLines.join('\n') });
      continue;
    }

    // 6. Markdown table (| col | col |)
    if (trimmed.startsWith('|')) {
      const res = parseTable(i);
      if (res) {
        pushItem({ type: 'table', data: res.table });
        i = res.nextIdx;
        continue;
      }
    }

    // 7. Input / Output / Explanation labels
    const labelMatch = trimmed.match(/^(?:\*{0,2})(Input|Output|Explanation)(?:\*{0,2}):?\s*(.*)$/i);
    if (labelMatch) {
      const label = labelMatch[1];
      const remainder = labelMatch[2] ? labelMatch[2].replace(/^\*+|\*+$/g, '').trim() : '';
      pushItem({ type: 'label', label, remainder });
      i++;
      continue;
    }

    // 8. Bullet points (- item or * item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      pushItem({ type: 'bullets', items });
      continue;
    }

    // 9. Regular text/paragraph (accumulate multi-line paragraphs)
    const paraLines = [];
    while (i < lines.length) {
      const cur = lines[i].trim();
      if (!cur ||
          /^(\-{3,}|\*{3,})$/.test(cur) ||
          cur.startsWith('|') ||
          cur.startsWith('```') ||
          (cur.startsWith('+') && cur.includes('-+')) ||
          cur.match(/^(?:#{1,4}\s*)?(?:\*{0,2})(Example\s*\d+)/i) ||
          cur.match(/^(#{1,4})\s+/i) ||
          cur.match(/^(?:\*{0,2})(Input|Output|Explanation)(?:\*{0,2}):?\s*/i)) {
        break;
      }
      paraLines.push(cur);
      i++;
    }
    if (paraLines.length > 0) {
      pushItem({ type: 'paragraph', text: paraLines.join(' ') });
    }
  }

  if (currentExample) {
    sections.push(currentExample);
  }

  return sections;
}
