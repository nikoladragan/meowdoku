import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generatePuzzle } from './generator'
import { createGameState, reducer } from './reducer'
import { clearGame, DEFAULT_SETTINGS, loadGame, loadSettings, saveGame, saveSettings } from './storage'

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  })
})
afterEach(() => vi.unstubAllGlobals())

const puzzle = generatePuzzle('free-1', 5)

describe('saveGame / loadGame', () => {
  it('strips lastEvent when saving and loads it as null', () => {
    let s = createGameState('free', 'easy', puzzle)
    s = reducer(s, { type: 'toggleCross', cell: 0 })
    expect(s.lastEvent).not.toBeNull()
    saveGame(s)
    expect(JSON.parse(store.get('meowdoku:v1:game:free')!).lastEvent).toBeNull()
    const loaded = loadGame('free')
    expect(loaded).toEqual({ ...s, lastEvent: null })
  })

  it('returns null when nothing is saved', () => {
    expect(loadGame('free')).toBeNull()
  })

  it.each([
    ['invalid JSON', '{nope'],
    ['wrong type', '42'],
    ['missing fields', '{"mode":"free"}'],
  ])('ignores a malformed value: %s', (_, raw) => {
    store.set('meowdoku:v1:game:free', raw)
    expect(loadGame('free')).toBeNull()
  })

  it('ignores a state with a marks array of the wrong length', () => {
    const s = createGameState('free', 'easy', puzzle)
    saveGame({ ...s, marks: s.marks.slice(1) })
    expect(loadGame('free')).toBeNull()
  })

  it('does not load a state saved under the other mode', () => {
    store.set('meowdoku:v1:game:daily', JSON.stringify(createGameState('free', 'easy', puzzle)))
    expect(loadGame('daily')).toBeNull()
  })

  it('clearGame removes the save', () => {
    saveGame(createGameState('free', 'easy', puzzle))
    clearGame('free')
    expect(loadGame('free')).toBeNull()
  })

  it('does not crash when storage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    })
    expect(() => saveGame(createGameState('free', 'easy', puzzle))).not.toThrow()
    expect(loadGame('free')).toBeNull()
  })
})

describe('settings', () => {
  it('uses defaults when nothing is saved', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('round-trips', () => {
    saveSettings({ ...DEFAULT_SETTINGS, autoCross: false })
    expect(loadSettings().autoCross).toBe(false)
  })

  it('falls back per field when the saved value is malformed', () => {
    store.set('meowdoku:v1:settings', '{"autoCross":"no","muted":true}')
    expect(loadSettings()).toEqual({ ...DEFAULT_SETTINGS, muted: true })
    store.set('meowdoku:v1:settings', '[[[')
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })
})
