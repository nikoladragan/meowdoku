import type { GameState, Mark, Mode, Patch, Puzzle } from './types'

const PREFIX = 'meowdoku:v1:'
const gameKey = (mode: Mode) => `${PREFIX}game:${mode}`

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const isInt = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max
const isIntArray = (v: unknown, len: number, max: number): v is number[] =>
  Array.isArray(v) && v.length === len && v.every((x) => isInt(x, 0, max))
const MARKS: Mark[] = ['empty', 'cross', 'cat']

function isPuzzle(v: unknown): v is Puzzle {
  if (!isObj(v) || typeof v.id !== 'string' || !isInt(v.size, 5, 10) || !isInt(v.level, 1, 5)) return false
  const n = v.size
  return isIntArray(v.regions, n * n, n - 1) && isIntArray(v.solution, n, n - 1)
}

function isPatch(v: unknown, cells: number): v is Patch {
  return (
    isObj(v) &&
    Array.isArray(v.cells) &&
    v.cells.every((c) => isInt(c, 0, cells - 1)) &&
    Array.isArray(v.before) &&
    v.before.length === v.cells.length &&
    v.before.every((m) => MARKS.includes(m as Mark))
  )
}

export function isGameState(v: unknown): v is GameState {
  if (!isObj(v) || !isPuzzle(v.puzzle)) return false
  const cells = v.puzzle.size * v.puzzle.size
  return (
    (v.mode === 'free' || v.mode === 'daily') &&
    ['easy', 'normal', 'hard', 'extreme'].includes(v.difficulty as string) &&
    Array.isArray(v.marks) &&
    v.marks.length === cells &&
    v.marks.every((m) => MARKS.includes(m as Mark)) &&
    isInt(v.lives, 0, 3) &&
    ['playing', 'won', 'lost'].includes(v.status as string) &&
    Array.isArray(v.history) &&
    v.history.every((p) => isPatch(p, cells)) &&
    typeof v.elapsedMs === 'number' &&
    Number.isFinite(v.elapsedMs) &&
    isInt(v.hintsUsed, 0, 1e6) &&
    isInt(v.attempt, 1, 1e6)
  )
}

// lastEvent is never stored, otherwise sounds and animations would replay on load.
export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(gameKey(state.mode), JSON.stringify({ ...state, lastEvent: null }))
  } catch {
    // storage full or unavailable: the game just isn't saved
  }
}

export function loadGame(mode: Mode): GameState | null {
  try {
    const raw = localStorage.getItem(gameKey(mode))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isGameState(parsed) || parsed.mode !== mode) return null
    return { ...parsed, lastEvent: null }
  } catch {
    return null
  }
}

export function clearGame(mode: Mode): void {
  try {
    localStorage.removeItem(gameKey(mode))
  } catch {
    // ignore
  }
}
