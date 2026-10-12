// Haptic feedback through web-haptics: navigator.vibrate on Android, and on iOS Safari (17.4+) a
// light tick from a hidden <input type="checkbox" switch>. On iOS this is a tap, not a pattern.
import { WebHaptics } from 'web-haptics'
import type { GameEvent } from '../game/types'

let enabled = true
let haptics: WebHaptics | null = null

export function setVibrationEnabled(value: boolean): void {
  enabled = value
}

// Android has the Vibration API and iOS gets the switch trick, so any touch device qualifies.
export function vibrationSupported(): boolean {
  if (typeof navigator === 'undefined') return false
  return WebHaptics.isSupported || navigator.maxTouchPoints > 0
}

export type HapticPreset = 'light' | 'error' | 'success'

// Nothing for crosses and undo.
export function vibrationFor(kind: GameEvent['kind']): HapticPreset | null {
  switch (kind) {
    case 'cat':
      return 'light'
    case 'miss':
    case 'lose':
      return 'error'
    case 'win':
      return 'success'
    default:
      return null
  }
}

export function vibrateFor(kind: GameEvent['kind']): void {
  if (!enabled || !vibrationSupported()) return
  const preset = vibrationFor(kind)
  if (preset === null) return
  haptics ??= new WebHaptics()
  void haptics.trigger(preset).catch(() => {})
}
