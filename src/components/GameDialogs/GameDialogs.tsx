import { formatTime } from '../../game/stats'
import { Dialog } from '../Dialog/Dialog'
import { Lives } from '../Lives/Lives'
import styles from './GameDialogs.module.css'

interface WinProps {
  lives: number
  daily: boolean
  timeMs: number
  isBest: boolean
  counts: boolean
  hintsUsed: number
  onNext: () => void
  onHome: () => void
}

export function WinDialog({ lives, daily, timeMs, isBest, counts, hintsUsed, onNext, onHome }: WinProps) {
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
        {daily ? (
          <button type="button" className={styles.primary} onClick={onHome}>
            Home
          </button>
        ) : (
          <button type="button" className={styles.primary} onClick={onNext}>
            Next puzzle
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
