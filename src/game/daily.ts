import { debugDate } from './debug'
import { generatePuzzle } from './generator'
import { clearGame, loadGame } from './storage'
import type { GameState, Puzzle } from './types'

export const DAILY_SIZE = 9
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (n: number) => String(n).padStart(2, '0')

// YYYY-MM-DD from the LOCAL year, month and day. toISOString() is UTC and would flip the
// puzzle at the wrong time for most players.
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayKey(): string {
  return debugDate ?? dateKey(new Date())
}

export const dailyId = (key: string) => `daily-${key}`

export function dailyPuzzle(key: string): Puzzle {
  return generatePuzzle(dailyId(key), DAILY_SIZE)
}

// '2026-10-12' -> '12 Oct'
export function formatDay(key: string): string {
  const [, m, d] = key.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]}`
}

// The saved daily game, only if it belongs to today's puzzle.
export function loadTodaysDaily(): GameState | null {
  const saved = loadGame('daily')
  if (!saved) return null
  if (saved.puzzle.id !== dailyId(todayKey())) {
    clearGame('daily')
    return null
  }
  return saved
}
