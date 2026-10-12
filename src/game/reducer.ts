import type { Difficulty, GameEvent, GameState, Mark, Mode, Patch, Puzzle } from './types'

export const START_LIVES = 3
const HISTORY_CAP = 500

export type Action =
  | { type: 'start'; state: GameState }
  | { type: 'toggleCross'; cell: number }
  | { type: 'placeCat'; cell: number; fromDoubleTap?: boolean; autoCross?: boolean }
  | { type: 'crossCells'; cells: number[] }
  | { type: 'undo' }
  | { type: 'tick'; deltaMs: number }
  | { type: 'hintShown' }
  | { type: 'retry' }

export function createGameState(mode: Mode, difficulty: Difficulty, puzzle: Puzzle): GameState {
  return {
    mode,
    difficulty,
    puzzle,
    marks: new Array<Mark>(puzzle.size * puzzle.size).fill('empty'),
    lives: START_LIVES,
    status: 'playing',
    history: [],
    elapsedMs: 0,
    hintsUsed: 0,
    attempt: 1,
    lastEvent: null,
  }
}

function event(state: GameState, kind: GameEvent['kind'], cell: number): GameEvent {
  return { kind, cell, autoCrossed: [], restored: [], seq: (state.lastEvent?.seq ?? 0) + 1 }
}

function pushPatch(history: Patch[], patch: Patch): Patch[] {
  const next = [...history, patch]
  return next.length > HISTORY_CAP ? next.slice(next.length - HISTORY_CAP) : next
}

function setMark(marks: Mark[], cell: number, mark: Mark): Mark[] {
  const next = marks.slice()
  next[cell] = mark
  return next
}

function toggleCross(state: GameState, cell: number): GameState {
  const before = state.marks[cell]
  if (before === 'cat') return state
  const after: Mark = before === 'empty' ? 'cross' : 'empty'
  return {
    ...state,
    marks: setMark(state.marks, cell, after),
    history: pushPatch(state.history, { cells: [cell], before: [before] }),
    lastEvent: event(state, after === 'cross' ? 'cross' : 'uncross', cell),
  }
}

// Every cell a cat at `cell` rules out: its row, column, region and the cells touching it.
function peerCells(size: number, regions: number[], cell: number): number[] {
  const row = (cell / size) | 0
  const col = cell % size
  const out: number[] = []
  for (let i = 0; i < size * size; i++) {
    if (i === cell) continue
    const r = (i / size) | 0
    const c = i % size
    if (r === row || c === col || regions[i] === regions[cell] || (Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1)) {
      out.push(i)
    }
  }
  return out
}

function placeCat(state: GameState, cell: number, fromDoubleTap: boolean, autoCross: boolean): GameState {
  if (state.marks[cell] === 'cat') return state
  let { marks, history } = state

  // The first tap of a double-tap already toggled this cell. Take that back so the
  // whole double-tap is one step.
  const last = history[history.length - 1]
  if (fromDoubleTap && last && last.cells.length === 1 && last.cells[0] === cell) {
    marks = setMark(marks, cell, last.before[0])
    history = history.slice(0, -1)
  }

  const { size, solution } = state.puzzle
  const row = (cell / size) | 0
  const col = cell % size

  if (solution[row] === col) {
    const nextMarks = setMark(marks, cell, 'cat')
    const cells = [cell]
    const before: Mark[] = [marks[cell]]
    const autoCrossed: number[] = []
    if (autoCross) {
      for (const i of peerCells(size, state.puzzle.regions, cell)) {
        if (nextMarks[i] !== 'empty') continue
        nextMarks[i] = 'cross'
        autoCrossed.push(i)
        cells.push(i)
        before.push('empty')
      }
    }
    const won = nextMarks.filter((m) => m === 'cat').length === size
    return {
      ...state,
      marks: nextMarks,
      history: pushPatch(history, { cells, before }),
      status: won ? 'won' : 'playing',
      lastEvent: { ...event(state, won ? 'win' : 'cat', cell), autoCrossed },
    }
  }

  const lives = state.lives - 1
  const lost = lives === 0
  return {
    ...state,
    marks: setMark(marks, cell, 'cross'),
    history,
    lives,
    status: lost ? 'lost' : 'playing',
    lastEvent: event(state, lost ? 'lose' : 'miss', cell),
  }
}

// Crosses every empty cell in the list as one patch (used when a hint is applied).
function crossCells(state: GameState, cells: number[]): GameState {
  const targets = cells.filter((c) => state.marks[c] === 'empty')
  if (!targets.length) return state
  const marks = state.marks.slice()
  for (const c of targets) marks[c] = 'cross'
  return {
    ...state,
    marks,
    history: pushPatch(state.history, { cells: targets, before: targets.map(() => 'empty' as Mark) }),
    lastEvent: event(state, 'cross', targets[0]),
  }
}

// Takes back the newest patch. Never touches lives, hintsUsed or elapsedMs.
function undo(state: GameState): GameState {
  const patch = state.history[state.history.length - 1]
  if (!patch) return state
  const marks = state.marks.slice()
  patch.cells.forEach((cell, i) => {
    marks[cell] = patch.before[i]
  })
  return {
    ...state,
    marks,
    history: state.history.slice(0, -1),
    lastEvent: { ...event(state, 'undo', -1), restored: patch.cells },
  }
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'start':
      return action.state
    case 'retry':
      return {
        ...createGameState(state.mode, state.difficulty, state.puzzle),
        attempt: state.attempt + 1,
        lastEvent: null,
      }
    case 'hintShown':
      return { ...state, hintsUsed: state.hintsUsed + 1 }
    case 'crossCells':
      return state.status === 'playing' ? crossCells(state, action.cells) : state
    case 'tick':
      return state.status === 'playing' ? { ...state, elapsedMs: state.elapsedMs + action.deltaMs } : state
    case 'undo':
      return state.status === 'playing' ? undo(state) : state
    case 'toggleCross':
      return state.status === 'playing' ? toggleCross(state, action.cell) : state
    case 'placeCat':
      return state.status === 'playing' ? placeCat(state, action.cell, action.fromDoubleTap ?? false, action.autoCross ?? false) : state
  }
}
