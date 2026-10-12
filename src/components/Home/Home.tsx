import { useState } from 'react'
import { loadGame } from '../../game/storage'
import { LABELS, SIZES, type Difficulty, type GameState } from '../../game/types'
import { TitleCat } from '../TitleCat/TitleCat'
import styles from './Home.module.css'

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard', 'extreme']

interface Props {
  onPlay: (difficulty: Difficulty) => void
  onContinue: (state: GameState) => void
}

export function Home({ onPlay, onContinue }: Props) {
  const [saved] = useState(() => loadGame('free'))
  return (
    <main className={styles.home}>
      <div className={styles.hero}>
        <TitleCat size={130} />
        <h1 className={styles.title}>Meowdoku</h1>
      </div>
      <div className={styles.buttons}>
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
            <span>{LABELS[difficulty]}</span>
            <span className={styles.size}>
              {SIZES[difficulty]}×{SIZES[difficulty]}
            </span>
          </button>
        ))}
      </div>
    </main>
  )
}
