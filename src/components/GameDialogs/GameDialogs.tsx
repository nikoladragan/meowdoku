import { Dialog } from '../Dialog/Dialog'
import { Lives } from '../Lives/Lives'
import styles from './GameDialogs.module.css'

export function WinDialog({ lives, onNext }: { lives: number; onNext: () => void }) {
  return (
    <Dialog title="Purrfect!">
      <p className={styles.text}>You solved the puzzle.</p>
      <div className={styles.stat}>
        <span>Crackers left</span>
        <Lives lives={lives} />
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onNext}>
          Next puzzle
        </button>
      </div>
    </Dialog>
  )
}

export function LoseDialog({ onRetry }: { onRetry: () => void }) {
  return (
    <Dialog title="Out of crackers">
      <p className={styles.text}>The cats ate them all. Give it another go?</p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onRetry}>
          Try again
        </button>
      </div>
    </Dialog>
  )
}
