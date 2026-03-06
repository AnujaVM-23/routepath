// PURPOSE: State management and component orchestration
// LAYER: App Orchestration — no algorithm logic inline
// NAVIGATION FLOW: dashboard → input → loading → grid → result
//                  dashboard → history
// Back navigation is supported on every page except dashboard (root) and loading (transient)
import { useState, useEffect, useRef, useCallback } from 'react';
import { bfs } from './algorithms/bfs.js';
import { validateInput, findTarget, buildOutput, generateExplanation } from './utils/pathHelpers.js';
import InputPanel from './components/InputPanel.jsx';
import GridVisualizer from './components/GridVisualizer.jsx';
import ResultPage from './components/ResultPage.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import Dashboard from './components/Dashboard.jsx';

const API_BASE = '/api';

export default function App() {
  // ── STATE ──
  // Page controls which full-screen view is rendered
  // 'dashboard' | 'input' | 'loading' | 'grid' | 'result' | 'history'
  const [page, setPage] = useState('dashboard');

  const [inputError, setInputError] = useState(null);       // Validation error shown on input page
  const [validationMsg, setValidationMsg] = useState(null);  // Validate JSON feedback message
  const [result, setResult] = useState(null);                // BFS output object
  const [grid, setGrid] = useState(null);                    // Parsed 2D grid array
  const [start, setStart] = useState(null);                  // Start [row, col]
  const [target, setTarget] = useState(null);                // Target [row, col]
  const [path, setPath] = useState(null);                    // BFS shortest path
  const [exploredCells, setExploredCells] = useState(null);  // All cells BFS visited
  const [phase, setPhase] = useState('idle');                // Animation phase: idle | exploring | pathing | done
  const [explorationStep, setExplorationStep] = useState(0); // Current step in exploration animation
  const [pathStep, setPathStep] = useState(0);               // Current step in path animation
  const [isRunning, setIsRunning] = useState(false);         // Locks UI while BFS is computing
  const [explanation, setExplanation] = useState(null);      // Natural language path explanation
  const [history, setHistory] = useState([]);                // Array of past run entries
  const [historyLoading, setHistoryLoading] = useState(false);

  // Refs hold exploration/path data for animation intervals (avoids stale closures)
  const exploredRef = useRef(null);
  const pathRef = useRef(null);

  // ── API CALLS ──
  // Fetch run history from Express backend on initial mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Fetch all history entries from the backend API
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      // Server may not be running
    } finally {
      setHistoryLoading(false);
    }
  };

  // Save a completed run to the backend history store
  const saveToHistory = async (parsedGrid, parsedStart, parsedTarget, output) => {
    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gridDimensions: `${parsedGrid.length}×${parsedGrid[0].length}`,
          start: parsedStart,
          target: parsedTarget,
          totalSteps: output.total_steps,
          targetReached: output.target_reached,
          executionTimeMs: output.execution_time_ms,
        }),
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch {
      // Server may not be running
    }
  };

  // Delete all history entries from the backend
  const clearHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
  };

  // ── NAVIGATION HANDLERS ──
  // Validate JSON without running BFS (preview check)
  const handleValidate = useCallback((jsonString) => {
    const validation = validateInput(jsonString);
    if (validation.valid) {
      setValidationMsg({ valid: true, text: 'JSON is valid and ready to run!' });
    } else {
      setValidationMsg({ valid: false, text: validation.error });
    }
  }, []);

  // Navigate to history page and refresh data
  const handleNavigateHistory = useCallback(() => {
    fetchHistory();
    setPage('history');
  }, []);

  // ── CORE SUBMIT HANDLER ──
  // Validates input → runs BFS → transitions through loading → grid → saves to history
  const handleSubmit = useCallback((jsonString) => {
    // Reset
    setInputError(null);
    setResult(null);
    setGrid(null);
    setStart(null);
    setTarget(null);
    setPath(null);
    setExploredCells(null);
    setPhase('idle');
    setExplorationStep(0);
    setPathStep(0);
    setExplanation(null);

    // 1. Validate
    const validation = validateInput(jsonString);
    if (!validation.valid) {
      setInputError(validation.error);
      return; // stay on input page
    }

    const data = validation.data;
    const parsedGrid = data.grid;
    const parsedStart = data.start;

    // 2. Find target
    const parsedTarget = findTarget(parsedGrid);
    if (!parsedTarget) {
      setInputError('No target cell (value 2) found in the grid.');
      return;
    }

    // 3. Go to loading page
    setIsRunning(true);
    setPage('loading');

    // Small delay so loading page renders, then run BFS
    setTimeout(() => {
      const t1 = performance.now();
      const bfsResult = bfs(parsedGrid, parsedStart, parsedTarget);
      const t2 = performance.now();

      const output = buildOutput(bfsResult.path, Math.round(t2 - t1));

      const exp = generateExplanation(
        bfsResult.path,
        bfsResult.exploredCells,
        parsedGrid,
        parsedStart,
        parsedTarget
      );
      setExplanation(exp);

      setGrid(parsedGrid);
      setStart(parsedStart);
      setTarget(parsedTarget);
      setPath(bfsResult.path);
      setExploredCells(bfsResult.exploredCells);
      exploredRef.current = bfsResult.exploredCells;
      pathRef.current = bfsResult.path;
      setResult(output);
      setExplorationStep(0);
      setPathStep(0);

      // Transition to grid page after a brief loading display
      setTimeout(() => {
        setPhase('exploring');
        setIsRunning(false);
        setPage('grid');
      }, 800);

      saveToHistory(parsedGrid, parsedStart, parsedTarget, output);
    }, 100);
  }, []);

  // ── BACK NAVIGATION HANDLERS ──
  // Go back from grid/result to the input page
  const handleBackToInput = () => {
    setPage('input');
    setPhase('idle');
    setExplorationStep(0);
    setPathStep(0);
  };

  // Go back to dashboard from any page (resets animation state)
  const handleBackToDashboard = () => {
    setPage('dashboard');
    setPhase('idle');
    setExplorationStep(0);
    setPathStep(0);
    fetchHistory();
  };

  // Dashboard quick-action navigation (input or history)
  const handleDashboardNavigate = (target) => {
    if (target === 'history') {
      fetchHistory();
    }
    setPage(target);
  };

  // Navigate forward from grid page to result page
  const handleShowResult = () => {
    setPage('result');
  };

  // Navigate back from result page to grid visualization
  const handleBackToGrid = () => {
    setPage('grid');
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const jsonText = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'routemaster-output.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── ANIMATION CONTROLLER ──
  // Runs exploration animation (40ms per cell), then path animation (120ms per step)
  useEffect(() => {
    if (phase === 'exploring') {
      const explored = exploredRef.current;
      if (!explored || explored.length === 0) {
        setPhase('pathing');
        return;
      }

      let step = 0;
      const interval = setInterval(() => {
        step++;
        setExplorationStep(step);
        if (step >= explored.length) {
          clearInterval(interval);
          setPhase('pathing');
        }
      }, 40);

      return () => clearInterval(interval);
    }

    if (phase === 'pathing') {
      const p = pathRef.current;
      if (!p || p.length === 0) {
        setPhase('done');
        return;
      }

      let step = 0;
      const interval = setInterval(() => {
        step++;
        setPathStep(step);
        if (step >= p.length) {
          clearInterval(interval);
          setPhase('done');
        }
      }, 120);

      return () => clearInterval(interval);
    }
  }, [phase]);

  // ── PAGE: DASHBOARD ──
  if (page === 'dashboard') {
    return (
      <Dashboard
        history={history}
        onNavigate={handleDashboardNavigate}
      />
    );
  }

  // ── PAGE: INPUT ──
  if (page === 'input') {
    return (
      <InputPanel
        onSubmit={handleSubmit}
        onValidate={handleValidate}
        onNavigateHistory={handleNavigateHistory}
        onNavigateDashboard={handleBackToDashboard}
        error={inputError}
        validationMsg={validationMsg}
        isRunning={isRunning}
      />
    );
  }

  // ── PAGE: HISTORY ──
  if (page === 'history') {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: '#0a0f1e' }}
      >
        <header
          className="flex items-center justify-between px-6 shrink-0"
          style={{ height: '64px', borderBottom: '1px solid #1f2937' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToDashboard}
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
              ← Dashboard
            </button>
            {/* Back to Input shortcut */}
            <button
              onClick={handleBackToInput}
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
              ← Input
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
            📜 Path History
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
        <main className="flex-1 p-6 overflow-auto flex justify-center">
          <div className="w-full max-w-2xl">
            <HistoryPanel
              history={history}
              onClear={clearHistory}
              loading={historyLoading}
            />
          </div>
        </main>
      </div>
    );
  }

  // ── PAGE: LOADING ──
  if (page === 'loading') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ backgroundColor: '#0a0f1e' }}
      >
        <div className="relative">
          <div
            className="rounded-full animate-spinner"
            style={{
              width: '64px',
              height: '64px',
              border: '4px solid #1f2937',
              borderTopColor: '#6366f1',
            }}
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#f9fafb' }}>
            Running BFS Algorithm...
          </h2>
          <p className="text-sm" style={{ color: '#9ca3af' }}>
            Exploring the warehouse grid to find the shortest path
          </p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: '#6366f1',
                animation: `livePulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── PAGE: GRID (warehouse visualization) ──
  if (page === 'grid') {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: '#0a0f1e' }}
      >
        {/* Header Bar */}
        <header
          className="flex items-center justify-between px-6 shrink-0"
          style={{ height: '64px', borderBottom: '1px solid #1f2937' }}
        >
          <div className="flex items-center gap-3">
            {/* Back to Input button */}
            <button
              onClick={handleBackToInput}
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
              ← Back to Input
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
            🗺️ Warehouse Grid
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

        {/* Grid content */}
        <main className="flex-1 p-6 overflow-auto flex flex-col items-center gap-6">
          {/* Explanation banner */}
          {explanation && (
            <div
              className="w-full max-w-4xl rounded-xl p-4 flex items-start gap-3"
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

          {/* Grid visualization */}
          <div className="w-full max-w-4xl">
            <GridVisualizer
              grid={grid}
              start={start}
              target={target}
              path={path}
              exploredCells={exploredCells}
              phase={phase}
              explorationStep={explorationStep}
              pathStep={pathStep}
            />
          </div>

          {/* Action buttons below grid */}
          <div className="flex gap-4 w-full max-w-md">
            <button
              onClick={handleShowResult}
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
              📤 Show Result
            </button>
            <button
              onClick={handleDownloadJson}
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
          </div>
        </main>
      </div>
    );
  }

  // ── PAGE: RESULT (formatted JSON output) ──
  return (
    <ResultPage
      result={result}
      explanation={explanation}
      onSolveAnother={handleBackToDashboard}
      onBackToGrid={handleBackToGrid}
    />
  );
}
