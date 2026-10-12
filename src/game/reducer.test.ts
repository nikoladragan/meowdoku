import { beforeEach, describe, expect, it } from 'vitest'
import { generatePuzzle } from './generator'
import { createGameState, reducer } from './reducer'
import type { GameState } from './types'

const puzzle = generatePuzzle('free-1', 5)
const n = puzzle.size
const good = (row: number) => row * n + puzzle.solution[row]
const bad = (row: number) => row * n + ((puzzle.solution[row] + 2) % n)

let s: GameState
beforeEach(() => {
  s = createGameState('free', 'easy', puzzle)
})

describe('toggleCross', () => {
  it('crosses and uncrosses an empty cell', () => {
    s = reducer(s, { type: 'toggleCross', cell: 0 })
    expect(s.marks[0]).toBe('cross')
    expect(s.lastEvent?.kind).toBe('cross')
    s = reducer(s, { type: 'toggleCross', cell: 0 })
    expect(s.marks[0]).toBe('empty')
    expect(s.lastEvent?.kind).toBe('uncross')
    expect(s.lastEvent?.seq).toBe(2)
  })

  it('ignores a cell that holds a cat', () => {
    s = reducer(s, { type: 'placeCat', cell: good(0) })
    const after = reducer(s, { type: 'toggleCross', cell: good(0) })
    expect(after).toBe(s)
  })
})

describe('placeCat', () => {
  it('places a correct cat', () => {
    s = reducer(s, { type: 'placeCat', cell: good(0) })
    expect(s.marks[good(0)]).toBe('cat')
    expect(s.lives).toBe(3)
    expect(s.lastEvent?.kind).toBe('cat')
    expect(s.history).toHaveLength(1)
  })

  it('costs a life and leaves a cross on a wrong cell, without history', () => {
    s = reducer(s, { type: 'placeCat', cell: bad(0) })
    expect(s.marks[bad(0)]).toBe('cross')
    expect(s.lives).toBe(2)
    expect(s.lastEvent?.kind).toBe('miss')
    expect(s.history).toHaveLength(0)
  })

  it('works from a crossed cell', () => {
    s = reducer(s, { type: 'toggleCross', cell: good(0) })
    s = reducer(s, { type: 'placeCat', cell: good(0) })
    expect(s.marks[good(0)]).toBe('cat')
  })

  it('a double-tap folds the first tap into one history step', () => {
    s = reducer(s, { type: 'toggleCross', cell: good(0) })
    s = reducer(s, { type: 'placeCat', cell: good(0), fromDoubleTap: true })
    expect(s.marks[good(0)]).toBe('cat')
    expect(s.history).toHaveLength(1)
    expect(s.history[0].before).toEqual(['empty'])
  })

  it('ignores a cell that already has a cat', () => {
    s = reducer(s, { type: 'placeCat', cell: good(0) })
    expect(reducer(s, { type: 'placeCat', cell: good(0) })).toBe(s)
  })

  it('wins on the last cat', () => {
    for (let r = 0; r < n - 1; r++) s = reducer(s, { type: 'placeCat', cell: good(r) })
    expect(s.status).toBe('playing')
    s = reducer(s, { type: 'placeCat', cell: good(n - 1) })
    expect(s.status).toBe('won')
    expect(s.lastEvent?.kind).toBe('win')
  })

  it('loses on the third miss', () => {
    for (let r = 0; r < 2; r++) s = reducer(s, { type: 'placeCat', cell: bad(r) })
    expect(s.status).toBe('playing')
    s = reducer(s, { type: 'placeCat', cell: bad(2) })
    expect(s.lives).toBe(0)
    expect(s.status).toBe('lost')
    expect(s.lastEvent?.kind).toBe('lose')
  })
})

describe('after the game ends', () => {
  it('ignores every cell action', () => {
    for (let r = 0; r < 3; r++) s = reducer(s, { type: 'placeCat', cell: bad(r) })
    expect(reducer(s, { type: 'toggleCross', cell: good(4) })).toBe(s)
    expect(reducer(s, { type: 'placeCat', cell: good(4) })).toBe(s)
  })
})

describe('retry', () => {
  it('resets the board for the same puzzle and counts the attempt', () => {
    s = reducer(s, { type: 'placeCat', cell: good(0) })
    for (let r = 1; r < 4; r++) s = reducer(s, { type: 'placeCat', cell: bad(r) })
    expect(s.status).toBe('lost')
    s = reducer(s, { type: 'retry' })
    expect(s.puzzle).toBe(puzzle)
    expect(s.marks.every((m) => m === 'empty')).toBe(true)
    expect(s.lives).toBe(3)
    expect(s.status).toBe('playing')
    expect(s.history).toEqual([])
    expect(s.attempt).toBe(2)
    expect(s.lastEvent).toBeNull()
  })
})

describe('auto-cross', () => {
  const size = n
  const cat = good(2)
  const catRow = 2
  const catCol = puzzle.solution[2]
  const region = puzzle.regions[cat]
  const expected = () => {
    const out: number[] = []
    for (let i = 0; i < size * size; i++) {
      if (i === cat) continue
      const r = (i / size) | 0
      const c = i % size
      const touching = Math.abs(r - catRow) <= 1 && Math.abs(c - catCol) <= 1
      if (r === catRow || c === catCol || puzzle.regions[i] === region || touching) out.push(i)
    }
    return out
  }

  it('crosses exactly the row, column, region and touching cells', () => {
    s = reducer(s, { type: 'placeCat', cell: cat, autoCross: true })
    expect(s.lastEvent?.autoCrossed.slice().sort((a, b) => a - b)).toEqual(expected())
    const crossed = s.marks.flatMap((m, i) => (m === 'cross' ? [i] : []))
    expect(crossed).toEqual(expected())
    expect(s.marks[cat]).toBe('cat')
  })

  it('leaves existing marks alone and does not list them as auto-crossed', () => {
    const already = expected()[0]
    s = reducer(s, { type: 'toggleCross', cell: already })
    s = reducer(s, { type: 'placeCat', cell: cat, autoCross: true })
    expect(s.marks[already]).toBe('cross')
    expect(s.lastEvent?.autoCrossed).not.toContain(already)
  })

  it('does nothing extra when auto-cross is off', () => {
    s = reducer(s, { type: 'placeCat', cell: cat, autoCross: false })
    expect(s.marks.filter((m) => m !== 'empty')).toHaveLength(1)
  })

  it('records the cat and its auto-crosses as one history patch', () => {
    s = reducer(s, { type: 'placeCat', cell: cat, autoCross: true })
    expect(s.history).toHaveLength(1)
    expect(s.history[0].cells).toHaveLength(1 + expected().length)
  })
})

describe('undo', () => {
  it('restores a toggle', () => {
    s = reducer(s, { type: 'toggleCross', cell: 3 })
    s = reducer(s, { type: 'undo' })
    expect(s.lastEvent?.restored).toEqual([3])
    expect(s.marks[3]).toBe('empty')
    expect(s.history).toHaveLength(0)
    expect(s.lastEvent?.kind).toBe('undo')
  })

  it('restores a cat together with its auto-crosses in one step', () => {
    const before = s.marks.slice()
    s = reducer(s, { type: 'placeCat', cell: good(1), autoCross: true })
    expect(s.marks.filter((m) => m === 'cross').length).toBeGreaterThan(0)
    s = reducer(s, { type: 'undo' })
    expect(s.marks).toEqual(before)
  })

  it('puts a crossed cell back to crossed, not empty, when a cat replaced the cross', () => {
    s = reducer(s, { type: 'toggleCross', cell: good(0) })
    s = reducer(s, { type: 'placeCat', cell: good(0) }) // not a double-tap: the cross stays in history
    s = reducer(s, { type: 'undo' })
    expect(s.marks[good(0)]).toBe('cross')
  })

  it('never gives a life back', () => {
    s = reducer(s, { type: 'placeCat', cell: bad(0) })
    expect(s.lives).toBe(2)
    s = reducer(s, { type: 'undo' })
    expect(s.lives).toBe(2)
    expect(s.marks[bad(0)]).toBe('cross')
  })

  it('a double-tap cat undoes back to the state before the first tap', () => {
    const before = s.marks.slice()
    s = reducer(s, { type: 'toggleCross', cell: good(0) })
    s = reducer(s, { type: 'placeCat', cell: good(0), fromDoubleTap: true })
    s = reducer(s, { type: 'undo' })
    expect(s.marks).toEqual(before)
    expect(s.history).toHaveLength(0)
  })

  it('a miss adds nothing to the history', () => {
    s = reducer(s, { type: 'toggleCross', cell: 3 })
    s = reducer(s, { type: 'placeCat', cell: bad(0) })
    expect(s.history).toHaveLength(1)
  })

  it('does nothing on an empty history or after the game ends', () => {
    expect(reducer(s, { type: 'undo' })).toBe(s)
    s = reducer(s, { type: 'toggleCross', cell: 3 })
    for (let r = 0; r < 3; r++) s = reducer(s, { type: 'placeCat', cell: bad(r) })
    expect(s.status).toBe('lost')
    expect(reducer(s, { type: 'undo' })).toBe(s)
  })
})

describe('tick', () => {
  it('adds time only while playing and never touches lastEvent', () => {
    s = reducer(s, { type: 'toggleCross', cell: 3 })
    const event = s.lastEvent
    s = reducer(s, { type: 'tick', deltaMs: 1000 })
    s = reducer(s, { type: 'tick', deltaMs: 500 })
    expect(s.elapsedMs).toBe(1500)
    expect(s.lastEvent).toBe(event)
    for (let r = 0; r < 3; r++) s = reducer(s, { type: 'placeCat', cell: bad(r) })
    expect(s.status).toBe('lost')
    expect(reducer(s, { type: 'tick', deltaMs: 1000 }).elapsedMs).toBe(1500)
  })

  it('retry resets the time', () => {
    s = reducer(s, { type: 'tick', deltaMs: 4000 })
    s = reducer(s, { type: 'retry' })
    expect(s.elapsedMs).toBe(0)
    expect(s.attempt).toBe(2)
  })
})
