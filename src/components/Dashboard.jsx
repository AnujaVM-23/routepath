// PURPOSE: Professional dashboard — landing page with stats, quick actions, recent activity
// LAYER: UI Component — display + navigation
export default function Dashboard({ history, onNavigate }) {
  // Compute stats from history
  const totalRuns = history.length;
  const successRuns = history.filter((h) => h.targetReached).length;
  const failedRuns = totalRuns - successRuns;
  const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0;
  const avgSteps =
    totalRuns > 0
      ? (history.reduce((sum, h) => sum + (h.totalSteps || 0), 0) / totalRuns).toFixed(1)
      : '—';
  const avgTime =
    totalRuns > 0
      ? (history.reduce((sum, h) => sum + (h.executionTimeMs || 0), 0) / totalRuns).toFixed(1)
      : '—';
  const lastRun = history.length > 0 ? history[0] : null;

  const statCards = [
    { label: 'Total Runs', value: totalRuns, icon: '🔄', color: '#6366f1', bg: '#312e81' },
    { label: 'Success Rate', value: totalRuns > 0 ? `${successRate}%` : '—', icon: '✅', color: '#10b981', bg: '#064e3b' },
    { label: 'Failed', value: failedRuns, icon: '❌', color: '#ef4444', bg: '#7f1d1d' },
    { label: 'Avg Steps', value: avgSteps, icon: '👣', color: '#f59e0b', bg: '#78350f' },
    { label: 'Avg Time', value: avgTime === '—' ? '—' : `${avgTime}ms`, icon: '⚡', color: '#06b6d4', bg: '#164e63' },
    { label: 'Last Grid', value: lastRun ? lastRun.gridDimensions : '—', icon: '📐', color: '#8b5cf6', bg: '#4c1d95' },
  ];

  const quickActions = [
    { label: 'New Pathfind', desc: 'Enter JSON or build a grid visually', icon: '🚀', page: 'input', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { label: 'View History', desc: 'Browse all previous path results', icon: '📜', page: 'history', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  ];

  const recentEntries = history.slice(0, 5);

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
        <div className="flex items-center gap-3">
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
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#312e81', color: '#a5b4fc' }}
          >
            Dashboard
          </span>
        </div>
        <span className="text-sm hidden md:block" style={{ color: '#9ca3af' }}>
          Warehouse BFS Pathfinder
        </span>
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

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Welcome banner */}
          <div
            className="rounded-2xl p-6 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e3a5f)',
              border: '1px solid #4338ca40',
            }}
          >
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: '#f9fafb' }}>
                Welcome to RouteMaster
              </h1>
              <p className="text-sm" style={{ color: '#a5b4fc' }}>
                Optimize warehouse picking routes with BFS pathfinding. Start a new solve or review past results.
              </p>
            </div>
            <button
              onClick={() => onNavigate('input')}
              className="shrink-0 rounded-xl font-semibold text-sm px-6 py-3 transition-all duration-200 flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.15)';
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🚀 New Pathfind
            </button>
          </div>

          {/* Stats Grid */}
          <div>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#9ca3af' }}>
              📊 OVERVIEW
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {statCards.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-4 flex flex-col gap-2 transition-transform duration-150"
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = s.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#374151';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{s.icon}</span>
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: s.color }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1 flex flex-col gap-3">
              <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#9ca3af' }}>
                ⚡ QUICK ACTIONS
              </h2>
              {quickActions.map((a) => (
                <button
                  key={a.page}
                  onClick={() => onNavigate(a.page)}
                  className="rounded-xl p-4 flex items-center gap-4 text-left transition-all duration-200 w-full"
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div
                    className="shrink-0 flex items-center justify-center rounded-lg text-2xl"
                    style={{
                      width: '48px',
                      height: '48px',
                      background: a.gradient,
                    }}
                  >
                    {a.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#f9fafb' }}>
                      {a.label}
                    </p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>
                      {a.desc}
                    </p>
                  </div>
                </button>
              ))}

              {/* Success ring */}
              <div
                className="rounded-xl p-5 flex flex-col items-center gap-3"
                style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
              >
                <p className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
                  SUCCESS RATE
                </p>
                <div className="relative" style={{ width: '100px', height: '100px' }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="#1f2937"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke={successRate >= 70 ? '#10b981' : successRate >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="3"
                      strokeDasharray={`${successRate} ${100 - successRate}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div
                    className="absolute inset-0 flex items-center justify-center text-lg font-bold"
                    style={{ color: successRate >= 70 ? '#10b981' : successRate >= 40 ? '#f59e0b' : '#ef4444' }}
                  >
                    {totalRuns > 0 ? `${successRate}%` : '—'}
                  </div>
                </div>
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  {successRuns} of {totalRuns} paths reached target
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#9ca3af' }}>
                  🕐 RECENT ACTIVITY
                </h2>
                {history.length > 5 && (
                  <button
                    onClick={() => onNavigate('history')}
                    className="text-xs font-medium px-2 py-1 rounded-lg transition-colors duration-150"
                    style={{ color: '#6366f1', cursor: 'pointer', background: 'none', border: 'none' }}
                  >
                    View All →
                  </button>
                )}
              </div>

              {recentEntries.length === 0 ? (
                <div
                  className="rounded-xl p-10 flex flex-col items-center justify-center gap-3 text-center"
                  style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                >
                  <span className="text-4xl">📭</span>
                  <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                    No activity yet
                  </p>
                  <p className="text-xs" style={{ color: '#4b5563' }}>
                    Run your first pathfind to see results here
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                >
                  {/* Table header */}
                  <div
                    className="grid gap-2 px-4 py-2.5 text-xs font-semibold"
                    style={{
                      gridTemplateColumns: '40px 1fr 1fr 70px 70px 80px 90px',
                      color: '#6b7280',
                      borderBottom: '1px solid #1f2937',
                      backgroundColor: '#0d1117',
                    }}
                  >
                    <span>#</span>
                    <span>Grid</span>
                    <span>Route</span>
                    <span>Steps</span>
                    <span>Time</span>
                    <span>Status</span>
                    <span>When</span>
                  </div>
                  {/* Rows */}
                  {recentEntries.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="grid gap-2 px-4 py-3 text-xs font-mono transition-colors duration-100"
                      style={{
                        gridTemplateColumns: '40px 1fr 1fr 70px 70px 80px 90px',
                        color: '#d1d5db',
                        borderBottom: idx < recentEntries.length - 1 ? '1px solid #1f2937' : 'none',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1f293740';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span style={{ color: '#6b7280' }}>{history.length - idx}</span>
                      <span>{entry.gridDimensions}</span>
                      <span>
                        [{entry.start[0]},{entry.start[1]}] → [{entry.target[0]},{entry.target[1]}]
                      </span>
                      <span style={{ color: '#6366f1', fontWeight: 600 }}>{entry.totalSteps}</span>
                      <span style={{ color: '#f59e0b' }}>{entry.executionTimeMs}ms</span>
                      <span>
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: entry.targetReached ? '#064e3b' : '#7f1d1d',
                            color: entry.targetReached ? '#10b981' : '#ef4444',
                          }}
                        >
                          {entry.targetReached ? 'Reached' : 'Blocked'}
                        </span>
                      </span>
                      <span style={{ color: '#6b7280' }}>
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Algorithm info card */}
              <div
                className="rounded-xl p-5 flex items-start gap-4"
                style={{ backgroundColor: '#111827', border: '1px solid #374151' }}
              >
                <div
                  className="shrink-0 flex items-center justify-center rounded-lg text-xl"
                  style={{ width: '44px', height: '44px', backgroundColor: '#1e3a5f' }}
                >
                  🧠
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#f9fafb' }}>
                    BFS Pathfinding Algorithm
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
                    Breadth-First Search guarantees the shortest path in an unweighted grid.
                    It explores all neighbors at each depth level before moving deeper, making it
                    ideal for warehouse picking route optimization.
                  </p>
                  <div className="flex gap-3 mt-2">
                    {[
                      { label: 'Time', value: 'O(V+E)' },
                      { label: 'Space', value: 'O(V)' },
                      { label: 'Optimal', value: 'Yes' },
                    ].map((m) => (
                      <span
                        key={m.label}
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#1f2937', color: '#06b6d4' }}
                      >
                        {m.label}: {m.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="flex items-center justify-center px-6 shrink-0"
        style={{ height: '48px', borderTop: '1px solid #1f2937' }}
      >
        <p className="text-xs" style={{ color: '#4b5563' }}>
          RouteMaster — Warehouse BFS Pathfinder
        </p>
      </footer>
    </div>
  );
}
