import { describe, expect, it } from 'vitest'
import { vibrationFor } from './haptics'

describe('vibrationFor', () => {
  it('maps events to haptic presets', () => {
    expect(vibrationFor('cat')).toBe('light')
    expect(vibrationFor('miss')).toBe('error')
    expect(vibrationFor('lose')).toBe('error')
    expect(vibrationFor('win')).toBe('success')
  })

  it('is silent for crosses and undo', () => {
    for (const k of ['cross', 'uncross', 'undo'] as const) expect(vibrationFor(k)).toBeNull()
  })
})
