import { describe, expect, it } from 'vitest'
import { generatePuzzle } from './generator'
import { getHint, type Hint } from './hints'
import { hintText } from './hintText'
import { createGameState, reducer } from './reducer'
import type { GameState } from './types'

const COUNTS: Record<number, number> = { 5: 30, 7: 30, 9: 30, 10: 30 }

function apply(state: GameState, hint: Hint, autoCross: boolean): GameState {
  if (hint.action === 'cat') return reducer(state, { type: 'placeCat', cell: hint.cells[0], autoCross })
  if (hint.action === 'cross') return reducer(state, { type: 'crossCells', cells: hint.cells })
  return reducer(state, { type: 'toggleCross', cell: hint.cells[0] })
}

describe.each([5, 7, 9, 10])('hint play-through %dx%d', (n) => {
  it.each([true, false])('solves 30 puzzles from empty with auto-cross %s', (autoCross) => {
    const kinds = new Set<string>()
    for (let s = 0; s < COUNTS[n]; s++) {
      const puzzle = generatePuzzle(`free-hint-${s}`, n)
      let state = createGameState('free', 'easy', puzzle)
      for (let guard = 0; state.status === 'playing'; guard++) {
        expect(guard).toBeLessThan(500)
        const hint = getHint(state)
        kinds.add(hint.kind)
        expect(hint.kind).not.toBe('reveal')
        expect(hintText(hint, puzzle).length).toBeGreaterThan(0)
        state = apply(state, hint, autoCross)
        expect(state.lives).toBe(3)
      }
      expect(state.status).toBe('won')
    }
    expect(kinds.has('single')).toBe(true)
  }, 120_000)
})

describe('getHint', () => {
  const puzzle = generatePuzzle('free-1', 5)
  const n = puzzle.size
  const good = (row: number) => row * n + puzzle.solution[row]

  it('returns wrongCross first when a solution cell is crossed', () => {
    let s = createGameState('free', 'easy', puzzle)
    s = reducer(s, { type: 'toggleCross', cell: good(2) })
    const h = getHint(s)
    expect(h.kind).toBe('wrongCross')
    expect(h.action).toBe('uncross')
    expect(h.cells).toEqual([good(2)])
  })

  it('returns catExclusion when auto-cross is off and a cat has empty peers', () => {
    let s = createGameState('free', 'easy', puzzle)
    s = reducer(s, { type: 'placeCat', cell: good(0), autoCross: false })
    const h = getHint(s)
    expect(h.kind).toBe('catExclusion')
    expect(h.action).toBe('cross')
    expect(h.reasonCells).toEqual([good(0)])
    expect(h.cells.length).toBeGreaterThan(0)
    expect(h.cells).not.toContain(good(0))
  })

  it('does not return catExclusion once auto-cross has crossed those cells', () => {
    let s = createGameState('free', 'easy', puzzle)
    s = reducer(s, { type: 'placeCat', cell: good(0), autoCross: true })
    expect(getHint(s).kind).not.toBe('catExclusion')
  })
})

describe('reducer: hints', () => {
  const puzzle = generatePuzzle('free-1', 5)
  it('hintShown counts hints and leaves lastEvent alone', () => {
    let s = createGameState('free', 'easy', puzzle)
    s = reducer(s, { type: 'hintShown' })
    s = reducer(s, { type: 'hintShown' })
    expect(s.hintsUsed).toBe(2)
    expect(s.lastEvent).toBeNull()
  })

  it('crossCells crosses only empty cells as one patch', () => {
    let s = createGameState('free', 'easy', puzzle)
    s = reducer(s, { type: 'toggleCross', cell: 1 })
    s = reducer(s, { type: 'crossCells', cells: [1, 2, 3] })
    expect(s.marks.slice(0, 4)).toEqual(['empty', 'cross', 'cross', 'cross'])
    expect(s.history).toHaveLength(2)
    expect(s.history[1].cells).toEqual([2, 3])
  })
})
