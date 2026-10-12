import { describe, expect, it } from 'vitest'
import { vibrationFor } from './haptics'

describe('vibrationFor', () => {
  it('uses the planned patterns', () => {
    expect(vibrationFor('cat')).toBe(10)
    expect(vibrationFor('miss')).toEqual([30, 40, 30])
    expect(vibrationFor('win')).toEqual([20, 60, 20, 60, 40])
  })

  it('is silent for crosses and undo', () => {
    for (const k of ['cross', 'uncross', 'undo'] as const) expect(vibrationFor(k)).toBeNull()
  })
})
