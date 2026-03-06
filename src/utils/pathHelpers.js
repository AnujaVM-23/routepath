// PURPOSE: Validation, target finding, output formatting
// LAYER: Utility — zero React, zero UI imports

/**
 * Validate JSON input string for warehouse grid data.
 * @param {string} jsonString - Raw JSON string from user input
 * @returns {{ valid: boolean, data?: object, error?: string }}
 */
export function validateInput(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return { valid: false, error: 'Invalid JSON syntax: ' + e.message };
  }

  if (!parsed.grid || !Array.isArray(parsed.grid)) {
    return { valid: false, error: '"grid" must be a 2D array.' };
  }

  if (parsed.grid.length === 0) {
    return { valid: false, error: '"grid" cannot be empty.' };
  }

  for (let i = 0; i < parsed.grid.length; i++) {
    if (!Array.isArray(parsed.grid[i])) {
      return { valid: false, error: `grid[${i}] is not an array.` };
    }
    for (let j = 0; j < parsed.grid[i].length; j++) {
      const cell = parsed.grid[i][j];
      if (cell !== 0 && cell !== 1 && cell !== 2) {
        return { valid: false, error: `Invalid value "${cell}" at grid[${i}][${j}]. Only 0 (walkable), 1 (obstacle), and 2 (item/target) are allowed.` };
      }
    }
  }

  if (!parsed.start || !Array.isArray(parsed.start) || parsed.start.length !== 2) {
    return { valid: false, error: '"start" must be an array of [row, col].' };
  }

  if (!parsed.targets || !Array.isArray(parsed.targets) || parsed.targets.length === 0) {
    return { valid: false, error: '"targets" must be a non-empty array of [row, col] pairs.' };
  }

  const rows = parsed.grid.length;
  const cols = parsed.grid[0].length;
  const [sr, sc] = parsed.start;

  if (sr < 0 || sr >= rows || sc < 0 || sc >= cols) {
    return { valid: false, error: `Start [${sr},${sc}] is out of grid bounds (${rows}×${cols}).` };
  }

  if (parsed.grid[sr][sc] === 1) {
    return { valid: false, error: `Start [${sr},${sc}] is on an obstacle.` };
  }

  // Count items (value 2) — only exactly 1 allowed
  let itemCount = 0;
  for (let i = 0; i < parsed.grid.length; i++) {
    for (let j = 0; j < parsed.grid[i].length; j++) {
      if (parsed.grid[i][j] === 2) itemCount++;
    }
  }
  if (itemCount === 0) {
    return { valid: false, error: 'Grid must contain exactly 1 item (value 2). None found.' };
  }
  if (itemCount > 1) {
    return { valid: false, error: `Grid must contain exactly 1 item (value 2). Found ${itemCount}.` };
  }

  return { valid: true, data: parsed };
}

/**
 * Find the first target cell (value === 2) in the grid.
 * @param {number[][]} grid - 2D grid array
 * @returns {number[]|null} - [row, col] or null if no target found
 */
export function findTarget(grid) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 2) {
        return [r, c];
      }
    }
  }
  return null;
}

/**
 * Build the exact JSON output object matching the required schema.
 * @param {number[][]|null} path - Array of [row,col] steps or null
 * @param {number} timeMs - Execution time in milliseconds
 * @returns {object} Schema-compliant output object
 */
export function buildOutput(path, timeMs) {
  if (!path) {
    return {
      total_steps: 0,
      path: [],
      target_reached: false,
      execution_time_ms: timeMs,
    };
  }
  return {
    total_steps: path.length - 1,
    path: path,
    target_reached: true,
    execution_time_ms: timeMs,
  };
}

/**
 * Generate a natural language explanation of why BFS chose this path.
 * @param {number[][]|null} path - The path found by BFS
 * @param {number[][]} exploredCells - All cells BFS visited
 * @param {number[][]} grid - The original grid
 * @param {number[]} start - Start position
 * @param {number[]} target - Target position
 * @returns {string} Human-readable explanation
 */
export function generateExplanation(path, exploredCells, grid, start, target) {
  if (!path) {
    return `BFS explored ${exploredCells ? exploredCells.length : 0} cells level-by-level but could not find a route from [${start}] to [${target}]. All reachable paths are blocked by obstacles.`;
  }

  const steps = path.length - 1;
  const explored = exploredCells ? exploredCells.length : 0;

  // Collect obstacles
  const obstacles = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 1) obstacles.push(`[${r},${c}]`);
    }
  }

  // Describe moves
  const dirLabel = (from, to) => {
    const dr = to[0] - from[0];
    const dc = to[1] - from[1];
    if (dr === -1) return 'up';
    if (dr === 1) return 'down';
    if (dc === -1) return 'left';
    if (dc === 1) return 'right';
    return '';
  };

  const moves = [];
  for (let i = 1; i < path.length; i++) {
    moves.push(dirLabel(path[i - 1], path[i]));
  }

  const moveStr = moves.join(', then ');
  const obstacleStr = obstacles.length > 0
    ? `avoiding obstacle${obstacles.length > 1 ? 's' : ''} at ${obstacles.join(' and ')}`
    : 'with no obstacles in the way';

  return `BFS explored ${explored} cells level-by-level. It moved ${moveStr}, ${obstacleStr}, reaching the target in ${steps} step${steps !== 1 ? 's' : ''}. This is the shortest possible route.`;
}

/**
 * Build a natural-language explanation of the BFS path result.
 * @param {number[][]|null} path - The BFS path
 * @param {number[][]} exploredCells - All cells BFS explored
 * @param {number[][]} grid - The grid
 * @param {number[]} start - Start position
 * @param {number[]} target - Target position
 * @returns {string} Human-readable explanation
 */
export function buildExplanation(path, exploredCells, grid, start, target) {
  if (!path) {
    return `BFS explored ${exploredCells ? exploredCells.length : 0} cells level-by-level but could not find a route from [${start}] to [${target}]. All reachable cells were visited — the target is blocked by obstacles.`;
  }

  const steps = path.length - 1;
  const explored = exploredCells ? exploredCells.length : 0;

  // Find obstacles in the grid
  const obstacles = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 1) obstacles.push(`[${r},${c}]`);
    }
  }

  // Build direction sequence
  const dirNames = [];
  for (let i = 1; i < path.length; i++) {
    const dr = path[i][0] - path[i - 1][0];
    const dc = path[i][1] - path[i - 1][1];
    if (dr === -1) dirNames.push('up');
    else if (dr === 1) dirNames.push('down');
    else if (dc === -1) dirNames.push('left');
    else if (dc === 1) dirNames.push('right');
  }

  const dirSummary = dirNames.length > 0
    ? dirNames.map((d, i) => `${i === 0 ? d : d}`).join(' then ')
    : '';

  const obstacleNote = obstacles.length > 0
    ? `, avoiding obstacle${obstacles.length > 1 ? 's' : ''} at ${obstacles.join(' and ')}`
    : '';

  return `BFS explored ${explored} cells level-by-level. It moved ${dirSummary}${obstacleNote}, reaching the target in ${steps} step${steps !== 1 ? 's' : ''}. This is the shortest possible route guaranteed by BFS.`;
}
