import { useState } from 'react'
import { START_LIVES } from '../../game/reducer'
import { FishCracker } from '../FishCracker/FishCracker'
import styles from './Lives.module.css'

export function Lives({ lives, size = 22 }: { lives: number; size?: number }) {
  // Index of the cracker lost by the latest change. A loaded game starts with none animating.
  const [prevLives, setPrevLives] = useState(lives)
  const [dropped, setDropped] = useState(-1)
  if (lives !== prevLives) {
    setPrevLives(lives)
    setDropped(lives < prevLives ? lives : -1)
  }

  return (
    <div className={styles.lives} role="img" aria-label={`${lives} of ${START_LIVES} crackers left`}>
      {Array.from({ length: START_LIVES }, (_, i) => (
        <span key={i} className={styles.slot}>
          <FishCracker lost={i >= lives} size={size} />
          {i === dropped && (
            <span className={styles.ghost}>
              <FishCracker size={size} />
            </span>
          )}
        </span>
      ))}
    </div>
  )
}
