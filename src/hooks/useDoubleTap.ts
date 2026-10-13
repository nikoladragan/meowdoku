import { useCallback, useRef } from 'react'

const DOUBLE_TAP_MS = 300

interface Handlers {
  onCross: (cell: number) => void
  onCat: (cell: number) => void
}

// Tap toggles a cross at once; a second tap on the same cell within 300 ms places a cat.
// Counts the taps itself: onDoubleClick is unreliable on touch screens.
export function useDoubleTap({ onCross, onCat }: Handlers) {
  const last = useRef<{ cell: number; time: number } | null>(null)
  return useCallback(
    (cell: number) => {
      const now = performance.now()
      const prev = last.current
      if (prev && prev.cell === cell && now - prev.time < DOUBLE_TAP_MS) {
        last.current = null
        onCat(cell)
      } else {
        last.current = { cell, time: now }
        onCross(cell)
      }
    },
    [onCross, onCat],
  )
}
