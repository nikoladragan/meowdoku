import styles from './App.module.css'
import { ArtGallery } from './components/ArtGallery/ArtGallery'
import { Game } from './components/Game/Game'
import { debugArt } from './game/debug'

export default function App() {
  return <div className={styles.app}>{debugArt ? <ArtGallery /> : <Game />}</div>
}
