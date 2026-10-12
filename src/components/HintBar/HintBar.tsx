import { CloseIcon } from '../icons/icons'
import styles from './HintBar.module.css'

interface Props {
  text: string
  onApply: () => void
  onClose: () => void
}

// Slides up over the controls bar. Positioned against the game screen, so the board never moves.
export function HintBar({ text, onApply, onClose }: Props) {
  return (
    <div className={styles.bar} role="status">
      <div className={styles.top}>
        <p className={styles.text}>{text}</p>
        <button type="button" className={styles.close} aria-label="Close hint" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <button type="button" className={styles.apply} onClick={onApply}>
        Apply
      </button>
    </div>
  )
}
