import type { Difficulty, GameEvent, GameState, Mark, Mode, Patch, Puzzle } from './types'

export const START_LIVES = 3
const HISTORY_CAP = 500

export type Action =
  | { type: 'start'; state: GameState }
  | { type: 'toggleCross'; cell: number }
  | { type: 'placeCat'; cell: number; fromDoubleTap?: boolean }
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
  return { kind, cell, autoCrossed: [], seq: (state.lastEvent?.seq ?? 0) + 1 }
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

function placeCat(state: GameState, cell: number, fromDoubleTap: boolean): GameState {
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
    const before = marks[cell]
    const nextMarks = setMark(marks, cell, 'cat')
    const won = nextMarks.filter((m) => m === 'cat').length === size
    return {
      ...state,
      marks: nextMarks,
      history: pushPatch(history, { cells: [cell], before: [before] }),
      status: won ? 'won' : 'playing',
      lastEvent: event(state, won ? 'win' : 'cat', cell),
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
    case 'toggleCross':
      return state.status === 'playing' ? toggleCross(state, action.cell) : state
    case 'placeCat':
      return state.status === 'playing' ? placeCat(state, action.cell, action.fromDoubleTap ?? false) : state
  }
}
