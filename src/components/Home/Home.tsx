import { SIZES, type Difficulty } from '../../game/types'
import { TitleCat } from '../TitleCat/TitleCat'
import styles from './Home.module.css'

const DIFFICULTIES: { difficulty: Difficulty; label: string }[] = [
  { difficulty: 'easy', label: 'Easy' },
  { difficulty: 'normal', label: 'Normal' },
  { difficulty: 'hard', label: 'Hard' },
  { difficulty: 'extreme', label: 'Extreme' },
]

export function Home({ onPlay }: { onPlay: (difficulty: Difficulty) => void }) {
  return (
    <main className={styles.home}>
      <div className={styles.hero}>
        <TitleCat size={130} />
        <h1 className={styles.title}>Meowdoku</h1>
      </div>
      <div className={styles.buttons}>
        {DIFFICULTIES.map(({ difficulty, label }) => (
          <button key={difficulty} type="button" className={styles.diff} onClick={() => onPlay(difficulty)}>
            <span>{label}</span>
            <span className={styles.size}>
              {SIZES[difficulty]}×{SIZES[difficulty]}
            </span>
          </button>
        ))}
      </div>
    </main>
  )
}
