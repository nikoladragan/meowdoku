// Reference prototype for the Meowdoku puzzle generator. Plain JS, no dependencies.
// Port this to TypeScript under src/game/ (see PLAN.md), then delete this folder.
// Run `node reference/generator-prototype.mjs` to self-check and print timings.
//
// Board model
//   n          board size (5, 7, 9 or 10)
//   regions    number[n*n], regions[row * n + col] = region index 0..n-1
//   solution   number[n], solution[row] = column of the cat in that row

// ---------- seeded randomness (integer math only, so results match across browsers) ----------

export function hashString(str) {
  // FNV-1a, 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randInt = (rng, n) => Math.floor(rng() * n);

function shuffle(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// ---------- step 1: a random valid cat placement ----------
// One cat per row and column already rules out orthogonal contact, so the only
// extra check is that cats in neighbouring rows are at least two columns apart.

function randomSolution(rng, n) {
  const sol = new Array(n).fill(-1);
  const used = new Array(n).fill(false);
  function place(r) {
    if (r === n) return true;
    for (const c of shuffle(rng, [...Array(n).keys()])) {
      if (used[c]) continue;
      if (r > 0 && Math.abs(sol[r - 1] - c) < 2) continue;
      used[c] = true;
      sol[r] = c;
      if (place(r + 1)) return true;
      used[c] = false;
    }
    return false;
  }
  place(0);
  return sol;
}

// ---------- step 2: grow one region around each cat ----------
// Region r starts at the cat in row r. Each step assigns one unassigned cell to a
// neighbouring region, picked with a per-region weight so sizes vary.

function growRegions(rng, n, sol) {
  const regions = new Array(n * n).fill(-1);
  for (let r = 0; r < n; r++) regions[r * n + sol[r]] = r;
  const weight = Array.from({ length: n }, () => 0.4 + rng() * 1.6);
  let unassigned = n * n - n;
  while (unassigned > 0) {
    const cands = []; // [cell, region] for every unassigned cell next to a region
    let total = 0;
    for (let i = 0; i < n * n; i++) {
      if (regions[i] !== -1) continue;
      const r = (i / n) | 0;
      const c = i % n;
      for (const [dr, dc] of DIRS) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
        const g = regions[rr * n + cc];
        if (g !== -1) {
          cands.push([i, g]);
          total += weight[g];
        }
      }
    }
    let x = rng() * total;
    let pick = cands[cands.length - 1];
    for (const cand of cands) {
      x -= weight[cand[1]];
      if (x <= 0) {
        pick = cand;
        break;
      }
    }
    regions[pick[0]] = pick[1];
    unassigned--;
  }
  return regions;
}

// ---------- solver: returns up to `limit` solutions ----------

export function solve(n, regions, limit = 2) {
  const out = [];
  const sol = new Array(n).fill(-1);
  const colUsed = new Array(n).fill(false);
  const regUsed = new Array(n).fill(false);
  function rec(r) {
    if (out.length >= limit) return;
    if (r === n) {
      out.push(sol.slice());
      return;
    }
    for (let c = 0; c < n; c++) {
      if (colUsed[c]) continue;
      if (r > 0 && Math.abs(sol[r - 1] - c) < 2) continue;
      const g = regions[r * n + c];
      if (regUsed[g]) continue;
      colUsed[c] = regUsed[g] = true;
      sol[r] = c;
      rec(r + 1);
      colUsed[c] = regUsed[g] = false;
    }
  }
  rec(0);
  return out;
}

// True if region g is still one orthogonally connected piece after removing `removed`
// (pass -1 to test the region as it is).
export function isConnectedWithout(n, regions, g, removed) {
  let start = -1;
  let count = 0;
  for (let i = 0; i < n * n; i++) {
    if (regions[i] === g && i !== removed) {
      count++;
      if (start < 0) start = i;
    }
  }
  if (count === 0) return false;
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const i = stack.pop();
    const r = (i / n) | 0;
    const c = i % n;
    for (const [dr, dc] of DIRS) {
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
      const j = rr * n + cc;
      if (j === removed || regions[j] !== g || seen.has(j)) continue;
      seen.add(j);
      stack.push(j);
    }
  }
  return seen.size === count;
}

// ---------- step 3: repair until the solution is unique ----------
// `alt` is a second solution. Take one of its cats that is not in the intended
// solution and hand that cell to a neighbouring region. Its old region then has no
// cat in `alt`, so `alt` stops being a solution, while the intended solution is
// untouched (the moved cell never holds an intended cat).

function repair(rng, n, regions, sol, alt) {
  const rows = shuffle(rng, [...Array(n).keys()]).filter((r) => alt[r] !== sol[r]);
  for (const r of rows) {
    const c = alt[r];
    const i = r * n + c;
    const g = regions[i];
    if (!isConnectedWithout(n, regions, g, i)) continue;
    const targets = [];
    for (const [dr, dc] of DIRS) {
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
      const h = regions[rr * n + cc];
      if (h !== g && !targets.includes(h)) targets.push(h);
    }
    if (!targets.length) continue;
    regions[i] = targets[randInt(rng, targets.length)];
    return true;
  }
  return false;
}

// ---------- quality gate: avoid giveaway and blob-heavy boards ----------

export function passesQuality(n, regions) {
  const sizes = new Array(n).fill(0);
  for (const g of regions) sizes[g]++;
  const singles = sizes.filter((x) => x === 1).length;
  return singles <= 1 && Math.max(...sizes) <= Math.ceil(n * n * 0.3);
}

// ---------- logic solver: human-style deductions, one step at a time ----------
// Used twice: the generator grades puzzles with it (so every puzzle can be solved
// without guessing), and the hint button asks it for the next step on the player's board.
//
// Units are numbered 0..n-1 rows, n..2n-1 columns, 2n..3n-1 regions.
// A "candidate" is a cell that could still hold a cat.
//
// Techniques, easiest first (the number is the step's `level`):
//   1 single     a unit has one candidate left                     -> place a cat
//   2 confine 1  all candidates of a region sit in one row/column
//                (or all of a row/column sit in one region)        -> cross the rest of that line/region
//   3 blocks     a cat here would leave some other unit empty      -> cross this cell
//   4 confine 2  two regions fit inside two rows/columns (or the
//                reverse)                                          -> cross the other cells there
//   5 confine 3+ the same with three or four units

export function createBoard(n, regions) {
  const N = n * n;
  const unitCells = Array.from({ length: 3 * n }, () => []);
  for (let i = 0; i < N; i++) {
    unitCells[(i / n) | 0].push(i);
    unitCells[n + (i % n)].push(i);
    unitCells[2 * n + regions[i]].push(i);
  }
  const peers = [];
  for (let i = 0; i < N; i++) {
    const r = (i / n) | 0;
    const c = i % n;
    const s = new Set([...unitCells[r], ...unitCells[n + c], ...unitCells[2 * n + regions[i]]]);
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr >= 0 && cc >= 0 && rr < n && cc < n) s.add(rr * n + cc);
      }
    }
    s.delete(i);
    peers.push(s);
  }
  return {
    n,
    regions,
    unitCells,
    peers, // peers[i] = every cell a cat at i rules out
    cand: new Array(N).fill(true),
    cat: new Array(N).fill(false),
    unitDone: new Array(3 * n).fill(false),
    cats: 0,
  };
}

export function boardPlaceCat(board, i) {
  const { n, regions } = board;
  board.cat[i] = true;
  board.cand[i] = false;
  board.cats++;
  board.unitDone[(i / n) | 0] = true;
  board.unitDone[n + (i % n)] = true;
  board.unitDone[2 * n + regions[i]] = true;
  for (const j of board.peers[i]) board.cand[j] = false;
}

function popcount(x) {
  let c = 0;
  while (x) {
    x &= x - 1;
    c++;
  }
  return c;
}

function findSingle(board) {
  const { n, unitCells, cand, unitDone } = board;
  for (let u = 0; u < 3 * n; u++) {
    if (unitDone[u]) continue;
    const cs = unitCells[u].filter((i) => cand[i]);
    if (cs.length === 1) return { technique: 'single', action: 'cat', cells: cs, units: [u], into: [] };
  }
  return null;
}

// k open units of one kind whose candidates all lie inside k units of another kind.
// Those k "into" units are then fully claimed, so every other candidate in them goes.
function findConfinement(board, k) {
  const { n, regions, cand, unitDone } = board;
  const N = n * n;
  const rowOf = (i) => (i / n) | 0;
  const colOf = (i) => i % n;
  const regOf = (i) => regions[i];
  // [index of the confined kind, its unit offset, index of the "into" kind, its unit offset]
  const kinds = [
    [regOf, 2 * n, rowOf, 0],
    [regOf, 2 * n, colOf, n],
    [rowOf, 0, regOf, 2 * n],
    [colOf, n, regOf, 2 * n],
  ];
  for (const [aOf, aBase, bOf, bBase] of kinds) {
    const open = [];
    for (let a = 0; a < n; a++) if (!unitDone[aBase + a]) open.push(a);
    if (open.length <= k) continue;
    const bMask = new Array(n).fill(0);
    for (let i = 0; i < N; i++) if (cand[i]) bMask[aOf(i)] |= 1 << bOf(i);
    const combo = [];
    const search = (start, mask) => {
      if (combo.length === k) {
        if (popcount(mask) !== k) return null;
        const cells = [];
        for (let i = 0; i < N; i++) {
          if (cand[i] && (mask >> bOf(i)) & 1 && !combo.includes(aOf(i))) cells.push(i);
        }
        if (!cells.length) return null;
        const into = [];
        for (let b = 0; b < n; b++) if ((mask >> b) & 1) into.push(bBase + b);
        return { technique: 'confine', action: 'cross', cells, units: combo.map((a) => aBase + a), into };
      }
      for (let x = start; x < open.length; x++) {
        const m = mask | bMask[open[x]];
        if (popcount(m) > k) continue;
        combo.push(open[x]);
        const hit = search(x + 1, m);
        if (hit) return hit;
        combo.pop();
      }
      return null;
    };
    const hit = search(0, 0);
    if (hit) return hit;
  }
  return null;
}

// A candidate whose cat would rule out every candidate of some other open unit.
function findBlocks(board) {
  const { n, regions, unitCells, cand, unitDone, peers } = board;
  for (let i = 0; i < n * n; i++) {
    if (!cand[i]) continue;
    const own = [(i / n) | 0, n + (i % n), 2 * n + regions[i]];
    for (let u = 0; u < 3 * n; u++) {
      if (unitDone[u] || own.includes(u)) continue;
      let any = false;
      let all = true;
      for (const j of unitCells[u]) {
        if (!cand[j]) continue;
        any = true;
        if (!peers[i].has(j)) {
          all = false;
          break;
        }
      }
      if (any && all) return { technique: 'blocks', action: 'cross', cells: [i], units: [u], into: [] };
    }
  }
  return null;
}

// Next deduction on this board using techniques up to `maxLevel`, or null if stuck.
export function findStep(board, maxLevel = 5) {
  let step = findSingle(board);
  if (step) return { level: 1, ...step };
  if (maxLevel >= 2 && (step = findConfinement(board, 1))) return { level: 2, ...step };
  if (maxLevel >= 3 && (step = findBlocks(board))) return { level: 3, ...step };
  if (maxLevel >= 4 && (step = findConfinement(board, 2))) return { level: 4, ...step };
  if (maxLevel >= 5) {
    for (let k = 3; k <= 4; k++) {
      if ((step = findConfinement(board, k))) return { level: 5, ...step };
    }
  }
  return null;
}

export function applyStep(board, step) {
  if (step.action === 'cat') boardPlaceCat(board, step.cells[0]);
  else for (const i of step.cells) board.cand[i] = false;
}

// Solve from an empty board by logic alone. `level` is the hardest technique needed.
export function grade(n, regions, maxLevel = 5) {
  const board = createBoard(n, regions);
  let level = 0;
  while (board.cats < n) {
    const step = findStep(board, maxLevel);
    if (!step) return { solved: false, level, board };
    applyStep(board, step);
    if (step.level > level) level = step.level;
  }
  return { solved: true, level, board };
}

// Allowed hardest-technique range per board size: [min, max].
export const GRADE_RANGE = { 5: [1, 3], 7: [2, 4], 9: [2, 5], 10: [3, 5] };

// ---------- public entry point ----------

export function generate(seed, n) {
  const [minLevel, maxLevel] = GRADE_RANGE[n] ?? [1, 5];
  const rng = mulberry32(seed);
  for (;;) {
    const solution = randomSolution(rng, n);
    const regions = growRegions(rng, n, solution);
    for (let k = 0; k < 200; k++) {
      const sols = solve(n, regions, 2);
      if (sols.length === 1) {
        if (!passesQuality(n, regions)) break; // unique but poor shape: start over
        const g = grade(n, regions, maxLevel);
        if (!g.solved || g.level < minLevel) break; // needs guessing, or too easy for this size
        return { size: n, regions, solution, level: g.level };
      }
      const alt = sols.find((s) => s.some((c, r) => c !== solution[r]));
      if (!repair(rng, n, regions, solution, alt)) break;
    }
  }
}

// ---------- self-check (only when run directly) ----------

function check(n, p) {
  for (let g = 0; g < n; g++) {
    if (!isConnectedWithout(n, p.regions, g, -1)) throw new Error('disconnected or empty region');
  }
  const sols = solve(n, p.regions, 3);
  if (sols.length !== 1) throw new Error('solution is not unique');
  if (sols[0].join() !== p.solution.join()) throw new Error('solution mismatch');
  if (!passesQuality(n, p.regions)) throw new Error('quality gate failed');
  const [minLevel, maxLevel] = GRADE_RANGE[n];
  const g = grade(n, p.regions, maxLevel);
  if (!g.solved) throw new Error('not solvable by logic');
  if (g.level !== p.level || g.level < minLevel) throw new Error('grade out of range');
  for (let r = 0; r < n; r++) {
    if (!g.board.cat[r * n + p.solution[r]]) throw new Error('logic solver disagrees with the solution');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const RUNS = Number(process.argv[2] ?? 200); // 200 takes about 40s; each puzzle is generated twice to prove determinism
  for (const n of [5, 7, 9, 10]) {
    const times = [];
    const levels = [0, 0, 0, 0, 0, 0];
    for (let s = 0; s < RUNS; s++) {
      const seed = hashString(`v1:check-${s}:${n}`);
      const t0 = performance.now();
      const p = generate(seed, n);
      times.push(performance.now() - t0);
      check(n, p);
      levels[p.level]++;
      if (JSON.stringify(generate(seed, n)) !== JSON.stringify(p)) throw new Error('not deterministic');
    }
    times.sort((a, b) => a - b);
    const avg = times.reduce((a, b) => a + b) / RUNS;
    console.log(
      `${n}x${n}: ${RUNS} puzzles ok, avg ${avg.toFixed(2)}ms, p95 ${times[Math.floor(RUNS * 0.95)].toFixed(2)}ms, max ${times[RUNS - 1].toFixed(2)}ms, hardest technique 1-5: ${levels.slice(1).join('/')}`
    );
  }
  const n = 7;
  const p = generate(hashString('v1:daily-2026-10-12:7'), n);
  console.log('\nSample 7x7 (letter = region, * = cat):');
  for (let r = 0; r < n; r++) {
    let line = '';
    for (let c = 0; c < n; c++) {
      line += String.fromCharCode(65 + p.regions[r * n + c]) + (p.solution[r] === c ? '*' : ' ');
    }
    console.log(line);
  }
}
