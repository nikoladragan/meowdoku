import { EMPTY_STATS, type AllStats, type StatsKey } from './stats'
import type { GameState, Mark, Mode, Patch, Puzzle, Settings } from './types'

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

export const DEFAULT_SETTINGS: Settings = { muted: false, vibrate: true, autoCross: true, seenHowTo: false }

// Unknown or malformed fields fall back to their defaults.
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(`${PREFIX}settings`)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (!isObj(parsed)) return { ...DEFAULT_SETTINGS }
    const out = { ...DEFAULT_SETTINGS }
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
      if (typeof parsed[key] === 'boolean') out[key] = parsed[key]
    }
    return out
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(`${PREFIX}settings`, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export function loadStats(): AllStats {
  const out: AllStats = JSON.parse(JSON.stringify(EMPTY_STATS))
  try {
    const raw = localStorage.getItem(`${PREFIX}stats`)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (!isObj(parsed)) return out
    for (const key of Object.keys(out) as StatsKey[]) {
      const v = parsed[key]
      if (isObj(v) && isInt(v.wins, 0, 1e9) && (v.bestMs === null || (typeof v.bestMs === 'number' && v.bestMs >= 0))) {
        out[key] = { wins: v.wins, bestMs: v.bestMs }
      }
    }
  } catch {
    // keep defaults
  }
  return out
}

export function saveStats(stats: AllStats): void {
  try {
    localStorage.setItem(`${PREFIX}stats`, JSON.stringify(stats))
  } catch {
    // ignore
  }
}
