import { BulbIcon, UndoIcon } from '../icons/icons'
import styles from './Controls.module.css'

interface Props {
  canUndo: boolean
  canHint: boolean
  onUndo: () => void
  onHint: () => void
}

// Pinned to the bottom of the game screen.
export function Controls({ canUndo, canHint, onUndo, onHint }: Props) {
  return (
    <div className={styles.controls}>
      <button type="button" className={styles.btn} disabled={!canUndo} onClick={onUndo}>
        <UndoIcon />
        Undo
      </button>
      <button type="button" className={styles.btn} disabled={!canHint} onClick={onHint}>
        <BulbIcon />
        Hint
      </button>
    </div>
  )
}
