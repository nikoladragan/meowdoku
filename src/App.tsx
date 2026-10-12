import styles from './App.module.css'
import { Game } from './components/Game/Game'
import { Home } from './components/Home/Home'

export default function App() {
  return (
    <div className={styles.app}>
      <Home />
      <Game />
    </div>
  )
}
