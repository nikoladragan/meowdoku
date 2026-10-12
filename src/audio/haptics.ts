// navigator.vibrate wrapper. iOS Safari has no vibration API, so this only does something on Android.
import type { GameEvent } from '../game/types'

let enabled = true

export function setVibrationEnabled(value: boolean): void {
  enabled = value
}

export function vibrationSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

// Nothing for crosses and undo.
export function vibrationFor(kind: GameEvent['kind']): number | number[] | null {
  switch (kind) {
    case 'cat':
      return 10
    case 'miss':
    case 'lose':
      return [30, 40, 30]
    case 'win':
      return [20, 60, 20, 60, 40]
    default:
      return null
  }
}

export function vibrateFor(kind: GameEvent['kind']): void {
  if (!enabled || !vibrationSupported()) return
  const pattern = vibrationFor(kind)
  if (pattern !== null) navigator.vibrate(pattern)
}
