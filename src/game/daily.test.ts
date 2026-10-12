import { describe, expect, it } from 'vitest'
import { dailyId, dailyPuzzle, dateKey, formatDay } from './daily'

describe('daily', () => {
  it('builds the date key from local time', () => {
    // 23:59 local on 12 Oct: toISOString() could already say 13 Oct in timezones ahead of UTC
    expect(dateKey(new Date(2026, 9, 12, 23, 59))).toBe('2026-10-12')
    // 00:01 local on 1 Jan: toISOString() could still say 31 Dec in timezones behind UTC
    expect(dateKey(new Date(2027, 0, 1, 0, 1))).toBe('2027-01-01')
  })

  it('formats the day for titles', () => {
    expect(formatDay('2026-10-12')).toBe('12 Oct')
    expect(formatDay('2026-01-03')).toBe('3 Jan')
  })

  it('gives the same puzzle for the same date', () => {
    const a = dailyPuzzle('2026-10-12')
    expect(a.id).toBe(dailyId('2026-10-12'))
    expect(a.size).toBe(9)
    expect(dailyPuzzle('2026-10-12')).toEqual(a)
  })

  it('gives different puzzles for different dates', () => {
    const a = dailyPuzzle('2026-10-12')
    const b = dailyPuzzle('2026-10-13')
    expect(b.regions).not.toEqual(a.regions)
  })
})
