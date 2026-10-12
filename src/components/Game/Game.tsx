import { useState } from 'react'
import { generatePuzzle } from '../../game/generator'
import type { Puzzle } from '../../game/types'
import { Board } from '../Board/Board'
import styles from './Game.module.css'

const SIZES = [5, 7, 9, 10]

function newPuzzle(size: number): Puzzle {
  const id = `free-${crypto.getRandomValues(new Uint32Array(1))[0]}`
  return generatePuzzle(id, size)
}

// Temporary screen for step 3: size buttons and a board that does not react to taps.
export function Game() {
  const [size, setSize] = useState(7)
  const [puzzle, setPuzzle] = useState(() => newPuzzle(7))

  const pick = (n: number) => {
    setSize(n)
    setPuzzle(newPuzzle(n))
  }

  return (
    <div className={styles.game}>
      <div className={styles.bar}>
        {SIZES.map((n) => (
          <button
            key={n}
            type="button"
            className={`${styles.btn} ${n === size ? styles.active : ''}`}
            onClick={() => pick(n)}
          >
            {n}
          </button>
        ))}
        <button type="button" className={styles.btn} onClick={() => pick(size)}>
          New
        </button>
      </div>
      <Board puzzle={puzzle} />
    </div>
  )
}
