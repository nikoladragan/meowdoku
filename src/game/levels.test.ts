import { describe, expect, it } from 'vitest'
import { generatePuzzle } from './generator'
import { LEVEL_SIZE, levelId, levelNumber, levelPuzzle, levelRange } from './levels'

describe('levels', () => {
  it('maps between level numbers and ids', () => {
    expect(levelId(42)).toBe('level-42')
    expect(levelNumber('level-42')).toBe(42)
  })

  it('ramps up the hardest technique allowed', () => {
    expect(levelRange(1)).toEqual([1, 3])
    expect(levelRange(10)).toEqual([1, 3])
    expect(levelRange(11)).toEqual([2, 4])
    expect(levelRange(30)).toEqual([2, 4])
    expect(levelRange(31)).toEqual([3, 5])
    expect(levelRange(10_000)).toEqual([3, 5])
  })

  it.each([1, 5, 10, 11, 20, 30, 31, 100, 10_000])('level %d is a 10×10 puzzle within its range', (level) => {
    const p = levelPuzzle(level)
    const [min, max] = levelRange(level)
    expect(p.id).toBe(levelId(level))
    expect(p.size).toBe(LEVEL_SIZE)
    expect(p.level).toBeGreaterThanOrEqual(min)
    expect(p.level).toBeLessThanOrEqual(max)
  })

  it('gives everyone the same puzzle for a level', () => {
    expect(levelPuzzle(7)).toEqual(levelPuzzle(7))
    expect(levelPuzzle(7).regions).not.toEqual(levelPuzzle(8).regions)
  })

  it('stays stable for a fixed level', () => {
    expect(levelPuzzle(1)).toMatchSnapshot()
  })

  it('does not change free-play puzzles of the same size', () => {
    expect(generatePuzzle('free-1', 10)).toEqual(generatePuzzle('free-1', 10, [3, 5]))
  })
})
