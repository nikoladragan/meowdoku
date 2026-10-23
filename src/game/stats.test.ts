import { describe, expect, it } from 'vitest'
import { generatePuzzle } from './generator'
import { createGameState } from './reducer'
import { EMPTY_STATS, formatTime, recordWin } from './stats'

const base = createGameState('free', 'easy', generatePuzzle('free-1', 5))
const won = (over: Partial<typeof base>) => ({ ...base, status: 'won' as const, elapsedMs: 60_000, ...over })

describe('recordWin', () => {
  it('records the first clean win as a best', () => {
    const r = recordWin(EMPTY_STATS, won({}))
    expect(r.isBest).toBe(true)
    expect(r.stats.easy).toEqual({ wins: 1, bestMs: 60_000 })
  })

  it('keeps the old best when the new time is slower', () => {
    const first = recordWin(EMPTY_STATS, won({})).stats
    const r = recordWin(first, won({ elapsedMs: 90_000 }))
    expect(r.isBest).toBe(false)
    expect(r.stats.easy).toEqual({ wins: 2, bestMs: 60_000 })
  })

  it('replaces the best when faster', () => {
    const first = recordWin(EMPTY_STATS, won({})).stats
    expect(recordWin(first, won({ elapsedMs: 30_000 })).stats.easy.bestMs).toBe(30_000)
  })

  it('does not count a time with hints or a retry', () => {
    for (const over of [{ hintsUsed: 1 }, { attempt: 2 }]) {
      const r = recordWin(EMPTY_STATS, won(over))
      expect(r.counts).toBe(false)
      expect(r.isBest).toBe(false)
      expect(r.stats.easy).toEqual({ wins: 1, bestMs: null })
    }
  })

  it('files the daily under its own key', () => {
    const r = recordWin(EMPTY_STATS, won({ mode: 'daily', difficulty: 'extreme' }))
    expect(r.stats.daily.bestMs).toBe(60_000)
    expect(r.stats.extreme.wins).toBe(0)
  })
})

describe('formatTime', () => {
  it('formats m:ss', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(9_999)).toBe('0:09')
    expect(formatTime(83_000)).toBe('1:23')
    expect(formatTime(3_725_000)).toBe('62:05')
  })
})
