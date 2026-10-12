import { useState } from 'react'
import { newFreePuzzle } from '../../game/generateAsync'
import { LABELS, SIZES, type GameState } from '../../game/types'
import { useDoubleTap } from '../../hooks/useDoubleTap'
import { useGame } from '../../hooks/useGame'
import { Board } from '../Board/Board'
import { LoseDialog, WinDialog } from '../GameDialogs/GameDialogs'
import { BackIcon } from '../icons/icons'
import { Lives } from '../Lives/Lives'
import { Loading } from '../Loading/Loading'
import styles from './Game.module.css'

interface Props {
  initial: GameState
  onBack: () => void
}

export function Game({ initial, onBack }: Props) {
  const { state, start, toggleCross, placeCat, retry } = useGame(() => initial)
  const [loading, setLoading] = useState(false)
  const onCellTap = useDoubleTap({ onCross: toggleCross, onCat: placeCat })
  const size = SIZES[state.difficulty]

  const nextPuzzle = async () => {
    setLoading(true)
    const puzzle = await newFreePuzzle(state.difficulty)
    start('free', state.difficulty, puzzle)
    setLoading(false)
  }

  return (
    <div className={styles.game}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="Back" onClick={onBack}>
          <BackIcon />
        </button>
        <h1 className={styles.title}>
          {LABELS[state.difficulty]} {size}×{size}
        </h1>
        <Lives lives={state.lives} />
      </header>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Board puzzle={state.puzzle} marks={state.marks} onCellTap={onCellTap} />
          <p className={styles.reminder}>Tap to cross out. Double-tap to place a cat.</p>
        </>
      )}
      {state.status === 'won' && !loading && <WinDialog lives={state.lives} onNext={nextPuzzle} />}
      {state.status === 'lost' && <LoseDialog onRetry={retry} />}
    </div>
  )
}
