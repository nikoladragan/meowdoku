import { useEffect, useState } from 'react'

const MAX_TICK_MS = 2000

// Calls onTick once a second with the real time elapsed since the previous tick (capped, so a
// sleeping tab does not add hours). Runs only while `active` and the tab is visible.
export function useGameTimer(active: boolean, onTick: (deltaMs: number) => void) {
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible')

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  const running = active && visible
  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      onTick(Math.min(now - last, MAX_TICK_MS))
      last = now
    }, 1000)
    return () => clearInterval(id)
  }, [running, onTick])
}
