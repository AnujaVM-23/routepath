// PURPOSE: Visual grid builder — click cells to set obstacles, start, and target
// LAYER: UI Component — produces JSON string for submission
import { useState, useCallback } from 'react';

const CELL_TYPES = {
  0: { label: 'Walkable', color: '#1f2937', border: '#374151', emoji: '' },
  1: { label: 'Obstacle', color: '#7f1d1d', border: '#ef4444', emoji: '🧱' },
  2: { label: 'Item/Target', color: '#064e3b', border: '#10b981', emoji: '📦' },
  start: { label: 'Start', color: '#312e81', border: '#6366f1', emoji: '🚀' },
};

export default function GridBuilder({ onGenerate }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [grid, setGrid] = useState(() => makeGrid(3, 3));
  const [startCell, setStartCell] = useState([0, 0]);
  const [brush, setBrush] = useState(1); // current paint brush: 0, 1, or 2
  const [generated, setGenerated] = useState(false);

  function makeGrid(r, c) {
    return Array.from({ length: r }, () => Array(c).fill(0));
  }

  const applyDimensions = useCallback(() => {
    const r = Math.max(1, Math.min(rows, 20));
    const c = Math.max(1, Math.min(cols, 20));
    setRows(r);
    setCols(c);
    setGrid(makeGrid(r, c));
    setStartCell([0, 0]);
    setGenerated(false);
  }, [rows, cols]);

  const handleCellClick = (r, c) => {
    // If clicking the start cell, don't overwrite
    if (startCell && startCell[0] === r && startCell[1] === c) return;

    if (brush === 'start') {
      // Move start to this cell, clear old value at this cell
      setGrid((prev) => {
        const copy = prev.map((row) => [...row]);
        copy[r][c] = 0; // start cell is walkable underneath
        return copy;
      });
      setStartCell([r, c]);
    } else {
      setGrid((prev) => {
        const copy = prev.map((row) => [...row]);
        // Toggle: if cell already has this brush value, revert to walkable
        if (copy[r][c] === brush) {
          copy[r][c] = 0;
        } else {
          // If placing an item (2), remove any existing item first (only 1 allowed)
          if (brush === 2) {
            for (let ri = 0; ri < copy.length; ri++) {
              for (let ci = 0; ci < copy[ri].length; ci++) {
                if (copy[ri][ci] === 2) copy[ri][ci] = 0;
              }
            }
          }
          copy[r][c] = brush;
        }
        return copy;
      });
    }
    setGenerated(false);
  };

  const getCellDisplay = (r, c) => {
    if (startCell && startCell[0] === r && startCell[1] === c) return 'start';
    return grid[r][c];
  };

  const handleGenerate = () => {
    // Find all targets
    const targets = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === 2) targets.push([r, c]);
      }
    }

    const json = JSON.stringify(
      { grid, start: startCell, targets: targets.length > 0 ? targets : [[0, 0]] },
      null,
      2
    );
    onGenerate(json);
    setGenerated(true);
  };

  const cellSize = Math.max(28, Math.min(48, Math.floor(400 / Math.max(rows, cols))));

  return (
    <div className="flex flex-col gap-4">
      {/* Dimension inputs */}
      <div className="flex items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
            Rows
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value) || 1)}
            className="rounded-lg px-3 py-2 text-sm font-mono outline-none w-20"
            style={{
              backgroundColor: '#0a0f1e',
              color: '#f9fafb',
              border: '1px solid #374151',
            }}
          />
        </div>
        <span className="text-lg font-bold pb-2" style={{ color: '#6b7280' }}>×</span>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
            Columns
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value) || 1)}
            className="rounded-lg px-3 py-2 text-sm font-mono outline-none w-20"
            style={{
              backgroundColor: '#0a0f1e',
              color: '#f9fafb',
              border: '1px solid #374151',
            }}
          />
        </div>
        <button
          onClick={applyDimensions}
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150"
          style={{
            backgroundColor: '#1f2937',
            color: '#06b6d4',
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
          Apply Size
        </button>
      </div>

      {/* Brush selector */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
          🖌️ Click a brush, then click cells on the grid
        </p>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 0, label: 'Walkable (0)', color: '#1f2937', active: '#374151', text: '#9ca3af' },
            { id: 1, label: '🧱 Obstacle (1)', color: '#7f1d1d', active: '#991b1b', text: '#fca5a5' },
            { id: 2, label: '📦 Item (2)', color: '#064e3b', active: '#065f46', text: '#6ee7b7' },
            { id: 'start', label: '🚀 Start', color: '#312e81', active: '#3730a3', text: '#a5b4fc' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setBrush(b.id)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150"
              style={{
                backgroundColor: brush === b.id ? b.active : b.color,
                color: b.text,
                border: `2px solid ${brush === b.id ? b.text : 'transparent'}`,
                cursor: 'pointer',
                transform: brush === b.id ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div
        className="rounded-lg p-3 overflow-auto"
        style={{ backgroundColor: '#0a0f1e', border: '1px solid #374151' }}
      >
        <div
          className="inline-grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          }}
        >
          {grid.map((row, r) =>
            row.map((_, c) => {
              const display = getCellDisplay(r, c);
              const type = CELL_TYPES[display] || CELL_TYPES[0];
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  title={`[${r},${c}] — ${type.label}`}
                  className="rounded transition-all duration-100 flex items-center justify-center text-xs"
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: type.color,
                    border: `1.5px solid ${type.border}`,
                    cursor: 'pointer',
                    fontSize: cellSize > 32 ? '14px' : '10px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.4)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'brightness(1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {type.emoji}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Generate JSON button */}
      <button
        onClick={handleGenerate}
        className="rounded-lg font-medium text-sm py-2.5 transition-all duration-150 flex items-center justify-center gap-2"
        style={{
          backgroundColor: generated ? '#064e3b' : '#1f2937',
          color: generated ? '#10b981' : '#8b5cf6',
          border: `1px solid ${generated ? '#10b981' : '#374151'}`,
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#374151';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = generated ? '#064e3b' : '#1f2937';
        }}
      >
        {generated ? '✅ JSON Generated — Switch to JSON tab to view' : '⚡ Generate JSON from Grid'}
      </button>
    </div>
  );
}
