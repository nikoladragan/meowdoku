import { useRef, useState } from 'react'
import styles from './App.module.css'
import { ArtGallery } from './components/ArtGallery/ArtGallery'
import { Game } from './components/Game/Game'
import { Home } from './components/Home/Home'
import { HowToPlay } from './components/HowToPlay/HowToPlay'
import { Loading } from './components/Loading/Loading'
import { Settings } from './components/Settings/Settings'
import { debugArt } from './game/debug'
import { newFreePuzzle } from './game/generateAsync'
import { DAILY_SIZE, dailyId, todayKey } from './game/daily'
import { generateAsync } from './game/generateAsync'
import { createGameState } from './game/reducer'
import { loadSettings, saveSettings } from './game/storage'
import type { Difficulty, GameState, Settings as SettingsData } from './game/types'

type Screen = { name: 'home' } | { name: 'loading' } | { name: 'game'; initial: GameState }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const launch = useRef(0)
  const [settings, setSettings] = useState<SettingsData>(loadSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  // Opens by itself on the first visit.
  const [howToOpen, setHowToOpen] = useState(() => !settings.seenHowTo)

  const changeSettings = (next: SettingsData) => {
    setSettings(next)
    saveSettings(next)
  }

  const closeHowTo = () => {
    setHowToOpen(false)
    if (!settings.seenHowTo) changeSettings({ ...settings, seenHowTo: true })
  }

  const play = async (difficulty: Difficulty) => {
    const mine = ++launch.current
    setScreen({ name: 'loading' })
    const puzzle = await newFreePuzzle(difficulty)
    if (launch.current !== mine) return
    setScreen({ name: 'game', initial: createGameState('free', difficulty, puzzle) })
  }

  const playDaily = async () => {
    const mine = ++launch.current
    setScreen({ name: 'loading' })
    const id = dailyId(todayKey())
    const puzzle = await generateAsync(id, DAILY_SIZE)
    if (launch.current !== mine) return
    setScreen({ name: 'game', initial: createGameState('daily', 'hard', puzzle) })
  }

  const home = () => {
    launch.current++
    setScreen({ name: 'home' })
  }

  if (debugArt) {
    return (
      <div className={styles.app}>
        <ArtGallery />
      </div>
    )
  }

  return (
    <div className={styles.app}>
      {screen.name === 'home' && (
        <Home
          onPlay={play}
          onPlayDaily={playDaily}
          onContinue={(initial) => setScreen({ name: 'game', initial })}
          onSettings={() => setSettingsOpen(true)}
          onHowTo={() => setHowToOpen(true)}
        />
      )}
      {screen.name === 'loading' && <Loading />}
      {screen.name === 'game' && (
        <Game
          initial={screen.initial}
          autoCross={settings.autoCross}
          paused={settingsOpen || howToOpen}
          onBack={home}
          onSettings={() => setSettingsOpen(true)}
        />
      )}
      {settingsOpen && (
        <Settings
          settings={settings}
          onChange={changeSettings}
          onHowTo={() => {
            setSettingsOpen(false)
            setHowToOpen(true)
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {howToOpen && <HowToPlay onClose={closeHowTo} />}
    </div>
  )
}
