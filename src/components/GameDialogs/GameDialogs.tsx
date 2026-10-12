import { Dialog } from '../Dialog/Dialog'
import { Lives } from '../Lives/Lives'
import styles from './GameDialogs.module.css'

interface WinProps {
  lives: number
  daily: boolean
  onNext: () => void
  onHome: () => void
}

export function WinDialog({ lives, daily, onNext, onHome }: WinProps) {
  return (
    <Dialog title="Purrfect!">
      <p className={styles.text}>You solved the puzzle.</p>
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
