import { generatePuzzle } from '../../game/generator'
import { createGameState } from '../../game/reducer'
import { SIZES, type Difficulty, type Puzzle } from '../../game/types'
import { useDoubleTap } from '../../hooks/useDoubleTap'
import { useGame } from '../../hooks/useGame'
import { Board } from '../Board/Board'
import { LoseDialog, WinDialog } from '../GameDialogs/GameDialogs'
import { BackIcon } from '../icons/icons'
import { Lives } from '../Lives/Lives'
import styles from './Game.module.css'

const BUTTONS: { size: number; difficulty: Difficulty }[] = [
  { size: 5, difficulty: 'easy' },
  { size: 7, difficulty: 'normal' },
  { size: 9, difficulty: 'hard' },
  { size: 10, difficulty: 'extreme' },
]

const LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
  extreme: 'Extreme',
}

function newPuzzle(size: number): Puzzle {
  const id = `free-${crypto.getRandomValues(new Uint32Array(1))[0]}`
  return generatePuzzle(id, size)
}

// Temporary until step 7: the size bar at the bottom picks a difficulty.
export function Game() {
  const { state, start, toggleCross, placeCat, retry } = useGame(() =>
    createGameState('free', 'normal', newPuzzle(SIZES.normal)),
  )
  const onCellTap = useDoubleTap({ onCross: toggleCross, onCat: placeCat })

  const pick = (difficulty: Difficulty) => start('free', difficulty, newPuzzle(SIZES[difficulty]))
  const size = SIZES[state.difficulty]

  return (
    <div className={styles.game}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="Back">
          <BackIcon />
        </button>
        <h1 className={styles.title}>
          {LABELS[state.difficulty]} {size}×{size}
        </h1>
        <Lives lives={state.lives} />
      </header>
      <Board puzzle={state.puzzle} marks={state.marks} onCellTap={onCellTap} />
      <p className={styles.reminder}>Tap to cross out. Double-tap to place a cat.</p>
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
      {state.status === 'won' && <WinDialog lives={state.lives} onNext={() => pick(state.difficulty)} />}
      {state.status === 'lost' && <LoseDialog onRetry={retry} />}
    </div>
  )
}
