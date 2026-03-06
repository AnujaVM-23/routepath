// PURPOSE: Full-page JSON input interface with format reference + visual grid builder
// LAYER: UI Component — no algorithm logic
import { useState, useRef } from 'react';
import GridBuilder from './GridBuilder.jsx';

const SAMPLE_JSON = `{
  "grid": [
    [0, 0, 1],
    [1, 0, 1],
    [0, 2, 0]
  ],
  "start": [0, 0],
  "targets": [[2, 1]]
}`;

export default function InputPanel({ onSubmit, onValidate, onNavigateHistory, onNavigateDashboard, error, validationMsg, isRunning }) {
  const [value, setValue] = useState(SAMPLE_JSON);
  const [mode, setMode] = useState('json'); // 'json' | 'visual'
  const fileInputRef = useRef(null);

  const handleClear = () => {
    setValue('');
  };

  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (!file.name.endsWith('.json')) {
      setUploadError('Only .json files are accepted.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      setValue(evt.target.result);
      setMode('json');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#0a0f1e' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 shrink-0"
        style={{ height: '64px', borderBottom: '1px solid #1f2937' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏭</span>
          <span
            className="text-xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            RouteMaster
          </span>
        </div>
        <span className="text-sm hidden md:block" style={{ color: '#9ca3af' }}>
          Warehouse BFS Pathfinder
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateDashboard}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-150"
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
            ← Dashboard
          </button>
          <button
            onClick={onNavigateHistory}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-150"
            style={{
              backgroundColor: '#1f2937',
              color: '#8b5cf6',
              border: '1px solid #374151',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
              e.currentTarget.style.color = '#a78bfa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1f2937';
              e.currentTarget.style.color = '#8b5cf6';
            }}
          >
            📜 History
          </button>
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
        </div>
      </header>

      {/* Main content — centered card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#f9fafb' }}>
              📦 Warehouse Pathfinder
            </h1>
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Build your grid visually or edit JSON directly, then find the shortest path
            </p>
          </div>

          {/* Input Card */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              boxShadow: '0 8px 32px #00000040',
            }}
          >
            {/* Tab switcher */}
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: '1px solid #374151' }}
            >
              {[
                { id: 'json', label: '📝 JSON Input' },
                { id: 'upload', label: '📁 Upload JSON' },
                { id: 'visual', label: '🧩 Visual Grid Builder' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className="flex-1 text-sm font-semibold py-2.5 transition-all duration-150"
                  style={{
                    backgroundColor: mode === tab.id ? '#6366f1' : '#1f2937',
                    color: mode === tab.id ? '#ffffff' : '#9ca3af',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── JSON MODE ── */}
            {mode === 'json' && (
              <>
                {/* Format reference strip */}
                <div
                  className="rounded-lg p-3 flex items-start gap-3"
                  style={{ backgroundColor: '#0a0f1e', border: '1px solid #374151' }}
                >
                  <span className="text-lg mt-0.5">📋</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-1" style={{ color: '#f59e0b' }}>
                      Format Guide
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
                      <code style={{ color: '#fbbf24' }}>0</code> = walkable &nbsp;·&nbsp;
                      <code style={{ color: '#fbbf24' }}>1</code> = obstacle &nbsp;·&nbsp;
                      <code style={{ color: '#fbbf24' }}>2</code> = target &nbsp;·&nbsp;
                      <code style={{ color: '#7dd3fc' }}>start</code> = [row, col] &nbsp;·&nbsp;
                      <code style={{ color: '#7dd3fc' }}>targets</code> = [[row, col]]
                    </p>
                  </div>
                </div>

                {/* Editable textarea with label */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#f9fafb' }}>
                      📥 Warehouse JSON
                    </label>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{ backgroundColor: '#1f2937', color: '#6366f1' }}
                    >
                      Editable
                    </span>
                  </div>
                  <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    spellCheck={false}
                    className="w-full rounded-lg p-4 resize-none font-mono text-sm leading-relaxed outline-none transition-all duration-200"
                    style={{
                      backgroundColor: '#0a0f1e',
                      color: '#10b981',
                      fontFamily: "'JetBrains Mono', monospace",
                      height: '280px',
                      border: '1px solid #374151',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 3px #6366f140';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#374151';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Validate + Clear row */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onValidate(value)}
                    className="flex-1 rounded-lg font-medium text-sm py-2.5 transition-all duration-150 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: '#1f2937',
                      color: '#06b6d4',
                      border: '1px solid #374151',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#374151';
                      e.currentTarget.style.borderColor = '#06b6d4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f2937';
                      e.currentTarget.style.borderColor = '#374151';
                    }}
                  >
                    ✓ Validate JSON
                  </button>
                  <button
                    onClick={handleClear}
                    className="rounded-lg font-medium text-sm px-5 py-2.5 transition-all duration-150 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: '#1f2937',
                      color: '#ef4444',
                      border: '1px solid #374151',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#374151';
                      e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f2937';
                      e.currentTarget.style.borderColor = '#374151';
                    }}
                  >
                    ✕ Clear
                  </button>
                </div>

                {/* Validation message */}
                {validationMsg && (
                  <div
                    className="text-sm rounded-lg p-3 flex items-start gap-2"
                    style={{
                      backgroundColor: validationMsg.valid ? '#064e3b30' : '#1f293780',
                      color: validationMsg.valid ? '#10b981' : '#ef4444',
                    }}
                  >
                    <span>{validationMsg.valid ? '✅' : '❌'}</span>
                    <span>{validationMsg.text}</span>
                  </div>
                )}
              </>
            )}

            {/* ── UPLOAD MODE ── */}
            {mode === 'upload' && (
              <div className="flex flex-col gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {/* Drop zone */}
                <div
                  className="rounded-xl p-10 flex flex-col items-center justify-center gap-4 text-center transition-colors duration-200"
                  style={{
                    backgroundColor: '#0a0f1e',
                    border: '2px dashed #374151',
                    cursor: 'pointer',
                    minHeight: '220px',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.backgroundColor = '#1f293740';
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.backgroundColor = '#0a0f1e';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.backgroundColor = '#0a0f1e';
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      if (!file.name.endsWith('.json')) return;
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        setValue(evt.target.result);
                        setMode('json');
                      };
                      reader.readAsText(file);
                    }
                  }}
                >
                  <span className="text-5xl">📂</span>
                  <p className="text-lg font-semibold" style={{ color: '#f9fafb' }}>
                    Click to browse or drag &amp; drop
                  </p>
                  <p className="text-sm" style={{ color: '#6b7280' }}>
                    Accepts <code style={{ color: '#6366f1' }}>.json</code> files only
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg font-medium text-sm py-3 transition-all duration-150 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#1f2937',
                    color: '#6366f1',
                    border: '1px solid #374151',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#374151';
                    e.currentTarget.style.borderColor = '#6366f1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1f2937';
                    e.currentTarget.style.borderColor = '#374151';
                  }}
                >
                  📁 Browse Files
                </button>
                {uploadError && (
                  <div
                    className="text-sm rounded-lg p-3 flex items-center gap-2"
                    style={{ backgroundColor: '#1f293780', color: '#ef4444' }}
                  >
                    ❌ {uploadError}
                  </div>
                )}
                {value && value !== SAMPLE_JSON && (
                  <div
                    className="text-sm rounded-lg p-3 flex items-center gap-2"
                    style={{ backgroundColor: '#064e3b30', color: '#10b981' }}
                  >
                    ✅ File loaded — switch to JSON Input tab to review & run
                  </div>
                )}
              </div>
            )}

            {/* ── VISUAL MODE ── */}
            {mode === 'visual' && (
              <GridBuilder
                onGenerate={(json) => {
                  setValue(json);
                  setMode('json');
                }}
              />
            )}

            {/* Find Path Button */}
            <button
              onClick={() => onSubmit(value)}
              disabled={isRunning}
              className="w-full rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 text-lg"
              style={{
                height: '56px',
                background: isRunning
                  ? '#4b5563'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isRunning) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              {isRunning ? (
                <>
                  <svg
                    className="animate-spinner"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Calculating...
                </>
              ) : (
                <>▶ Find Shortest Path</>
              )}
            </button>

            {/* Error */}
            {error && (
              <div
                className="text-sm rounded-lg p-3 flex items-start gap-2"
                style={{ backgroundColor: '#1f293780', color: '#ef4444' }}
              >
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
