// PURPOSE: Animated warehouse grid visualization with annotations, tooltips, interactive legend
// LAYER: UI Component — no algorithm logic
import { useState } from 'react';

export default function GridVisualizer({
  grid,
  start,
  target,
  path,
  exploredCells,
  phase,
  explorationStep,
  pathStep,
}) {
  const [tooltip, setTooltip] = useState(null);
  const [highlightType, setHighlightType] = useState(null);

  if (!grid || grid.length === 0) {
    return (
      <div
        className="rounded-xl flex flex-col items-center justify-center gap-4 p-10"
        style={{
          backgroundColor: '#111827',
          border: '1px solid #374151',
          minHeight: '400px',
        }}
      >
        <span className="text-6xl">🗺️</span>
        <p className="text-text-secondary text-lg">No grid to display</p>
        <p className="text-text-secondary text-sm">
          Paste warehouse JSON and click Find Path
        </p>
      </div>
    );
  }

  const rows = grid.length;
  const cols = grid[0].length;

  // Build sets for quick lookup
  const exploredSet = new Set();
  if (phase === 'exploring' || phase === 'pathing' || phase === 'done') {
    const limit =
      phase === 'exploring'
        ? explorationStep
        : exploredCells
        ? exploredCells.length
        : 0;
    if (exploredCells) {
      for (let i = 0; i < limit; i++) {
        exploredSet.add(`${exploredCells[i][0]},${exploredCells[i][1]}`);
      }
    }
  }

  const pathSet = new Set();
  const pathIndexMap = new Map();
  let activeCell = null;
  if ((phase === 'pathing' || phase === 'done') && path) {
    const pathLimit = phase === 'done' ? path.length : pathStep;
    for (let i = 0; i < pathLimit; i++) {
      const key = `${path[i][0]},${path[i][1]}`;
      pathSet.add(key);
      pathIndexMap.set(key, i);
    }
    if (phase === 'pathing' && pathStep > 0 && pathStep <= path.length) {
      activeCell = `${path[pathStep - 1][0]},${path[pathStep - 1][1]}`;
    }
  }

  // Build full pathIndexMap for tooltip (all path steps)
  const fullPathIndexMap = new Map();
  if (path) {
    for (let i = 0; i < path.length; i++) {
      fullPathIndexMap.set(`${path[i][0]},${path[i][1]}`, i);
    }
  }

  const getCellInfo = (r, c) => {
    const key = `${r},${c}`;
    const isStart = start && r === start[0] && c === start[1];
    const isTarget = target && r === target[0] && c === target[1];
    const isActive = activeCell === key;
    const isPath = pathSet.has(key);
    const isExplored = exploredSet.has(key);
    const isObstacle = grid[r][c] === 1;

    if (isStart) return { type: 'start', style: { backgroundColor: '#6366f1', boxShadow: '0 0 12px #6366f180' }, className: 'animate-start-glow', icon: 'S', iconColor: '#ffffff' };
    if (isTarget) return { type: 'target', style: { backgroundColor: '#f59e0b' }, className: 'animate-target-pulse', icon: '★', iconColor: '#ffffff' };
    if (isActive) return { type: 'active', style: { backgroundColor: '#34d399', boxShadow: '0 0 16px #34d39990' }, className: 'animate-active-glow', icon: '●', iconColor: '#ffffff' };
    if (isPath) return { type: 'path', style: { backgroundColor: '#10b981' }, className: 'animate-path-reveal', icon: '·', iconColor: '#ffffff' };
    if (isExplored && !isObstacle) return { type: 'explored', style: { backgroundColor: '#064e3b' }, className: 'animate-explore-fade', icon: '', iconColor: '' };
    if (isObstacle) return { type: 'obstacle', style: { background: 'repeating-linear-gradient(45deg, #374151, #374151 4px, #2d3748 4px, #2d3748 8px)' }, className: '', icon: '▪', iconColor: '#6b7280' };
    return { type: 'walkable', style: { backgroundColor: '#111827' }, className: '', icon: '', iconColor: '' };
  };

  // Directional helper
  const getDir = (from, to) => {
    const dr = to[0] - from[0];
    const dc = to[1] - from[1];
    if (dr === -1) return '↑ up';
    if (dr === 1) return '↓ down';
    if (dc === -1) return '← left';
    if (dc === 1) return '→ right';
    return '';
  };

  // Live annotation text
  const annotationText = () => {
    if (phase === 'exploring' && exploredCells && explorationStep > 0) {
      const current = exploredCells[Math.min(explorationStep - 1, exploredCells.length - 1)];
      return (
        <div className="flex items-center justify-between gap-4">
          <span>🔍 BFS is exploring... visiting cell <strong>[{current[0]},{current[1]}]</strong></span>
          <span className="font-mono text-xs" style={{ color: '#6b7280' }}>Explored: {explorationStep}/{exploredCells.length} cells</span>
        </div>
      );
    }
    if (phase === 'pathing' && path && pathStep > 1) {
      const from = path[pathStep - 2];
      const to = path[pathStep - 1];
      const dir = getDir(from, to);
      return (
        <div className="flex items-center justify-between gap-4">
          <span>🚶 Step {pathStep - 1}: Moving <strong>{dir}</strong> from [{from[0]},{from[1]}] → [{to[0]},{to[1]}]</span>
          <span className="font-mono text-xs" style={{ color: '#6b7280' }}>Step {pathStep - 1}/{path.length - 1}</span>
        </div>
      );
    }
    if (phase === 'pathing' && path && pathStep === 1) {
      return <span>🚶 Starting from [{path[0][0]},{path[0][1]}]...</span>;
    }
    if (phase === 'done' && path) {
      return (
        <span>✅ Optimal path found — <strong>{path.length - 1} steps</strong>, {exploredCells ? exploredCells.length : 0} cells explored. BFS guarantees this is the shortest route.</span>
      );
    }
    return null;
  };

  const annotation = annotationText();

  // Tooltip builder
  const buildTooltip = (r, c, cellInfo) => {
    const key = `${r},${c}`;
    const typeLabels = {
      start: 'Start', target: 'Target', active: 'Active Step',
      path: 'Path', explored: 'BFS Explored', obstacle: 'Obstacle', walkable: 'Walkable',
    };
    let stepInfo = '';
    if (fullPathIndexMap.has(key)) {
      const idx = fullPathIndexMap.get(key);
      stepInfo = ` · Path step #${idx}`;
    }
    return `[${r},${c}] · ${typeLabels[cellInfo.type] || 'Unknown'}${stepInfo}`;
  };

  // Determine if cell should dim (legend highlight active)
  const shouldDim = (cellInfo) => {
    if (!highlightType) return false;
    return cellInfo.type !== highlightType;
  };

  const legendItems = [
    { color: '#6366f1', icon: 'S', label: 'Start', type: 'start' },
    { color: '#f59e0b', icon: '★', label: 'Target', type: 'target' },
    { color: '#374151', icon: '▪', label: 'Obstacle', type: 'obstacle' },
    { color: '#10b981', icon: '·', label: 'Path', type: 'path' },
    { color: '#064e3b', icon: '·', label: 'Explored', type: 'explored' },
    { color: '#111827', icon: '□', label: 'Walkable', type: 'walkable' },
  ];

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          🗺️ Warehouse Grid
        </h2>
        <span
          className="text-xs font-mono px-2 py-1 rounded"
          style={{ backgroundColor: '#1f2937', color: '#9ca3af' }}
        >
          {rows}×{cols}
        </span>
      </div>

      {/* Live Annotation */}
      {annotation && (
        <div
          className="text-sm font-medium px-3 py-2 rounded-lg"
          style={{
            backgroundColor: phase === 'done' ? '#064e3b40' : '#1f2937',
            color: phase === 'done' ? '#10b981' : '#d1d5db',
            border: '1px solid',
            borderColor: phase === 'done' ? '#064e3b' : '#374151',
          }}
        >
          {annotation}
        </div>
      )}

      {/* Grid */}
      <div
        className="overflow-auto flex justify-center relative"
        style={{ maxHeight: '500px' }}
      >
        <div
          style={{
            display: 'inline-grid',
            gridTemplateColumns: `repeat(${cols}, 56px)`,
            gap: '3px',
          }}
        >
          {grid.map((row, r) =>
            row.map((_, c) => {
              const cellInfo = getCellInfo(r, c);
              const dimmed = shouldDim(cellInfo);
              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative flex items-center justify-center font-bold text-lg select-none ${cellInfo.className}`}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '6px',
                    ...cellInfo.style,
                    transition: 'all 0.2s ease',
                    opacity: dimmed ? 0.2 : 1,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      text: buildTooltip(r, c, cellInfo),
                      x: rect.left + rect.width / 2,
                      y: rect.top - 8,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {cellInfo.icon && (
                    <span style={{ color: cellInfo.iconColor, fontSize: '20px' }}>
                      {cellInfo.icon}
                    </span>
                  )}
                  <span
                    className="absolute font-mono"
                    style={{ bottom: '2px', right: '4px', fontSize: '9px', color: '#9ca3af60' }}
                  >
                    {r},{c}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
            boxShadow: '0 4px 12px #00000060',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Interactive Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {legendItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-1.5 text-xs rounded-md px-2 py-1 transition-all duration-150"
            style={{
              backgroundColor: highlightType === item.type ? '#1f2937' : 'transparent',
              border: highlightType === item.type ? '1px solid #6366f1' : '1px solid transparent',
              cursor: 'pointer',
            }}
            onClick={() =>
              setHighlightType(highlightType === item.type ? null : item.type)
            }
          >
            <div
              className="rounded"
              style={{
                width: '14px',
                height: '14px',
                backgroundColor: item.color,
                border: item.color === '#111827' ? '1px solid #374151' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                color: '#fff',
              }}
            >
              {item.icon}
            </div>
            <span style={{ color: '#9ca3af' }}>{item.label}</span>
          </button>
        ))}
        {highlightType && (
          <button
            className="text-xs px-2 py-1 rounded-md"
            style={{ color: '#6b7280', border: '1px solid #374151' }}
            onClick={() => setHighlightType(null)}
          >
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
}
