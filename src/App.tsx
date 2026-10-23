import { useEffect, useRef, useState } from 'react'
import { setMuted, unlockAudio } from './audio/sfx'
import { ArtGallery } from './components/ArtGallery/ArtGallery'
import { Game } from './components/Game/Game'
import { Home } from './components/Home/Home'
import { HowToPlay } from './components/HowToPlay/HowToPlay'
import { Loading } from './components/Loading/Loading'
import { Settings } from './components/Settings/Settings'
import { DAILY_SIZE, dailyId, todayKey } from './game/daily'
import { debugArt } from './game/debug'
import { generateAsync, newFreePuzzle, newLevelPuzzle } from './game/generateAsync'
import { createGameState } from './game/reducer'
import { loadSettings, saveSettings } from './game/storage'
import type { Difficulty, GameState, Mode, Puzzle, Settings as SettingsData } from './game/types'
import styles from './App.module.css'

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

  useEffect(() => {
    setMuted(settings.muted)
  }, [settings.muted])

  // Browsers only allow audio after a user gesture.
  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio, { once: true })
    return () => window.removeEventListener('pointerdown', unlockAudio)
  }, [])

  const closeHowTo = () => {
    setHowToOpen(false)
    if (!settings.seenHowTo) changeSettings({ ...settings, seenHowTo: true })
  }

  const launchGame = async (mode: Mode, difficulty: Difficulty, generate: () => Promise<Puzzle>) => {
    const mine = ++launch.current
    setScreen({ name: 'loading' })
    const puzzle = await generate()
    if (launch.current !== mine) return
    setScreen({ name: 'game', initial: createGameState(mode, difficulty, puzzle) })
  }

  const play = (difficulty: Difficulty) => launchGame('free', difficulty, () => newFreePuzzle(difficulty))
  const playDaily = () => launchGame('daily', 'extreme', () => generateAsync(dailyId(todayKey()), DAILY_SIZE))
  const playLevel = (level: number) => launchGame('level', 'extreme', () => newLevelPuzzle(level))

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
          onPlayLevel={playLevel}
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
