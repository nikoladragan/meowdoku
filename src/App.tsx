import { debugArt } from './game/debug'
import styles from './App.module.css'
import { Game } from './components/Game/Game'
import { ArtGallery } from './components/ArtGallery/ArtGallery'
import { Home } from './components/Home/Home'

export default function App() {
  return (
    <div className={styles.app}>
      {debugArt ? (
        <ArtGallery />
      ) : (
        <>
          <Home />
          <Game />
        </>
      )}
    </div>
  )
}
