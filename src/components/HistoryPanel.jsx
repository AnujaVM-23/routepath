// PURPOSE: Session-based path history panel
// LAYER: UI Component — no algorithm logic
import { useState } from 'react';

export default function HistoryPanel({ history, onClear, loading }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        backgroundColor: '#111827',
        border: '1px solid #374151',
        borderLeft: '4px solid #8b5cf6',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: '#f9fafb', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span>{expanded ? '▾' : '▸'}</span>
          📜 Path History
        </button>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ backgroundColor: '#1f2937', color: '#8b5cf6' }}
          >
            {history.length}
          </span>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs px-2 py-1 rounded-md transition-colors duration-150"
              style={{
                backgroundColor: '#1f2937',
                color: '#ef4444',
                border: '1px solid #374151',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <>
          {loading && (
            <div className="text-xs text-center py-2" style={{ color: '#9ca3af' }}>
              Loading...
            </div>
          )}

          {!loading && history.length === 0 && (
            <div className="text-xs text-center py-4" style={{ color: '#6b7280' }}>
              No paths tested yet. Run the pathfinder to build history.
            </div>
          )}

          {!loading && history.length > 0 && (
            <div
              className="flex flex-col gap-2 overflow-auto"
              style={{ maxHeight: '280px' }}
            >
              {history.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="rounded-lg p-3 flex flex-col gap-1.5"
                  style={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold" style={{ color: '#9ca3af' }}>
                      #{history.length - idx}
                    </span>
                    <span
                      className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: entry.targetReached ? '#064e3b' : '#7f1d1d',
                        color: entry.targetReached ? '#10b981' : '#ef4444',
                      }}
                    >
                      {entry.targetReached ? '✅ Reached' : '❌ Blocked'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs" style={{ color: '#d1d5db' }}>
                    <div>
                      <span style={{ color: '#6b7280' }}>Grid: </span>
                      {entry.gridDimensions}
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Steps: </span>
                      <span style={{ color: '#6366f1', fontWeight: 600 }}>{entry.totalSteps}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Start: </span>
                      [{entry.start[0]},{entry.start[1]}]
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>Target: </span>
                      [{entry.target[0]},{entry.target[1]}]
                    </div>
                  </div>

                  <div className="text-xs font-mono" style={{ color: '#6b7280' }}>
                    {new Date(entry.timestamp).toLocaleTimeString()} · {entry.executionTimeMs}ms
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
