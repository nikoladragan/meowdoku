import { useCallback, useEffect, useReducer } from 'react'
import { createGameState, reducer } from '../game/reducer'
import { clearGame, saveGame } from '../game/storage'
import type { Difficulty, GameState, Mode, Puzzle } from '../game/types'

export function useGame(initial: () => GameState, autoCross: boolean) {
  const [state, dispatch] = useReducer(reducer, undefined, initial)

  // Free play is only worth resuming while unfinished; a finished game is cleared.
  useEffect(() => {
    if (state.mode === 'free' && state.status !== 'playing') clearGame('free')
    else saveGame(state)
  }, [state])

  const start = useCallback(
    (mode: Mode, difficulty: Difficulty, puzzle: Puzzle) =>
      dispatch({ type: 'start', state: createGameState(mode, difficulty, puzzle) }),
    [],
  )
  const toggleCross = useCallback((cell: number) => dispatch({ type: 'toggleCross', cell }), [])
  const placeCat = useCallback(
    (cell: number) => dispatch({ type: 'placeCat', cell, fromDoubleTap: true, autoCross }),
    [autoCross],
  )
  const retry = useCallback(() => dispatch({ type: 'retry' }), [])

  return { state, start, toggleCross, placeCat, retry }
}
