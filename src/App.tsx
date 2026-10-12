import styles from './App.module.css'
import { Home } from './components/Home/Home'

export default function App() {
  return (
    <div className={styles.app}>
      <Home />
    </div>
  )
}
