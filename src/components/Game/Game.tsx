import { useState } from 'react'
import { formatDay } from '../../game/daily'
import { newFreePuzzle } from '../../game/generateAsync'
import { LABELS, SIZES, type GameState } from '../../game/types'
import { useDoubleTap } from '../../hooks/useDoubleTap'
import { useGame } from '../../hooks/useGame'
import { Board } from '../Board/Board'
import { LoseDialog, WinDialog } from '../GameDialogs/GameDialogs'
import { BackIcon, GearIcon } from '../icons/icons'
import { Lives } from '../Lives/Lives'
import { Loading } from '../Loading/Loading'
import styles from './Game.module.css'

interface Props {
  initial: GameState
  autoCross: boolean
  onBack: () => void
  onSettings: () => void
}

export function Game({ initial, autoCross, onBack, onSettings }: Props) {
  const { state, start, toggleCross, placeCat, retry } = useGame(() => initial, autoCross)
  const [loading, setLoading] = useState(false)
  const onCellTap = useDoubleTap({ onCross: toggleCross, onCat: placeCat })
  const size = SIZES[state.difficulty]
  const daily = state.mode === 'daily'

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
          {daily ? `Daily, ${formatDay(state.puzzle.id.slice('daily-'.length))}` : `${LABELS[state.difficulty]} ${size}×${size}`}
        </h1>
        <Lives lives={state.lives} />
        <button type="button" className={styles.back} aria-label="Settings" onClick={onSettings}>
          <GearIcon />
        </button>
      </header>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Board puzzle={state.puzzle} marks={state.marks} onCellTap={onCellTap} />
          <p className={styles.reminder}>Tap to cross out. Double-tap to place a cat.</p>
        </>
      )}
      {state.status === 'won' && !loading && <WinDialog lives={state.lives} daily={daily} onNext={nextPuzzle} onHome={onBack} />}
      {state.status === 'lost' && <LoseDialog onRetry={retry} onHome={onBack} />}
    </div>
  )
}
