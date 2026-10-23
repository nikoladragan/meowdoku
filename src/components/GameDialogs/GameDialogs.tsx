import { formatTime } from '../../game/stats'
import { Dialog } from '../Dialog/Dialog'
import { Lives } from '../Lives/Lives'
import styles from './GameDialogs.module.css'

interface WinProps {
  lives: number
  daily: boolean
  nextLabel: string
  timeMs: number
  isBest: boolean
  counts: boolean
  hintsUsed: number
  onNext: () => void
  onHome: () => void
}

export function WinDialog({ lives, daily, nextLabel, timeMs, isBest, counts, hintsUsed, onNext, onHome }: WinProps) {
  return (
    <Dialog title="Purrfect!">
      <p className={styles.text}>You solved the puzzle.</p>
      <div className={styles.stat}>
        <span>Time</span>
        <span>{formatTime(timeMs)}</span>
        {isBest && <span className={styles.badge}>New best time!</span>}
      </div>
      {!counts && <p className={styles.text}>Hints or a retry mean this time does not count as a best.</p>}
      <div className={styles.stat}>
        <span>Hints used</span>
        <span>{hintsUsed}</span>
      </div>
      <div className={styles.stat}>
        <span>Crackers left</span>
        <Lives lives={lives} />
      </div>
      <div className={styles.actions}>
        {!daily && (
          <button type="button" className={styles.primary} onClick={onNext}>
            {nextLabel}
          </button>
        )}
        <button type="button" className={daily ? styles.primary : styles.secondary} onClick={onHome}>
          Home
        </button>
      </div>
    </Dialog>
  )
}

interface RestartProps {
  onSame: () => void
  // Absent for the daily puzzle and levels, which have no other puzzle to swap to.
  onFresh?: () => void
  onClose: () => void
}

export function RestartDialog({ onSame, onFresh, onClose }: RestartProps) {
  return (
    <Dialog title="Start over?" onClose={onClose}>
      <p className={styles.text}>
        {onFresh
          ? 'Clear this board and try it again, or swap it for a new puzzle.'
          : 'Clear this board and try it again.'}{' '}
        A restarted puzzle's time does not count as a best.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onSame}>
          Restart this puzzle
        </button>
        {onFresh && (
          <button type="button" className={styles.secondary} onClick={onFresh}>
            New puzzle
          </button>
        )}
      </div>
    </Dialog>
  )
}

export function LoseDialog({ onRetry, onHome }: { onRetry: () => void; onHome: () => void }) {
  return (
    <Dialog title="Out of crackers">
      <p className={styles.text}>The cats ate them all. Give it another go?</p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onRetry}>
          Try again
        </button>
        <button type="button" className={styles.secondary} onClick={onHome}>
          Home
        </button>
      </div>
    </Dialog>
  )
}
