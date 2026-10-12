import { useState } from 'react'
import { getHint, type Hint } from '../../game/hints'
import { hintText } from '../../game/hintText'
import { formatDay } from '../../game/daily'
import { newFreePuzzle } from '../../game/generateAsync'
import { LABELS, SIZES, type GameEvent, type GameState, type Puzzle } from '../../game/types'
import { useDoubleTap } from '../../hooks/useDoubleTap'
import { useGame } from '../../hooks/useGame'
import { useGameTimer } from '../../hooks/useGameTimer'
import { formatTime } from '../../game/stats'
import { Board } from '../Board/Board'
import { Controls } from '../Controls/Controls'
import { HintBar } from '../HintBar/HintBar'
import { LoseDialog, WinDialog } from '../GameDialogs/GameDialogs'
import { BackIcon, GearIcon } from '../icons/icons'
import { Lives } from '../Lives/Lives'
import { Loading } from '../Loading/Loading'
import styles from './Game.module.css'

interface Props {
  initial: GameState
  autoCross: boolean
  // true while a sheet is open over the game: the timer stops
  paused: boolean
  onBack: () => void
  onSettings: () => void
}

export function Game({ initial, autoCross, paused, onBack, onSettings }: Props) {
  const {
    state,
    winResult,
    start,
    toggleCross,
    placeCat,
    placeCatDirect,
    crossCells,
    hintShown,
    undo,
    tick,
    retry,
  } = useGame(() => initial, autoCross)
  const [loading, setLoading] = useState(false)
  const onCellTap = useDoubleTap({ onCross: toggleCross, onCat: placeCat })
  const size = SIZES[state.difficulty]
  useGameTimer(state.status === 'playing' && !loading && !paused, tick)
  const daily = state.mode === 'daily'

  // The open hint lives here, not in GameState. Any move, undo or retry dismisses it.
  // It remembers the event it was computed for, so any new event hides it without an effect.
  const [opened, setOpened] = useState<{ hint: Hint; event: GameEvent | null; puzzle: Puzzle } | null>(null)
  const hint =
    opened && opened.event === state.lastEvent && opened.puzzle === state.puzzle ? opened.hint : null
  const setHint = (h: null) => setOpened(h)

  const openHint = () => {
    setOpened({ hint: getHint(state), event: state.lastEvent, puzzle: state.puzzle })
    hintShown()
  }

  const applyHint = () => {
    if (!hint) return
    if (hint.action === 'cat') placeCatDirect(hint.cells[0])
    else if (hint.action === 'cross') crossCells(hint.cells)
    else toggleCross(hint.cells[0])
  }

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
        <div className={styles.titles}>
          <h1 className={styles.title}>
            {daily ? `Daily, ${formatDay(state.puzzle.id.slice('daily-'.length))}` : `${LABELS[state.difficulty]} ${size}×${size}`}
          </h1>
          <span className={styles.timer}>{formatTime(state.elapsedMs)}</span>
        </div>
        <Lives lives={state.lives} />
        <button type="button" className={styles.back} aria-label="Settings" onClick={onSettings}>
          <GearIcon />
        </button>
      </header>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className={styles.main}>
            <Board puzzle={state.puzzle} marks={state.marks} hint={hint} onCellTap={onCellTap} />
            <p className={styles.reminder}>Tap to cross out. Double-tap to place a cat.</p>
          </div>
          <Controls
            canUndo={state.status === 'playing' && state.history.length > 0}
            canHint={state.status === 'playing'}
            onUndo={undo}
            onHint={openHint}
          />
          {hint && (
            <HintBar text={hintText(hint, state.puzzle)} onApply={applyHint} onClose={() => setHint(null)} />
          )}
        </>
      )}
      {state.status === 'won' && !loading && <WinDialog
          lives={state.lives}
          daily={daily}
          timeMs={state.elapsedMs}
          isBest={winResult?.isBest ?? false}
          counts={winResult?.counts ?? true}
          hintsUsed={state.hintsUsed} onNext={nextPuzzle} onHome={onBack} />}
      {state.status === 'lost' && <LoseDialog onRetry={retry} onHome={onBack} />}
    </div>
  )
}
