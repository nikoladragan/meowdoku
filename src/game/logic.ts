// Human-style deduction solver. Units: 0..n-1 rows, n..2n-1 columns, 2n..3n-1 regions.
// A "candidate" is a cell that could still hold a cat.

export interface LogicBoard {
  n: number
  regions: number[]
  unitCells: number[][]
  peers: Set<number>[] // peers[i] = every cell a cat at i rules out
  cand: boolean[]
  cat: boolean[]
  unitDone: boolean[]
  cats: number
}

export type Technique = 'single' | 'confine' | 'blocks'

export interface Step {
  level: number
  technique: Technique
  action: 'cat' | 'cross'
  cells: number[]
  units: number[]
  into: number[]
}

type RawStep = Omit<Step, 'level'>

// The row, column and region unit of a cell.
export function unitsOf(n: number, regions: number[], cell: number): number[] {
  return [(cell / n) | 0, n + (cell % n), 2 * n + regions[cell]]
}

// Every cell a cat at `cell` rules out: its row, column, region and the cells touching it.
export function peerCells(n: number, regions: number[], cell: number): number[] {
  const row = (cell / n) | 0
  const col = cell % n
  const out: number[] = []
  for (let i = 0; i < n * n; i++) {
    if (i === cell) continue
    const r = (i / n) | 0
    const c = i % n
    if (r === row || c === col || regions[i] === regions[cell] || (Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1)) {
      out.push(i)
    }
  }
  return out
}

export function createBoard(n: number, regions: number[]): LogicBoard {
  const N = n * n
  const unitCells: number[][] = Array.from({ length: 3 * n }, () => [])
  for (let i = 0; i < N; i++) {
    for (const u of unitsOf(n, regions, i)) unitCells[u].push(i)
  }
  return {
    n,
    regions,
    unitCells,
    peers: Array.from({ length: N }, (_, i) => new Set(peerCells(n, regions, i))),
    cand: new Array<boolean>(N).fill(true),
    cat: new Array<boolean>(N).fill(false),
    unitDone: new Array<boolean>(3 * n).fill(false),
    cats: 0,
  }
}

export function boardPlaceCat(board: LogicBoard, i: number): void {
  const { n, regions } = board
  board.cat[i] = true
  board.cand[i] = false
  board.cats++
  for (const u of unitsOf(n, regions, i)) board.unitDone[u] = true
  for (const j of board.peers[i]) board.cand[j] = false
}

function popcount(x: number): number {
  let c = 0
  while (x) {
    x &= x - 1
    c++
  }
  return c
}

function findSingle(board: LogicBoard): RawStep | null {
  const { n, unitCells, cand, unitDone } = board
  for (let u = 0; u < 3 * n; u++) {
    if (unitDone[u]) continue
    const cs = unitCells[u].filter((i) => cand[i])
    if (cs.length === 1) return { technique: 'single', action: 'cat', cells: cs, units: [u], into: [] }
  }
  return null
}

// k open units of one kind whose candidates all lie inside k units of another kind.
// Those k "into" units are then fully claimed, so every other candidate in them goes.
function findConfinement(board: LogicBoard, k: number): RawStep | null {
  const { n, regions, cand, unitDone } = board
  const N = n * n
  const rowOf = (i: number) => (i / n) | 0
  const colOf = (i: number) => i % n
  const regOf = (i: number) => regions[i]
  type Of = (i: number) => number
  // [index of the confined kind, its unit offset, index of the "into" kind, its unit offset]
  const kinds: [Of, number, Of, number][] = [
    [regOf, 2 * n, rowOf, 0],
    [regOf, 2 * n, colOf, n],
    [rowOf, 0, regOf, 2 * n],
    [colOf, n, regOf, 2 * n],
  ]
  for (const [aOf, aBase, bOf, bBase] of kinds) {
    const open: number[] = []
    for (let a = 0; a < n; a++) if (!unitDone[aBase + a]) open.push(a)
    if (open.length <= k) continue
    const bMask = new Array<number>(n).fill(0)
    for (let i = 0; i < N; i++) if (cand[i]) bMask[aOf(i)] |= 1 << bOf(i)
    const combo: number[] = []
    const search = (start: number, mask: number): RawStep | null => {
      if (combo.length === k) {
        if (popcount(mask) !== k) return null
        const cells: number[] = []
        for (let i = 0; i < N; i++) {
          if (cand[i] && (mask >> bOf(i)) & 1 && !combo.includes(aOf(i))) cells.push(i)
        }
        if (!cells.length) return null
        const into: number[] = []
        for (let b = 0; b < n; b++) if ((mask >> b) & 1) into.push(bBase + b)
        return { technique: 'confine', action: 'cross', cells, units: combo.map((a) => aBase + a), into }
      }
      for (let x = start; x < open.length; x++) {
        const m = mask | bMask[open[x]]
        if (popcount(m) > k) continue
        combo.push(open[x])
        const hit = search(x + 1, m)
        if (hit) return hit
        combo.pop()
      }
      return null
    }
    const hit = search(0, 0)
    if (hit) return hit
  }
  return null
}

// A candidate whose cat would rule out every candidate of some other open unit.
function findBlocks(board: LogicBoard): RawStep | null {
  const { n, regions, unitCells, cand, unitDone, peers } = board
  for (let i = 0; i < n * n; i++) {
    if (!cand[i]) continue
    const own = unitsOf(n, regions, i)
    for (let u = 0; u < 3 * n; u++) {
      if (unitDone[u] || own.includes(u)) continue
      let any = false
      let all = true
      for (const j of unitCells[u]) {
        if (!cand[j]) continue
        any = true
        if (!peers[i].has(j)) {
          all = false
          break
        }
      }
      if (any && all) return { technique: 'blocks', action: 'cross', cells: [i], units: [u], into: [] }
    }
  }
  return null
}

// Next deduction on this board using techniques up to `maxLevel`, or null if stuck.
export function findStep(board: LogicBoard, maxLevel = 5): Step | null {
  let step = findSingle(board)
  if (step) return { level: 1, ...step }
  if (maxLevel >= 2 && (step = findConfinement(board, 1))) return { level: 2, ...step }
  if (maxLevel >= 3 && (step = findBlocks(board))) return { level: 3, ...step }
  if (maxLevel >= 4 && (step = findConfinement(board, 2))) return { level: 4, ...step }
  if (maxLevel >= 5) {
    for (let k = 3; k <= 4; k++) {
      if ((step = findConfinement(board, k))) return { level: 5, ...step }
    }
  }
  return null
}

export function applyStep(board: LogicBoard, step: Step): void {
  if (step.action === 'cat') boardPlaceCat(board, step.cells[0])
  else for (const i of step.cells) board.cand[i] = false
}

// Solve from an empty board by logic alone. `level` is the hardest technique needed.
export function grade(n: number, regions: number[], maxLevel = 5) {
  const board = createBoard(n, regions)
  let level = 0
  while (board.cats < n) {
    const step = findStep(board, maxLevel)
    if (!step) return { solved: false, level, board }
    applyStep(board, step)
    if (step.level > level) level = step.level
  }
  return { solved: true, level, board }
}

// Allowed hardest-technique range per board size: [min, max].
export const GRADE_RANGE: Record<number, [number, number]> = { 5: [1, 3], 7: [2, 4], 9: [2, 5], 10: [3, 5] }
