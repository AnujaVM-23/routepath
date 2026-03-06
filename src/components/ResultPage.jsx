// PURPOSE: Full-page route output with formatted JSON, copy, download, solve another
// LAYER: UI Component — display only
// BACK NAV: ← Back to Grid (onBackToGrid)
import { useState } from 'react';

/**
 * Syntax-highlights a JSON object with colored spans.
 * Keys = cyan, strings = indigo, numbers = amber, booleans = green/red, null = pink.
 */
function syntaxHighlight(obj) {
  const json = JSON.stringify(obj, null, 2);
  const parts = [];
  let i = 0;

  while (i < json.length) {
    if (json[i] === '"') {
      let end = i + 1;
      while (end < json.length && json[end] !== '"') {
        if (json[end] === '\\') end++;
        end++;
      }
      end++;
      const str = json.slice(i, end);
      let afterStr = end;
      while (afterStr < json.length && json[afterStr] === ' ') afterStr++;
      const isKey = json[afterStr] === ':';
      parts.push(
        <span key={i} style={{ color: isKey ? '#7dd3fc' : '#a5b4fc' }}>
          {str}
        </span>
      );
      i = end;
      continue;
    }
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
    if (json.slice(i, i + 4) === 'true') {
      parts.push(<span key={i} style={{ color: '#34d399' }}>true</span>);
      i += 4;
      continue;
    }
    if (json.slice(i, i + 5) === 'false') {
      parts.push(<span key={i} style={{ color: '#f87171' }}>false</span>);
      i += 5;
      continue;
    }
    if (json.slice(i, i + 4) === 'null') {
      parts.push(<span key={i} style={{ color: '#f472b6' }}>null</span>);
      i += 4;
      continue;
    }
    parts.push(
      <span key={i} style={{ color: '#e2e8f0' }}>
        {json[i]}
      </span>
    );
    i++;
  }
  return parts;
}

/**
 * Returns arrow and label for the direction between two adjacent cells.
 */
function getDirection(from, to) {
  const dr = to[0] - from[0];
  const dc = to[1] - from[1];
  if (dr === -1) return { arrow: '↑', label: 'up' };
  if (dr === 1) return { arrow: '↓', label: 'down' };
  if (dc === -1) return { arrow: '←', label: 'left' };
  if (dc === 1) return { arrow: '→', label: 'right' };
  return { arrow: '·', label: '' };
}

export default function ResultPage({ result, explanation, onSolveAnother, onBackToGrid }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const jsonText = JSON.stringify(result, null, 2);

  // Copy formatted JSON to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Download output as a .json file
  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'routemaster-output.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build step-by-step path breakdown for display
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
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#0a0f1e' }}
    >
      {/* Header with back navigation */}
      <header
        className="flex items-center justify-between px-6 shrink-0"
        style={{ height: '64px', borderBottom: '1px solid #1f2937' }}
      >
        <div className="flex items-center gap-3">
          {/* Back to Grid button */}
          <button
            onClick={onBackToGrid}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-150"
            style={{
              backgroundColor: '#1f2937',
              color: '#9ca3af',
              border: '1px solid #374151',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
              e.currentTarget.style.color = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1f2937';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            ← Back to Grid
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏭</span>
            <span
              className="text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              RouteMaster
            </span>
          </div>
        </div>
        <h2 className="text-lg font-semibold" style={{ color: '#f9fafb' }}>
          📤 Route Output
        </h2>
        <div className="flex items-center gap-2">
          <div
            className="rounded-full animate-live-pulse"
            style={{ width: '8px', height: '8px', backgroundColor: '#10b981' }}
          />
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ backgroundColor: '#064e3b', color: '#10b981' }}
          >
            LIVE
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto flex justify-center">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          {/* Explanation banner */}
          {explanation && (
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderLeft: '4px solid #10b981',
              }}
            >
              <span className="text-lg mt-0.5">🧠</span>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#10b981' }}>
                  Path Explanation
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#d1d5db' }}>
                  {explanation}
                </p>
              </div>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>
                TOTAL STEPS
              </p>
              <p className="text-3xl font-bold" style={{ color: '#6366f1' }}>
                {result.total_steps}
              </p>
            </div>
            <div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>
                STATUS
              </p>
              <p
                className="text-lg font-bold mt-1"
                style={{ color: result.target_reached ? '#10b981' : '#ef4444' }}
              >
                {result.target_reached ? '✅ REACHED' : '❌ BLOCKED'}
              </p>
            </div>
            <div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>
                EXEC TIME
              </p>
              <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
                {result.execution_time_ms}
                <span className="text-xs ml-1">ms</span>
              </p>
            </div>
          </div>

          {/* Formatted JSON Block */}
          <div
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#f9fafb' }}>
                📋 Formatted JSON Output
              </h3>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{ backgroundColor: '#064e3b', color: '#10b981' }}
              >
                Schema ✓
              </span>
            </div>
            <pre
              className="overflow-auto rounded-lg p-5 font-mono text-sm leading-relaxed"
              style={{
                backgroundColor: '#020617',
                border: '1px solid #1e3a5f',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                maxHeight: '400px',
              }}
            >
              <code>{syntaxHighlight(result)}</code>
            </pre>
          </div>

          {/* Path Steps Breakdown */}
          {steps.length > 0 && (
            <div
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
            >
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#f9fafb' }}>
                🗺️ Path Breakdown
              </h3>
              <div className="flex flex-col gap-1">
                {steps.map((s, idx) => {
                  const isLast = idx === steps.length - 1;
                  return (
                    <div
                      key={s.step}
                      className="flex items-center gap-3 text-xs font-mono px-3 py-2 rounded"
                      style={{
                        backgroundColor: isLast ? '#78350f20' : '#1f293740',
                        color: isLast ? '#f59e0b' : '#9ca3af',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      <span className="font-semibold" style={{ minWidth: '55px' }}>
                        Step {s.step}
                      </span>
                      <span>[{s.from[0]},{s.from[1]}]</span>
                      <span>→</span>
                      <span>[{s.to[0]},{s.to[1]}]</span>
                      <span>{s.arrow} {s.label}</span>
                      {isLast && <span className="ml-auto">🎯</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleCopy}
              className="flex-1 rounded-xl font-semibold text-sm py-3.5 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                backgroundColor: copied ? '#064e3b' : '#1f2937',
                color: copied ? '#10b981' : '#06b6d4',
                border: `1px solid ${copied ? '#10b981' : '#374151'}`,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!copied) e.currentTarget.style.backgroundColor = '#374151';
              }}
              onMouseLeave={(e) => {
                if (!copied) e.currentTarget.style.backgroundColor = '#1f2937';
              }}
            >
              {copied ? '✅ Copied!' : '📋 Copy JSON'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 rounded-xl font-semibold text-sm py-3.5 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#1f2937',
                color: '#8b5cf6',
                border: '1px solid #374151',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1f2937';
              }}
            >
              ⬇️ Download JSON
            </button>
            <button
              onClick={onSolveAnother}
              className="flex-1 rounded-xl font-semibold text-sm py-3.5 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.15)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🔄 Solve Another
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
