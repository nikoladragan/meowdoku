import { UndoIcon } from '../icons/icons'
import styles from './Controls.module.css'

interface Props {
  canUndo: boolean
  onUndo: () => void
}

// Pinned to the bottom of the game screen.
export function Controls({ canUndo, onUndo }: Props) {
  return (
    <div className={styles.controls}>
      <button type="button" className={styles.btn} disabled={!canUndo} onClick={onUndo}>
        <UndoIcon />
        Undo
      </button>
    </div>
  )
}
