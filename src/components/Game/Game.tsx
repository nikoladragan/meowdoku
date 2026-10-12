import { generatePuzzle } from '../../game/generator'
import { createGameState } from '../../game/reducer'
import { SIZES, type Difficulty, type Puzzle } from '../../game/types'
import { useDoubleTap } from '../../hooks/useDoubleTap'
import { useGame } from '../../hooks/useGame'
import { Board } from '../Board/Board'
import { FishCracker } from '../FishCracker/FishCracker'
import styles from './Game.module.css'

const BUTTONS: { size: number; difficulty: Difficulty }[] = [
  { size: 5, difficulty: 'easy' },
  { size: 7, difficulty: 'normal' },
  { size: 9, difficulty: 'hard' },
  { size: 10, difficulty: 'extreme' },
]

function newPuzzle(size: number): Puzzle {
  const id = `free-${crypto.getRandomValues(new Uint32Array(1))[0]}`
  return generatePuzzle(id, size)
}

function newState(difficulty: Difficulty) {
  return createGameState('free', difficulty, newPuzzle(SIZES[difficulty]))
}

// Temporary screen for step 5: size buttons, lives, plain-text status and a playable board.
export function Game() {
  const { state, start, toggleCross, placeCat } = useGame(() => newState('normal'))
  const onCellTap = useDoubleTap({ onCross: toggleCross, onCat: placeCat })

  const pick = (difficulty: Difficulty) => start('free', difficulty, newPuzzle(SIZES[difficulty]))

  return (
    <div className={styles.game}>
      <div className={styles.bar}>
        {BUTTONS.map(({ size, difficulty }) => (
          <button
            key={size}
            type="button"
            className={`${styles.btn} ${difficulty === state.difficulty ? styles.active : ''}`}
            onClick={() => pick(difficulty)}
          >
            {size}
          </button>
        ))}
        <button type="button" className={styles.btn} onClick={() => pick(state.difficulty)}>
          New
        </button>
      </div>
      <div className={styles.status}>
        <div className={styles.lives}>
          {[0, 1, 2].map((i) => (
            <FishCracker key={i} lost={i >= state.lives} />
          ))}
        </div>
        <span>
          {state.status === 'won' ? 'Solved!' : state.status === 'lost' ? 'Out of crackers' : ''}
        </span>
      </div>
      <Board puzzle={state.puzzle} marks={state.marks} onCellTap={onCellTap} />
    </div>
  )
}
