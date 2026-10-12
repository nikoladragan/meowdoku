import { TitleCat } from '../TitleCat/TitleCat'
import styles from './Home.module.css'

export function Home() {
  return (
    <main className={styles.home}>
      <TitleCat size={56} />
      <h1 className={styles.title}>Meowdoku</h1>
    </main>
  )
}
