// Maze generation + ball physics for Tilt Maze, in "cell" units: the maze
// spans x 0..cols and y 0..rows, one cell = 1 unit.

// Perfect maze (exactly one path between any two cells) via randomized
// depth-first search -- long winding corridors suit a tilting game.
export function generateMaze(cols, rows, rand = Math.random) {
  const cells = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ n: true, e: true, s: true, w: true, seen: false }))
  );
  const dirs = [
    ["n", 0, -1, "s"],
    ["e", 1, 0, "w"],
    ["s", 0, 1, "n"],
    ["w", -1, 0, "e"],
  ];
  const stack = [[0, 0]];
  cells[0][0].seen = true;

  while (stack.length) {
    const [c, r] = stack[stack.length - 1];
    const options = dirs.filter(([, dc, dr]) => {
      const nc = c + dc;
      const nr = r + dr;
      return nc >= 0 && nr >= 0 && nc < cols && nr < rows && !cells[nr][nc].seen;
    });
    if (options.length === 0) {
      stack.pop();
      continue;
    }
    const [side, dc, dr, opposite] = options[Math.floor(rand() * options.length)];
    cells[r][c][side] = false;
    cells[r + dr][c + dc][opposite] = false;
    cells[r + dr][c + dc].seen = true;
    stack.push([c + dc, r + dr]);
  }
  return { cols, rows, cells };
}

// Walls as axis-aligned rectangles of the given thickness. Interior walls
// are shared by two cells, so only each cell's north/west walls are emitted,
// plus the outer east and south borders.
export function wallRects({ cols, rows, cells }, thickness) {
  const h = thickness / 2;
  const rects = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      if (cell.n) rects.push({ x: c - h, y: r - h, w: 1 + thickness, h: thickness });
      if (cell.w) rects.push({ x: c - h, y: r - h, w: thickness, h: 1 + thickness });
      if (c === cols - 1 && cell.e) rects.push({ x: c + 1 - h, y: r - h, w: thickness, h: 1 + thickness });
      if (r === rows - 1 && cell.s) rects.push({ x: c - h, y: r + 1 - h, w: 1 + thickness, h: thickness });
    }
  }
  return rects;
}

// Push the ball out of any wall it overlaps and cancel the part of its
// velocity pointing into that wall, so it slides along walls instead of sticking.
export function resolveCollisions(ball, radius, rects) {
  for (let pass = 0; pass < 3; pass++) {
    let hit = false;
    for (const rc of rects) {
      const cx = Math.max(rc.x, Math.min(ball.x, rc.x + rc.w));
      const cy = Math.max(rc.y, Math.min(ball.y, rc.y + rc.h));
      const dx = ball.x - cx;
      const dy = ball.y - cy;
      const distSq = dx * dx + dy * dy;
      if (distSq >= radius * radius || distSq < 1e-12) continue;

      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;
      ball.x += nx * (radius - dist);
      ball.y += ny * (radius - dist);
      const into = ball.vx * nx + ball.vy * ny;
      if (into < 0) {
        ball.vx -= into * nx;
        ball.vy -= into * ny;
      }
      hit = true;
    }
    if (!hit) break;
  }
}
