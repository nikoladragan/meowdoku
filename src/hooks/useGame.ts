import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { playSound } from '../audio/sfx'
import { levelNumber } from '../game/levels'
import { createGameState, reducer } from '../game/reducer'
import { recordWin } from '../game/stats'
import { clearGame, loadLevelsCleared, loadStats, saveGame, saveLevelsCleared, saveStats } from '../game/storage'
import type { Difficulty, GameEvent, GameState, Mode, Puzzle } from '../game/types'

export function useGame(initial: () => GameState, autoCross: boolean) {
  const [state, dispatch] = useReducer(reducer, undefined, initial)

  // Free play and levels are only worth resuming while unfinished; a finished game is cleared.
  useEffect(() => {
    if (state.mode !== 'daily' && state.status !== 'playing') clearGame(state.mode)
    else saveGame(state)
  }, [state])

  // Sound once per event. A loaded game has no event, so nothing plays on load.
  const played = useRef<GameEvent | null>(null)
  useEffect(() => {
    const e = state.lastEvent
    if (!e || e === played.current) return
    played.current = e
    playSound(e.kind)
  }, [state.lastEvent])

  // Record stats once per win event.
  const [winResult, setWinResult] = useState<{ counts: boolean; isBest: boolean } | null>(null)
  const handled = useRef<GameEvent | null>(null)
  useEffect(() => {
    const e = state.lastEvent
    if (e?.kind !== 'win' || e === handled.current) return
    handled.current = e
    // Levels only track progress, not best times.
    let r = { counts: true, isBest: false }
    if (state.mode === 'level') saveLevelsCleared(Math.max(loadLevelsCleared(), levelNumber(state.puzzle.id)))
    else {
      const win = recordWin(loadStats(), state)
      saveStats(win.stats)
      r = win
    }
    setWinResult({ counts: r.counts, isBest: r.isBest })
  }, [state])

  const start = useCallback((mode: Mode, difficulty: Difficulty, puzzle: Puzzle) => {
    setWinResult(null)
    dispatch({ type: 'start', state: createGameState(mode, difficulty, puzzle) })
  }, [])
  const toggleCross = useCallback((cell: number) => dispatch({ type: 'toggleCross', cell }), [])
  const placeCat = useCallback(
    (cell: number) => dispatch({ type: 'placeCat', cell, fromDoubleTap: true, autoCross }),
    [autoCross],
  )
  const undo = useCallback(() => dispatch({ type: 'undo' }), [])
  const crossCells = useCallback((cells: number[]) => dispatch({ type: 'crossCells', cells }), [])
  const placeCatDirect = useCallback((cell: number) => dispatch({ type: 'placeCat', cell, autoCross }), [autoCross])
  const hintShown = useCallback(() => dispatch({ type: 'hintShown' }), [])
  const tick = useCallback((deltaMs: number) => dispatch({ type: 'tick', deltaMs }), [])
  const retry = useCallback(() => dispatch({ type: 'retry' }), [])

  return {
    state,
    winResult,
    start,
    toggleCross,
    placeCat,
    placeCatDirect,
    crossCells,
    hintShown,
    undo,
    tick,
    retry,
  }
}
