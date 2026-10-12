import { useState } from 'react'
import { formatDay, loadTodaysDaily, todayKey } from '../../game/daily'
import { formatTime } from '../../game/stats'
import { loadGame, loadStats } from '../../game/storage'
import { DIFFICULTIES, LABELS, SIZES, type Difficulty, type GameState } from '../../game/types'
import { GearIcon, HelpIcon } from '../icons/icons'
import { TitleCat } from '../TitleCat/TitleCat'
import styles from './Home.module.css'

interface Props {
  onPlay: (difficulty: Difficulty) => void
  onPlayDaily: () => void
  onContinue: (state: GameState) => void
  onSettings: () => void
  onHowTo: () => void
}

function dailyCard(daily: GameState | null) {
  if (!daily) return 'Play'
  if (daily.status === 'won') {
    const crackers = `${daily.lives} ${daily.lives === 1 ? 'cracker' : 'crackers'} left`
    return `Solved in ${formatTime(daily.elapsedMs)}, ${crackers}`
  }
  if (daily.status === 'lost') return 'Try again'
  return 'Continue'
}

export function Home({ onPlay, onPlayDaily, onContinue, onSettings, onHowTo }: Props) {
  const [saved] = useState(() => loadGame('free'))
  const [daily] = useState(() => loadTodaysDaily())
  const [stats] = useState(loadStats)
  return (
    <main className={styles.home}>
      <button type="button" className={styles.help} aria-label="How to play" onClick={onHowTo}>
        <HelpIcon />
      </button>
      <button type="button" className={styles.gear} aria-label="Settings" onClick={onSettings}>
        <GearIcon />
      </button>
      <div className={styles.hero}>
        <TitleCat size={130} />
        <h1 className={styles.title}>Meowdoku</h1>
      </div>
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.daily}
          onClick={() => (daily ? onContinue(daily) : onPlayDaily())}
        >
          <span className={styles.dailyTitle}>Daily puzzle · {formatDay(todayKey())}</span>
          <span className={styles.dailyStatus}>{dailyCard(daily)}</span>
        </button>
        {saved && (
          <button type="button" className={styles.continue} onClick={() => onContinue(saved)}>
            Continue
            <span className={styles.size}>
              {LABELS[saved.difficulty]} {saved.puzzle.size}×{saved.puzzle.size}
            </span>
          </button>
        )}
        {DIFFICULTIES.map((difficulty) => (
          <button key={difficulty} type="button" className={styles.diff} onClick={() => onPlay(difficulty)}>
            <span className={styles.diffLabel}>
              {LABELS[difficulty]}
              {stats[difficulty].bestMs !== null && (
                <span className={styles.best}>Best {formatTime(stats[difficulty].bestMs)}</span>
              )}
            </span>
            <span className={styles.size}>
              {SIZES[difficulty]}×{SIZES[difficulty]}
            </span>
          </button>
        ))}
      </div>
    </main>
  )
}
