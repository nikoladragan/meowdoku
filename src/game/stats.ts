import type { Difficulty, GameState, Stats } from './types'

export type StatsKey = Difficulty | 'daily'
export type AllStats = Record<StatsKey, Stats>

export const EMPTY_STATS: AllStats = {
  easy: { wins: 0, bestMs: null },
  normal: { wins: 0, bestMs: null },
  extreme: { wins: 0, bestMs: null },
  daily: { wins: 0, bestMs: null },
}

export const statsKey = (state: GameState): StatsKey => (state.mode === 'daily' ? 'daily' : state.difficulty)

export interface WinResult {
  stats: AllStats
  // false when hints or a retry made this time ineligible for a best
  counts: boolean
  isBest: boolean
}

// A time only counts as a best with no hints and on the first attempt.
export function recordWin(all: AllStats, state: GameState): WinResult {
  const key = statsKey(state)
  const current = all[key]
  const counts = state.hintsUsed === 0 && state.attempt === 1
  const isBest = counts && (current.bestMs === null || state.elapsedMs < current.bestMs)
  const next: Stats = { wins: current.wins + 1, bestMs: isBest ? state.elapsedMs : current.bestMs }
  return { stats: { ...all, [key]: next }, counts, isBest }
}

// 83000 -> '1:23'
export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
