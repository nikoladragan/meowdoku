import { START_LIVES } from '../../game/reducer'
import { FishCracker } from '../FishCracker/FishCracker'
import styles from './Lives.module.css'

export function Lives({ lives, size = 22 }: { lives: number; size?: number }) {
  return (
    <div className={styles.lives} role="img" aria-label={`${lives} of ${START_LIVES} crackers left`}>
      {Array.from({ length: START_LIVES }, (_, i) => (
        <FishCracker key={i} lost={i >= lives} size={size} />
      ))}
    </div>
  )
}
