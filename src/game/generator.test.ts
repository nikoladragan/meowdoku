import { describe, expect, it } from 'vitest'
import { generatePuzzle, passesQuality } from './generator'
import { grade, GRADE_RANGE } from './logic'
import { isConnectedWithout, solve } from './solver'

const SEEDS: Record<number, number> = { 5: 100, 7: 100, 9: 100, 10: 100 }

describe.each([5, 7, 9, 10])('generator %dx%d', (n) => {
  it(`produces valid, unique, logic-solvable puzzles over ${SEEDS[n]} seeds`, () => {
    const [minLevel, maxLevel] = GRADE_RANGE[n]
    for (let s = 0; s < SEEDS[n]; s++) {
      const p = generatePuzzle(`free-${s}`, n)
      expect(p.size).toBe(n)
      expect(p.regions).toHaveLength(n * n)
      expect(new Set(p.regions).size).toBe(n)
      for (let g = 0; g < n; g++) expect(isConnectedWithout(n, p.regions, g, -1)).toBe(true)

      const sols = solve(n, p.regions, 3)
      expect(sols).toHaveLength(1)
      expect(sols[0]).toEqual(p.solution)

      expect(passesQuality(n, p.regions)).toBe(true)

      const g = grade(n, p.regions, maxLevel)
      expect(g.solved).toBe(true)
      expect(g.level).toBe(p.level)
      expect(g.level).toBeGreaterThanOrEqual(minLevel)
      expect(g.level).toBeLessThanOrEqual(maxLevel)
      for (let r = 0; r < n; r++) expect(g.board.cat[r * n + p.solution[r]]).toBe(true)
    }
  }, 120_000)

  it('is deterministic for the same id', () => {
    for (let s = 0; s < 5; s++) {
      expect(generatePuzzle(`free-${s}`, n)).toEqual(generatePuzzle(`free-${s}`, n))
    }
  })
})

describe('daily snapshot', () => {
  it('stays stable for a fixed id', () => {
    expect(generatePuzzle('daily-2026-10-12', 10)).toMatchSnapshot()
  })
})
