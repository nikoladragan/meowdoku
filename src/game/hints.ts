import { boardPlaceCat, createBoard, findBlocks, findStep, touches, type LogicBoard, type RawStep } from './logic'
import type { GameState } from './types'

export interface Hint {
  kind: 'wrongCross' | 'catExclusion' | 'single' | 'confine' | 'blocks' | 'reveal'
  action: 'cat' | 'cross' | 'uncross'
  cells: number[] // cells the player should act on
  units: number[] // rows, columns or regions that explain it
  into: number[] // confine only: the lines or regions being claimed
  reasonCells: number[] // what it rests on: the cat (catExclusion) or the spots left in `units` (blocks, confine)
}

const hint = (kind: Hint['kind'], action: Hint['action'], cells: number[], extra: Partial<Hint> = {}): Hint => ({
  kind,
  action,
  cells,
  units: [],
  into: [],
  reasonCells: [],
  ...extra,
})

// The cells of these units that could still hold a cat.
function spotsLeft(board: LogicBoard, units: number[]): number[] {
  return units.flatMap((u) => board.unitCells[u].filter((i) => board.cand[i]))
}

// The blocking move that is easiest to check by eye: fewest spots that do not touch the cell,
// then fewest spots. The first one in board order is often a far-fetched one in the top corner.
function clearestBlock(board: LogicBoard): RawStep {
  const cost = (step: RawStep) => {
    const spots = spotsLeft(board, step.units)
    return spots.filter((j) => !touches(board.n, step.cells[0], j)).length * 100 + spots.length
  }
  return findBlocks(board).reduce((best, step) => (cost(step) < cost(best) ? step : best))
}

// The next thing the player should do on their current board.
export function getHint(state: GameState): Hint {
  const { size, solution, regions } = state.puzzle
  const { marks } = state

  // 1. A cross sitting on a cell where a cat belongs.
  for (let i = 0; i < marks.length; i++) {
    if (marks[i] === 'cross' && solution[(i / size) | 0] === i % size) {
      return hint('wrongCross', 'uncross', [i])
    }
  }

  // The logic board: every cat placed, every crossed cell no longer a candidate.
  const board = createBoard(size, regions)
  for (let i = 0; i < marks.length; i++) if (marks[i] === 'cat') boardPlaceCat(board, i)
  for (let i = 0; i < marks.length; i++) if (marks[i] === 'cross' || marks[i] === 'miss') board.cand[i] = false

  // 2. Empty cells a placed cat rules out. Only happens with auto-cross off or after removing a cross.
  for (let i = 0; i < marks.length; i++) {
    if (marks[i] !== 'cat') continue
    const cells = [...board.peers[i]].filter((j) => marks[j] === 'empty').sort((a, b) => a - b)
    if (cells.length) return hint('catExclusion', 'cross', cells, { reasonCells: [i] })
  }

  // 3. The next logic step, always with all five levels.
  const found = findStep(board, 5)
  if (found) {
    const step = found.technique === 'blocks' ? clearestBlock(board) : found
    const reasonCells = step.action === 'cross' ? spotsLeft(board, step.units) : []
    return hint(step.technique, step.action, step.cells, { units: step.units, into: step.into, reasonCells })
  }

  // 4. Safety net: show where the first missing cat goes.
  for (let r = 0; r < size; r++) {
    if (!marks.slice(r * size, r * size + size).includes('cat')) {
      return hint('reveal', 'cat', [r * size + solution[r]])
    }
  }
  return hint('reveal', 'cat', [])
}
