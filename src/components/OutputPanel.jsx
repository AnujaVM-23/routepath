// PURPOSE: Structured JSON output display
// LAYER: UI Component — no algorithm logic
import { useState } from 'react';

function getDirection(from, to) {
  const dr = to[0] - from[0];
  const dc = to[1] - from[1];
  if (dr === -1) return { arrow: '↑', label: 'up' };
  if (dr === 1) return { arrow: '↓', label: 'down' };
  if (dc === -1) return { arrow: '←', label: 'left' };
  if (dc === 1) return { arrow: '→', label: 'right' };
  return { arrow: '·', label: '' };
}

function syntaxHighlight(obj) {
  const json = JSON.stringify(obj, null, 2);
  const parts = [];
  let i = 0;

  while (i < json.length) {
    // String (key or value)
    if (json[i] === '"') {
      let end = i + 1;
      while (end < json.length && json[end] !== '"') {
        if (json[end] === '\\') end++;
        end++;
      }
      end++; // include closing quote
      const str = json.slice(i, end);

      // Check if this is a key (followed by colon)
      let afterStr = end;
      while (afterStr < json.length && json[afterStr] === ' ') afterStr++;
      if (json[afterStr] === ':') {
        parts.push(
          <span key={i} style={{ color: '#7dd3fc' }}>
            {str}
          </span>
        );
      } else {
        parts.push(
          <span key={i} style={{ color: '#7dd3fc' }}>
            {str}
          </span>
        );
      }
      i = end;
      continue;
    }

    // Numbers
    if (/[0-9\-]/.test(json[i])) {
      let end = i;
      while (end < json.length && /[0-9.\-eE+]/.test(json[end])) end++;
      parts.push(
        <span key={i} style={{ color: '#fbbf24' }}>
          {json.slice(i, end)}
        </span>
      );
      i = end;
      continue;
    }

    // Booleans
    if (json.slice(i, i + 4) === 'true') {
      parts.push(
        <span key={i} style={{ color: '#f472b6' }}>
          true
        </span>
      );
      i += 4;
      continue;
    }
    if (json.slice(i, i + 5) === 'false') {
      parts.push(
        <span key={i} style={{ color: '#f472b6' }}>
          false
        </span>
      );
      i += 5;
      continue;
    }

    // null
    if (json.slice(i, i + 4) === 'null') {
      parts.push(
        <span key={i} style={{ color: '#f472b6' }}>
          null
        </span>
      );
      i += 4;
      continue;
    }

    // Brackets and everything else
    parts.push(
      <span key={i} style={{ color: '#e2e8f0' }}>
        {json[i]}
      </span>
    );
    i++;
  }

  return parts;
}

export default function OutputPanel({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div
        className="rounded-xl flex flex-col items-center justify-center gap-4 p-8"
        style={{
          backgroundColor: '#111827',
          border: '1px solid #374151',
          minHeight: '400px',
        }}
      >
        <span className="text-6xl">🏭</span>
        <p className="text-lg font-semibold" style={{ color: '#f9fafb' }}>
          Waiting for input...
        </p>
        <p className="text-sm text-center" style={{ color: '#9ca3af' }}>
          Paste warehouse JSON and click Find Path
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    const text = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const steps = [];
  if (result.path && result.path.length > 1) {
    for (let i = 1; i < result.path.length; i++) {
      const from = result.path[i - 1];
      const to = result.path[i];
      const dir = getDirection(from, to);
      steps.push({ step: i, from, to, ...dir });
    }
  }

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{
        backgroundColor: '#111827',
        border: '1px solid #374151',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          📤 Route Output
        </h2>
        <span
          className="text-xs font-mono px-2 py-1 rounded"
          style={{ backgroundColor: '#064e3b', color: '#10b981' }}
        >
          Schema ✓
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Steps */}
        <div
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>
            TOTAL STEPS
          </p>
          <p className="text-2xl font-bold" style={{ color: '#6366f1' }}>
            {result.total_steps}
          </p>
        </div>
        {/* Status */}
        <div
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>
            STATUS
          </p>
          <p
            className="text-sm font-bold"
            style={{
              color: result.target_reached ? '#10b981' : '#ef4444',
            }}
          >
            {result.target_reached ? '✅ REACHED' : '❌ BLOCKED'}
          </p>
        </div>
        {/* Exec Time */}
        <div
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>
            EXEC TIME
          </p>
          <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
            {result.execution_time_ms}
            <span className="text-xs ml-1">ms</span>
          </p>
        </div>
      </div>

      {/* JSON Block */}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 text-xs px-3 py-1 rounded-md font-medium transition-colors duration-200"
          style={{
            backgroundColor: copied ? '#064e3b' : '#1f2937',
            color: copied ? '#10b981' : '#9ca3af',
            border: '1px solid #374151',
          }}
        >
          {copied ? '✅ Copied!' : 'Copy JSON'}
        </button>
        <pre
          className="overflow-auto rounded-lg p-5 font-mono text-sm leading-relaxed"
          style={{
            backgroundColor: '#020617',
            border: '1px solid #1e3a5f',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
          }}
        >
          <code>{syntaxHighlight(result)}</code>
        </pre>
      </div>

      {/* Path Steps Breakdown */}
      {steps.length > 0 && (
        <div className="flex flex-col gap-1">
          <p
            className="text-xs font-medium mb-2"
            style={{ color: '#9ca3af' }}
          >
            PATH BREAKDOWN
          </p>
          {steps.map((s, idx) => {
            const isLast = idx === steps.length - 1;
            return (
              <div
                key={s.step}
                className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded"
                style={{
                  backgroundColor: isLast ? '#78350f20' : '#1f293740',
                  color: isLast ? '#f59e0b' : '#9ca3af',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <span className="font-semibold" style={{ minWidth: '50px' }}>
                  Step {s.step}
                </span>
                <span>
                  [{s.from[0]},{s.from[1]}]
                </span>
                <span>→</span>
                <span>
                  [{s.to[0]},{s.to[1]}]
                </span>
                <span>
                  {s.arrow} {s.label}
                </span>
                {isLast && <span className="ml-auto">🎯</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
