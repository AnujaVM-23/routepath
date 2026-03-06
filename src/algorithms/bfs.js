// PURPOSE: BFS pathfinding — pure JS only
// LAYER: Algorithm — zero React, zero UI imports

/**
 * Breadth-First Search on a 2D grid.
 * @param {number[][]} grid - 2D array: 0=walkable, 1=obstacle, 2=target
 * @param {number[]} start - [row, col] starting position
 * @param {number[]} target - [row, col] target position
 * @returns {{ path: number[][]|null, exploredCells: number[][] }}
 */
export function bfs(grid, start, target) {
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const queue = [[start]];
  const visited = new Set();
  const exploredCells = [];
  visited.add(`${start[0]},${start[1]}`);

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];
    exploredCells.push([...current]);

    if (current[0] === target[0] && current[1] === target[1]) {
      return { path, exploredCells };
    }

    for (const [dr, dc] of directions) {
      const r = current[0] + dr;
      const c = current[1] + dc;
      const key = `${r},${c}`;
      if (
        r < 0 || r >= rows ||
        c < 0 || c >= cols ||
        grid[r][c] === 1 ||
        visited.has(key)
      ) continue;
      visited.add(key);
      queue.push([...path, [r, c]]);
    }
  }

  return { path: null, exploredCells };
}
