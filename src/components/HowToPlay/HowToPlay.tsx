import { Cat } from '../Cat/Cat'
import { Cross } from '../Cross/Cross'
import { Dialog } from '../Dialog/Dialog'
import { FishCracker } from '../FishCracker/FishCracker'
import { BulbIcon, UndoIcon } from '../icons/icons'
import styles from './HowToPlay.module.css'

export function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="How to play" onClose={onClose}>
      <section className={styles.section}>
        <h3 className={styles.heading}>Place one cat in…</h3>
        <ol className={styles.list}>
          <li>every row,</li>
          <li>every column,</li>
          <li>every coloured region,</li>
          <li>and no two cats may touch, not even diagonally.</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h3 className={styles.heading}>Controls</h3>
        <p className={styles.row}>
          <span className={styles.icon}>
            <Cross />
          </span>
          <span>Tap a cell to cross it out. Tap again to clear it.</span>
        </p>
        <p className={styles.row}>
          <span className={styles.icon}>
            <Cat fur="orange" />
          </span>
          <span>Double-tap a cell to place a cat.</span>
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.heading}>Crackers, undo and hints</h3>
        <p className={styles.row}>
          <span className={styles.icon}>
            <FishCracker size={20} />
          </span>
          <span>You have 3 crackers. A cat in the wrong spot costs one. Lose all three and the puzzle is over.</span>
        </p>
        <p className={styles.row}>
          <span className={styles.icon}>
            <UndoIcon />
          </span>
          <span>Undo takes back your last move. It never gives a cracker back.</span>
        </p>
        <p className={styles.row}>
          <span className={styles.icon}>
            <BulbIcon />
          </span>
          <span>A hint points at the next step and explains why. Using one means your time won&apos;t count as a best.</span>
        </p>
      </section>

      <p className={styles.section}>Every puzzle can be solved by logic alone. No guessing needed.</p>
      <button type="button" className={styles.done} onClick={onClose}>
        Got it
      </button>
    </Dialog>
  )
}
