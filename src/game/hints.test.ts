import { describe, expect, it } from 'vitest'
import { generatePuzzle } from './generator'
import { getHint, type Hint } from './hints'
import { hintText } from './hintText'
import { boardPlaceCat, createBoard, findBlocks, peerCells, touches, unitsOf } from './logic'
import { createGameState, reducer } from './reducer'
import { mulberry32, randInt } from './rng'
import type { GameState } from './types'

const COUNTS: Record<number, number> = { 5: 30, 7: 30, 9: 30, 10: 30 }

function apply(state: GameState, hint: Hint, autoCross: boolean): GameState {
  if (hint.action === 'cat') return reducer(state, { type: 'placeCat', cell: hint.cells[0], autoCross })
  if (hint.action === 'cross') return reducer(state, { type: 'crossCells', cells: hint.cells })
  return reducer(state, { type: 'toggleCross', cell: hint.cells[0] })
}

describe.each([5, 7, 9, 10])('hint play-through %dx%d', (n) => {
  it.each([true, false])(
    'solves 30 puzzles from empty with auto-cross %s',
    (autoCross) => {
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
    },
    120_000,
  )
})

// Checks what a hint tells the player against the marks they can see, without the logic solver.
// Returns what is wrong with it, or null if every claim holds.
function claimError(state: GameState, hint: Hint): string | null {
  const { size: n, regions, solution } = state.puzzle
  const { marks } = state
  const cellsOf = (u: number) => marks.map((_, i) => i).filter((i) => unitsOf(n, regions, i).includes(u))
  const open = (u: number) => !cellsOf(u).some((i) => marks[i] === 'cat')
  const empties = (units: number[]) => units.flatMap((u) => cellsOf(u).filter((i) => marks[i] === 'empty'))
  const isCat = (i: number) => solution[(i / n) | 0] === i % n

  if (!hint.cells.length) return 'no cells to act on'
  if (hint.cells.some((c) => isCat(c) !== (hint.action !== 'cross'))) return 'the action is wrong for a cell'
  if (hint.kind === 'wrongCross' || hint.kind === 'catExclusion' || hint.kind === 'reveal') return null

  if (hint.units.some((u) => !open(u))) return 'a named unit already has its cat'
  const spots = empties(hint.units)
  if (hint.kind === 'single') return spots.length === 1 && spots[0] === hint.cells[0] ? null : 'not the only cell left'

  if (String(hint.reasonCells) !== String(spots)) return 'dashed cells are not the spots left'
  if (hint.kind === 'blocks') {
    const peers = new Set(peerCells(n, regions, hint.cells[0]))
    if (spots.includes(hint.cells[0])) return 'the cell is in the unit it blocks'
    return spots.length > 0 && spots.every((j) => peers.has(j)) ? null : 'a spot would survive the cat'
  }
  // confine: the spots of k units all lie inside k other units, and the targets are the rest of those.
  const into = new Set(hint.into.flatMap(cellsOf))
  if (hint.units.length !== hint.into.length) return 'unit counts differ'
  if (hint.units.some((u) => !empties([u]).length)) return 'a confined unit has no spots'
  if (spots.some((j) => !into.has(j))) return 'a spot lies outside the claimed units'
  return hint.cells.every((c) => into.has(c) && !spots.includes(c)) ? null : 'a target is not in the claimed units'
}

describe.each([5, 7, 9, 10])('hint claims %dx%d', (n) => {
  it.each([true, false])(
    'hold on boards from messy play with auto-cross %s',
    (autoCross) => {
      const kinds = new Set<string>()
      for (let s = 0; s < 6; s++) {
        const puzzle = generatePuzzle(`free-claims-${s}`, n)
        const rng = mulberry32(s * 31 + n)
        let state = createGameState('free', 'easy', puzzle)
        for (let guard = 0; state.status === 'playing' && guard < 1500; guard++) {
          const hint = getHint(state)
          kinds.add(hint.kind)
          expect(claimError(state, hint)).toBeNull()
          if (hint.kind === 'blocks') {
            const count = hint.reasonCells.length === 2 ? 'both' : `all ${hint.reasonCells.length}`
            expect(hintText(hint, puzzle)).toContain(`${count} spots left`)
          }
          // Mostly the player's own moves (crosses, cats, undo, a wrong guess), now and then the hint.
          const cell = randInt(rng, n * n)
          const x = rng()
          if (x < 0.3) state = apply(state, hint, autoCross)
          else if (x < 0.75) state = reducer(state, { type: 'toggleCross', cell })
          else if (x < 0.85) state = reducer(state, { type: 'undo' })
          else if (puzzle.solution[(cell / n) | 0] === cell % n || (x > 0.99 && state.lives > 1)) {
            state = reducer(state, { type: 'placeCat', cell, autoCross })
          }
        }
        expect(state.status).toBe('won')
      }
      expect(kinds.has('confine')).toBe(true)
    },
    120_000,
  )
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

  it('picks a blocking move whose spots all touch the cell when there is one', () => {
    let seen = 0
    for (let s = 0; s < 30; s++) {
      const hard = generatePuzzle(`free-hint-${s}`, 9)
      let state = createGameState('free', 'hard', hard)
      while (state.status === 'playing') {
        const hint = getHint(state)
        if (hint.kind === 'blocks') {
          const board = createBoard(9, hard.regions)
          state.marks.forEach((m, i) => m === 'cat' && boardPlaceCat(board, i))
          state.marks.forEach((m, i) => m !== 'empty' && (board.cand[i] = false))
          const allTouch = (cell: number, unit: number) =>
            board.unitCells[unit].every((j) => !board.cand[j] || touches(9, cell, j))
          if (findBlocks(board).some((b) => allTouch(b.cells[0], b.units[0]))) {
            seen++
            expect(allTouch(hint.cells[0], hint.units[0])).toBe(true)
          }
        }
        state = apply(state, hint, true)
      }
    }
    expect(seen).toBeGreaterThan(0)
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
